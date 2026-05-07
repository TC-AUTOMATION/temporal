import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { sendEmail } from '@/lib/email/send';
import { orderRefundedEmail } from '@/lib/email/templates';
import { notifyRefundIssued } from '@/lib/notifications';
import { expandWithBundleComponents } from '@/lib/stock';

interface Params {
  params: Promise<{ id: string }>;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

/**
 * POST /api/orders/[id]/refund
 * Process a refund for an order (admin only)
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason, amount } = body as { reason?: string; amount?: number };

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Commande non trouvée');
    }

    // Check if order can be refunded
    if (order.status === 'REFUNDED') {
      return errorResponse('Cette commande a déjà été remboursée', 400);
    }

    if (order.paymentStatus !== 'PAID') {
      return errorResponse('Cette commande n\'a pas été payée', 400);
    }

    if (!order.stripePaymentId) {
      return errorResponse('Aucun paiement Stripe associé à cette commande', 400);
    }

    const stripe = getStripe();

    // Calculate refund amount (full refund by default)
    const refundAmount = amount
      ? Math.round(amount * 100) // Convert to cents
      : Math.round(Number(order.total) * 100);

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        adminReason: reason || 'Refund requested by admin',
      },
    });

    // Determine if full or partial refund
    const isFullRefund = refundAmount >= Math.round(Number(order.total) * 100);

    // Update order status
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id },
        data: {
          status: isFullRefund ? 'REFUNDED' : order.status,
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PAID',
          adminNotes: order.adminNotes
            ? `${order.adminNotes}\n\n[REMBOURSEMENT ${new Date().toISOString()}]\nMontant: ${(refundAmount / 100).toFixed(2)}€\nRaison: ${reason || 'Non spécifiée'}\nStripe Refund ID: ${refund.id}`
            : `[REMBOURSEMENT ${new Date().toISOString()}]\nMontant: ${(refundAmount / 100).toFixed(2)}€\nRaison: ${reason || 'Non spécifiée'}\nStripe Refund ID: ${refund.id}`,
        },
      });

      // Restore stock for full refunds (y compris composants des bundles)
      if (isFullRefund) {
        const restoreOps = order.items
          .filter((item) => item.variantId)
          .map((item) => ({ id: item.variantId as string, quantity: item.quantity }));
        const expandedRestore = await expandWithBundleComponents(tx, restoreOps);
        for (const v of expandedRestore) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { stock: { increment: v.quantity } },
          });
        }
      }
    });

    // Send refund email to customer
    if (order.customerEmail) {
      try {
        await sendEmail({
          to: order.customerEmail,
          subject: `Remboursement de votre commande #${order.orderNumber} - Temporal`,
          html: orderRefundedEmail({
            orderNumber: order.orderNumber,
            customerFirstName: order.customerFirstName,
            refundAmount: refundAmount / 100,
            isPartial: !isFullRefund,
            reason: reason,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send refund email:', emailError);
      }
    }

    // Create admin notification
    await notifyRefundIssued({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      amount: refundAmount / 100,
      reason: reason,
    });

    console.log(`Refund processed for order ${order.orderNumber}: ${(refundAmount / 100).toFixed(2)}€`);

    return successResponse({
      message: 'Remboursement effectué avec succès',
      refundId: refund.id,
      amount: refundAmount / 100,
      isFullRefund,
    });
  } catch (error) {
    console.error('POST /api/orders/[id]/refund error:', error);

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return errorResponse(`Erreur Stripe: ${error.message}`, 400);
    }

    return serverErrorResponse();
  }
}
