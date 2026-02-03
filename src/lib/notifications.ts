import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { sendEmail } from '@/lib/email/send';
import { adminHandDeliveryNotificationEmail } from '@/lib/email/templates';

// Admin email for notifications (from env or default)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@temporal.shop';

type NotificationType =
  | 'NEW_ORDER'
  | 'HAND_DELIVERY_REQUEST'
  | 'LOW_STOCK'
  | 'NEW_USER'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'REFUND_ISSUED'
  | 'DISPUTE_CREATED';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create an admin notification
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data as Prisma.InputJsonValue | undefined,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create notification for a new order
 */
export async function notifyNewOrder(order: {
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  total: number;
  deliveryMethod: string;
  items?: Array<{
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
}) {
  const isHandDelivery = order.deliveryMethod === 'HAND_DELIVERY';

  // Create standard new order notification
  await createAdminNotification({
    type: 'NEW_ORDER',
    title: `Nouvelle commande #${order.orderNumber}`,
    message: `${order.customerFirstName} ${order.customerLastName} (${order.customerEmail}) - ${Number(order.total).toFixed(2)}€`,
    data: {
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      total: order.total,
    },
  });

  // If hand delivery, create additional urgent notification and send email to admin
  if (isHandDelivery) {
    await createAdminNotification({
      type: 'HAND_DELIVERY_REQUEST',
      title: `⚠️ MAIN PROPRE - Commande #${order.orderNumber}`,
      message: `${order.customerFirstName} ${order.customerLastName} a choisi la livraison MAIN PROPRE. Validation manuelle requise.`,
      data: {
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerName: `${order.customerFirstName} ${order.customerLastName}`,
        total: order.total,
        requiresManualApproval: true,
      },
    });

    // Send email notification to admin for hand delivery orders
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `⚠️ MAIN PROPRE - Commande #${order.orderNumber} - Action requise`,
        html: adminHandDeliveryNotificationEmail({
          orderNumber: order.orderNumber,
          customerFirstName: order.customerFirstName,
          customerLastName: order.customerLastName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          total: order.total,
          items: order.items || [],
        }),
      });
      console.log(`[NOTIFICATION] Hand delivery email sent to admin for order ${order.orderNumber}`);
    } catch (error) {
      console.error(`[NOTIFICATION] Failed to send hand delivery email:`, error);
    }
  }
}

/**
 * Create notification for payment failure
 */
export async function notifyPaymentFailed(order: {
  orderNumber: string;
  customerEmail: string;
  error?: string;
}) {
  await createAdminNotification({
    type: 'PAYMENT_FAILED',
    title: `Paiement échoué - Commande #${order.orderNumber}`,
    message: `Le paiement de ${order.customerEmail} a échoué. ${order.error || ''}`,
    data: {
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      error: order.error,
    },
  });
}

/**
 * Create notification for order cancellation
 */
export async function notifyOrderCancelled(order: {
  orderNumber: string;
  customerEmail: string;
  reason?: string;
}) {
  await createAdminNotification({
    type: 'ORDER_CANCELLED',
    title: `Commande annulée #${order.orderNumber}`,
    message: `La commande de ${order.customerEmail} a été annulée. ${order.reason || ''}`,
    data: {
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      reason: order.reason,
    },
  });
}

/**
 * Create notification for new user registration
 */
export async function notifyNewUser(user: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const name = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  await createAdminNotification({
    type: 'NEW_USER',
    title: 'Nouvel utilisateur inscrit',
    message: `${name} vient de créer un compte.`,
    data: {
      email: user.email,
      name,
    },
  });
}

/**
 * Create notification for refund issued
 */
export async function notifyRefundIssued(refund: {
  orderNumber: string;
  customerEmail: string;
  amount: number;
  reason?: string;
}) {
  await createAdminNotification({
    type: 'REFUND_ISSUED',
    title: `Remboursement effectué - Commande #${refund.orderNumber}`,
    message: `${Number(refund.amount).toFixed(2)}€ remboursé à ${refund.customerEmail}. ${refund.reason || ''}`,
    data: {
      orderNumber: refund.orderNumber,
      customerEmail: refund.customerEmail,
      amount: refund.amount,
      reason: refund.reason,
    },
  });
}

/**
 * Create notification for dispute/chargeback
 */
export async function notifyDisputeCreated(dispute: {
  orderNumber?: string;
  paymentIntentId: string;
  amount: number;
  reason: string;
}) {
  await createAdminNotification({
    type: 'DISPUTE_CREATED',
    title: `⚠️ LITIGE - ${dispute.orderNumber ? `Commande #${dispute.orderNumber}` : 'Paiement contesté'}`,
    message: `Un client conteste un paiement de ${Number(dispute.amount).toFixed(2)}€. Raison: ${dispute.reason}. ACTION REQUISE.`,
    data: {
      orderNumber: dispute.orderNumber,
      paymentIntentId: dispute.paymentIntentId,
      amount: dispute.amount,
      reason: dispute.reason,
      urgent: true,
    },
  });
}
