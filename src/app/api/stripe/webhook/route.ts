import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import {
  notifyNewOrder,
  notifyPaymentFailed,
  notifyRefundIssued,
  notifyDisputeCreated,
  notifyOrderCancelled,
  createAdminNotification
} from '@/lib/notifications';
import { sendEmail } from '@/lib/email/send';
import { orderConfirmationEmail, paymentFailedEmail } from '@/lib/email/templates';
import { checkAndNotifyLowStock } from '@/lib/stockAlerts';
import { createShipmentForOrder } from '@/lib/boxtal';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Validate webhook secret exists at startup
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required for webhook security');
}

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * SUPPORTED EVENTS:
 *
 * Checkout Events:
 * - checkout.session.completed: Order payment successful, confirm order
 * - checkout.session.expired: Session expired, cancel order and restore stock
 *
 * Payment Intent Events:
 * - payment_intent.succeeded: Payment successful (logged only)
 * - payment_intent.payment_failed: Payment failed, notify admin and customer
 * - payment_intent.canceled: Payment canceled, cancel order and restore stock
 *
 * Charge Events:
 * - charge.failed: Charge failed, log error and notify
 * - charge.refunded: Refund issued, update order and restore stock if full refund
 *
 * Dispute Events (Chargebacks):
 * - charge.dispute.created: Dispute opened, urgent admin notification
 * - charge.dispute.updated: Dispute status updated, track progress
 * - charge.dispute.closed: Dispute resolved (won/lost), update order accordingly
 *
 * Subscription Events (Future):
 * - customer.subscription.created/updated/deleted: Placeholder for future subscriptions
 *
 * ERROR HANDLING:
 * - Each handler has try/catch to prevent one failure from breaking webhook
 * - Webhook always returns 200 to Stripe (even if individual handlers fail)
 * - All errors are logged for debugging
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event - each handler has its own error handling
    // to prevent one failure from breaking the entire webhook
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeFailed(charge);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute);
        break;
      }

      case 'charge.dispute.updated': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeUpdated(dispute);
        break;
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeClosed(dispute);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Placeholder for future subscription support
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription event: ${event.type}`, subscription.id);
        // TODO: Implement subscription handlers when subscriptions are added
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  try {
    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        stripePaymentId: session.payment_intent as string,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
            variant: {
              select: { color: true, size: true },
            },
          },
        },
        promoCode: {
          select: { code: true, type: true, value: true },
        },
      },
    });

    // Stock was decremented and promo usage incremented in /api/stripe route
    // Check stock levels and notify if low
    for (const item of order.items) {
      if (item.variantId) {
        await checkAndNotifyLowStock(item.variantId);
      }
    }

    // Create admin notification (includes email for hand delivery)
    await notifyNewOrder({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerPhone: order.customerPhone || undefined,
      total: Number(order.total),
      deliveryMethod: order.deliveryMethod,
      items: order.items.map(item => ({
        productName: item.product.name,
        variantName: item.variant ? `${item.variant.color} - ${item.variant.size}` : undefined,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
    });

    // Create shipment with Boxtal (for non-hand-delivery orders)
    let trackingNumber: string | undefined;
    let labelUrl: string | undefined;

    if (order.deliveryMethod !== 'HAND_DELIVERY') {
      try {
        // Extract relay info from customerNotes if present
        let relayCarrier: string | undefined;
        let relayPointCode: string | undefined;

        if (order.customerNotes?.startsWith('[POINT RELAIS:')) {
          const match = order.customerNotes.match(/\[POINT RELAIS:\s*(\w+)\s*-/);
          if (match) {
            relayCarrier = match[1].toLowerCase();
          }
        }

        // Also check shippingStreet for relay info
        if (order.shippingStreet?.startsWith('[RELAY:')) {
          const match = order.shippingStreet.match(/\[RELAY:([^\]]+)\]/);
          if (match) {
            const parts = match[1].split('-');
            if (parts.length >= 2) {
              relayCarrier = parts[0];
              relayPointCode = parts.slice(1).join('-');
            }
          }
        }

        const shipmentResult = await createShipmentForOrder({
          orderNumber: order.orderNumber,
          customerFirstName: order.customerFirstName,
          customerLastName: order.customerLastName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone || '',
          deliveryMethod: order.deliveryMethod as 'DELIVERY' | 'HAND_DELIVERY',
          shippingStreet: order.shippingStreet || undefined,
          shippingCity: order.shippingCity || undefined,
          shippingPostalCode: order.shippingPostalCode || undefined,
          shippingCountry: order.shippingCountry || 'FR',
          relayCarrier,
          relayPointCode,
        });

        if (shipmentResult.success) {
          trackingNumber = shipmentResult.trackingNumber;
          labelUrl = shipmentResult.labelUrl;

          // Update order with tracking info
          await prisma.order.update({
            where: { id: order.id },
            data: {
              trackingNumber: trackingNumber,
              adminNotes: order.adminNotes
                ? `${order.adminNotes}\n\n[EXPÉDITION CRÉÉE ${new Date().toISOString()}]\nN° suivi: ${trackingNumber}${labelUrl ? `\nÉtiquette: ${labelUrl}` : ''}`
                : `[EXPÉDITION CRÉÉE ${new Date().toISOString()}]\nN° suivi: ${trackingNumber}${labelUrl ? `\nÉtiquette: ${labelUrl}` : ''}`,
            },
          });

          console.log(`Boxtal shipment created for order ${order.orderNumber}: ${trackingNumber}`);
        } else {
          // Log error but don't fail the order
          console.error(`Failed to create Boxtal shipment for order ${order.orderNumber}: ${shipmentResult.error}`);

          // Notify admin of shipment creation failure
          await createAdminNotification({
            type: 'PAYMENT_FAILED',
            title: `⚠️ Échec création expédition - Commande #${order.orderNumber}`,
            message: `L'expédition Boxtal n'a pas pu être créée automatiquement: ${shipmentResult.error}. Créez l'expédition manuellement.`,
            data: { orderNumber: order.orderNumber, error: shipmentResult.error },
          });
        }
      } catch (shipmentError) {
        console.error(`Error creating shipment for order ${order.orderNumber}:`, shipmentError);
      }
    }

    // Send order confirmation email to customer
    const orderDetails = {
      orderNumber: order.orderNumber,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      items: order.items.map(item => ({
        productName: item.product.name,
        variantName: item.variant ? `${item.variant.color} - ${item.variant.size}` : undefined,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      promoDiscount: order.discount ? Number(order.discount) : undefined,
      total: Number(order.total),
      deliveryMethod: order.deliveryMethod,
      deliveryAddress: order.shippingStreet ? {
        street: order.shippingStreet,
        postalCode: order.shippingPostalCode || '',
        city: order.shippingCity || '',
        country: order.shippingCountry || 'France',
      } : undefined,
      relayPointName: undefined,
      relayPointAddress: undefined,
      trackingNumber, // Include tracking number in email if available
    };

    await sendEmail({
      to: order.customerEmail,
      subject: `Commande confirmée #${order.orderNumber} - Temporal`,
      html: orderConfirmationEmail(orderDetails),
    });

    console.log(`Order ${order.orderNumber} confirmed and paid - confirmation email sent${trackingNumber ? ` - tracking: ${trackingNumber}` : ''}`);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

/**
 * Handle expired checkout session - restore stock and promo code usage
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) return;

  try {
    // Get order with items to restore stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== 'PENDING') return;

    // Cancel the pending order, restore stock and promo code usage
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          adminNotes: 'Session de paiement expirée - Stock et code promo restaurés automatiquement',
        },
      });

      // Restore stock for variants
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Restore promo code usage if one was used
      if (order.promoCodeId) {
        await tx.promoCode.update({
          where: { id: order.promoCodeId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    });

    console.log(`Order ${orderId} cancelled due to expired session - stock and promo restored`);
  } catch (error) {
    console.error('Error handling checkout expired:', error);
  }
}

/**
 * Handle failed payment - send email to customer
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find order by payment intent or session
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { stripePaymentId: paymentIntent.id },
        { stripeSessionId: paymentIntent.metadata?.sessionId },
      ],
    },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        adminNotes: order.adminNotes
          ? `${order.adminNotes}\n\n[PAIEMENT ÉCHOUÉ ${new Date().toISOString()}]\n${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`
          : `[PAIEMENT ÉCHOUÉ ${new Date().toISOString()}]\n${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`,
      },
    });

    // Create admin notification
    await notifyPaymentFailed({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      error: paymentIntent.last_payment_error?.message || undefined,
    });

    // Send payment failed email to customer
    try {
      await sendEmail({
        to: order.customerEmail,
        subject: `Échec du paiement - Commande #${order.orderNumber} - Temporal`,
        html: paymentFailedEmail({
          orderNumber: order.orderNumber,
          customerFirstName: order.customerFirstName,
          errorMessage: paymentIntent.last_payment_error?.message || undefined,
        }),
      });
      console.log(`Payment failed email sent for order ${order.orderNumber}`);
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError);
    }

    console.log(`Payment failed for order ${order.orderNumber}`);
  }
}

/**
 * Handle refund from Stripe (external refund or via dashboard)
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.log('No payment_intent on charge refund');
    return;
  }

  // Find order by payment intent
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
    include: { items: true },
  });

  if (!order) {
    console.log(`No order found for payment_intent ${paymentIntentId}`);
    return;
  }

  // Check if already refunded
  if (order.status === 'REFUNDED') {
    console.log(`Order ${order.orderNumber} already marked as refunded`);
    return;
  }

  const refundedAmount = charge.amount_refunded / 100;
  const totalAmount = Number(order.total);
  const isFullRefund = refundedAmount >= totalAmount;

  try {
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: isFullRefund ? 'REFUNDED' : order.status,
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PAID',
          adminNotes: order.adminNotes
            ? `${order.adminNotes}\n\n[REMBOURSEMENT STRIPE ${new Date().toISOString()}]\nMontant: ${refundedAmount.toFixed(2)}€ (via Stripe)`
            : `[REMBOURSEMENT STRIPE ${new Date().toISOString()}]\nMontant: ${refundedAmount.toFixed(2)}€ (via Stripe)`,
        },
      });

      // Restore stock for full refunds
      if (isFullRefund) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    });

    // Create admin notification
    await notifyRefundIssued({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      amount: refundedAmount,
      reason: 'Remboursement via Stripe Dashboard',
    });

    console.log(`Order ${order.orderNumber} refunded via Stripe: ${refundedAmount.toFixed(2)}€`);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

/**
 * Handle dispute/chargeback created
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    // Find order if possible
    let orderNumber: string | undefined;
    if (paymentIntentId) {
      const order = await prisma.order.findFirst({
        where: { stripePaymentId: paymentIntentId },
      });
      if (order) {
        orderNumber = order.orderNumber;

        // Add note to order
        await prisma.order.update({
          where: { id: order.id },
          data: {
            adminNotes: order.adminNotes
              ? `${order.adminNotes}\n\n[⚠️ LITIGE ${new Date().toISOString()}]\nRaison: ${dispute.reason}\nMontant contesté: ${(dispute.amount / 100).toFixed(2)}€\nStatut: ${dispute.status}`
              : `[⚠️ LITIGE ${new Date().toISOString()}]\nRaison: ${dispute.reason}\nMontant contesté: ${(dispute.amount / 100).toFixed(2)}€\nStatut: ${dispute.status}`,
          },
        });
      }
    }

    // Create urgent admin notification
    await notifyDisputeCreated({
      orderNumber,
      paymentIntentId: paymentIntentId || 'unknown',
      amount: dispute.amount / 100,
      reason: dispute.reason || 'Non spécifié',
    });

    console.log(`DISPUTE CREATED for ${orderNumber || paymentIntentId}: ${dispute.reason} - ${(dispute.amount / 100).toFixed(2)}€`);
  } catch (error) {
    console.error('Error handling dispute created:', error);
  }
}

/**
 * Handle payment intent canceled - cancel the order
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { stripePaymentId: paymentIntent.id },
          { stripeSessionId: paymentIntent.metadata?.sessionId },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      console.log('No order found for canceled payment intent:', paymentIntent.id);
      return;
    }

    // If already canceled, skip
    if (order.status === 'CANCELLED') {
      console.log(`Order ${order.orderNumber} already canceled`);
      return;
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          adminNotes: order.adminNotes
            ? `${order.adminNotes}\n\n[PAIEMENT ANNULÉ ${new Date().toISOString()}]\nRaison: ${paymentIntent.cancellation_reason || 'Non spécifiée'}`
            : `[PAIEMENT ANNULÉ ${new Date().toISOString()}]\nRaison: ${paymentIntent.cancellation_reason || 'Non spécifiée'}`,
        },
      });

      // Restore stock for variants
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Restore promo code usage
      if (order.promoCodeId) {
        await tx.promoCode.update({
          where: { id: order.promoCodeId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    });

    // Create admin notification
    await notifyOrderCancelled({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      reason: paymentIntent.cancellation_reason || 'Paiement annulé par Stripe',
    });

    console.log(`Order ${order.orderNumber} canceled - payment intent canceled`);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

/**
 * Handle charge failed - log failure, notify admin
 */
async function handleChargeFailed(charge: Stripe.Charge) {
  try {
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.log('No payment_intent on failed charge');
      return;
    }

    // Find order by payment intent
    const order = await prisma.order.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });

    if (order) {
      // Update order with failure details
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          adminNotes: order.adminNotes
            ? `${order.adminNotes}\n\n[CHARGE ÉCHOUÉ ${new Date().toISOString()}]\n${charge.failure_message || 'Erreur inconnue'}\nCode: ${charge.failure_code || 'N/A'}`
            : `[CHARGE ÉCHOUÉ ${new Date().toISOString()}]\n${charge.failure_message || 'Erreur inconnue'}\nCode: ${charge.failure_code || 'N/A'}`,
        },
      });

      // Create admin notification
      await notifyPaymentFailed({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        error: charge.failure_message || undefined,
      });

      // Send email to customer if not already sent by payment_intent.payment_failed
      try {
        await sendEmail({
          to: order.customerEmail,
          subject: `Échec du paiement - Commande #${order.orderNumber} - Temporal`,
          html: paymentFailedEmail({
            orderNumber: order.orderNumber,
            customerFirstName: order.customerFirstName,
            errorMessage: charge.failure_message || undefined,
          }),
        });
        console.log(`Charge failed email sent for order ${order.orderNumber}`);
      } catch (emailError) {
        console.error('Failed to send charge failed email:', emailError);
      }

      console.log(`Charge failed for order ${order.orderNumber}: ${charge.failure_message}`);
    }
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

