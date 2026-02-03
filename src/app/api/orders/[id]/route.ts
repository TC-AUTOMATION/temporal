import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { updateOrderStatusSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { sanitizeNote } from '@/lib/sanitize';
import { sendEmail } from '@/lib/email/send';
import { orderShippedEmail, orderStatusUpdateEmail } from '@/lib/email/templates';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 * Get a single order
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        // Non-admins can only see their own orders
        ...(user.isAdmin ? {} : { userId: user.id }),
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
        },
        promoCode: {
          select: { code: true, type: true, value: true },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Commande non trouvée');
    }

    return successResponse(order);
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/orders/[id]
 * Update order status (admin only)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse('Commande non trouvée');
    }

    const data = validation.data;

    const updateData: Record<string, unknown> = {
      status: data.status,
    };

    if (data.trackingNumber !== undefined) {
      updateData.trackingNumber = data.trackingNumber;
    }
    if (data.trackingUrl !== undefined) {
      updateData.trackingUrl = data.trackingUrl;
    }
    if (data.adminNotes !== undefined) {
      updateData.adminNotes = sanitizeNote(data.adminNotes);
    }

    // Set timestamps based on status
    if (data.status === 'SHIPPED' && !existing.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (data.status === 'DELIVERED' && !existing.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: {
          select: { email: true, firstName: true },
        },
      },
    });

    // Send email notification based on status change
    if (order.customerEmail && existing.status !== data.status) {
      const orderInfo = {
        orderNumber: order.orderNumber,
        customerFirstName: order.customerFirstName,
      };

      try {
        switch (data.status) {
          case 'SHIPPED':
            // Send shipping notification with tracking info
            await sendEmail({
              to: order.customerEmail,
              subject: `Votre commande #${order.orderNumber} a été expédiée - Temporal`,
              html: orderShippedEmail(
                orderInfo,
                order.trackingNumber || undefined,
                order.trackingUrl || undefined
              ),
            });
            console.log(`Shipped email sent for order ${order.orderNumber}`);
            break;

          case 'DELIVERED':
            // Send delivery confirmation
            await sendEmail({
              to: order.customerEmail,
              subject: `Votre commande #${order.orderNumber} a été livrée - Temporal`,
              html: orderStatusUpdateEmail(orderInfo, 'DELIVERED'),
            });
            console.log(`Delivered email sent for order ${order.orderNumber}`);
            break;

          case 'CANCELLED':
            // Send cancellation notice
            await sendEmail({
              to: order.customerEmail,
              subject: `Votre commande #${order.orderNumber} a été annulée - Temporal`,
              html: orderStatusUpdateEmail(orderInfo, 'CANCELLED'),
            });
            console.log(`Cancelled email sent for order ${order.orderNumber}`);
            break;

          case 'CONFIRMED':
            // Send confirmation notice (if not already sent)
            await sendEmail({
              to: order.customerEmail,
              subject: `Votre commande #${order.orderNumber} est confirmée - Temporal`,
              html: orderStatusUpdateEmail(orderInfo, 'CONFIRMED'),
            });
            console.log(`Confirmed email sent for order ${order.orderNumber}`);
            break;
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return successResponse(order);
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel an order (user can cancel pending, admin can cancel any)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return notFoundResponse('Commande non trouvée');
    }

    // Users can only cancel their own pending orders
    if (!user.isAdmin) {
      if (order.userId !== user.id) {
        return forbiddenResponse();
      }
      if (order.status !== 'PENDING') {
        return forbiddenResponse('Seules les commandes en attente peuvent être annulées');
      }
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
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
    });

    return successResponse({ message: 'Commande annulée' });
  } catch (error) {
    console.error('DELETE /api/orders/[id] error:', error);
    return serverErrorResponse();
  }
}