/**
 * Handle dispute updated - track dispute progress
 */
async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  try {
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    if (!paymentIntentId) return;

    const order = await prisma.order.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });

    if (order) {
      // Update order notes with dispute status change
      await prisma.order.update({
        where: { id: order.id },
        data: {
          adminNotes: order.adminNotes
            ? `${order.adminNotes}\n\n[LITIGE MISE À JOUR ${new Date().toISOString()}]\nStatut: ${dispute.status}\n${dispute.status === 'warning_under_review' ? '⚠️ En cours de révision' : ''}`
            : `[LITIGE MISE À JOUR ${new Date().toISOString()}]\nStatut: ${dispute.status}`,
        },
      });

      console.log(`Dispute updated for order ${order.orderNumber}: status=${dispute.status}`);
    }
  } catch (error) {
    console.error('Error handling dispute updated:', error);
  }
}

/**
 * Handle dispute closed - final outcome (won/lost)
 */
async function handleDisputeClosed(dispute: Stripe.Dispute) {
  try {
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    if (!paymentIntentId) return;

    const order = await prisma.order.findFirst({
      where: { stripePaymentId: paymentIntentId },
      include: { items: true },
    });

    if (order) {
      const disputeWon = dispute.status === 'won';
      const disputeLost = dispute.status === 'lost';

      // Update order based on outcome
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: disputeLost ? 'REFUNDED' : order.status,
            paymentStatus: disputeLost ? 'REFUNDED' : order.paymentStatus,
            adminNotes: order.adminNotes
              ? `${order.adminNotes}\n\n[${disputeWon ? '✅ LITIGE GAGNÉ' : '❌ LITIGE PERDU'} ${new Date().toISOString()}]\nStatut final: ${dispute.status}\nMontant: ${(dispute.amount / 100).toFixed(2)}€`
              : `[${disputeWon ? '✅ LITIGE GAGNÉ' : '❌ LITIGE PERDU'} ${new Date().toISOString()}]\nStatut final: ${dispute.status}\nMontant: ${(dispute.amount / 100).toFixed(2)}€`,
          },
        });

        // If dispute lost, restore stock
        if (disputeLost) {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }
      });

      // Create admin notification for dispute outcome
      await createAdminNotification({
        type: 'DISPUTE_CREATED', // Reuse dispute type for outcome
        title: `${disputeWon ? '✅ Litige gagné' : '❌ Litige perdu'} - Commande #${order.orderNumber}`,
        message: `Le litige pour la commande ${order.orderNumber} a été ${disputeWon ? 'gagné' : 'perdu'}. Montant: ${(dispute.amount / 100).toFixed(2)}€`,
        data: {
          orderNumber: order.orderNumber,
          paymentIntentId,
          amount: dispute.amount / 100,
          status: dispute.status,
          outcome: disputeWon ? 'won' : 'lost',
        },
      });

      console.log(`Dispute closed for order ${order.orderNumber}: ${dispute.status}`);
    }
  } catch (error) {
    console.error('Error handling dispute closed:', error);
  }
}

// No special config needed - App Router handles raw body automatically with request.text()
