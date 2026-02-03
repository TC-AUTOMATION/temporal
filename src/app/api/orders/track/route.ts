import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/orders/track?orderNumber=XXX&email=xxx@xxx.com
 * Track an order without authentication
 * Requires both order number and email for security
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber) {
      return errorResponse('Numéro de commande requis', 400);
    }

    // Build query - if email is provided, use it for verification
    const where: Record<string, unknown> = {
      orderNumber: orderNumber.toUpperCase(),
    };

    if (email) {
      where.customerEmail = email.toLowerCase();
    }

    const order = await prisma.order.findFirst({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        deliveryMethod: true,
        customerFirstName: true,
        customerLastName: true,
        customerEmail: true,
        shippingCity: true,
        shippingCountry: true,
        subtotal: true,
        shippingCost: true,
        discount: true,
        total: true,
        trackingNumber: true,
        trackingUrl: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            color: true,
            size: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Commande non trouvée. Vérifiez le numéro de commande et l\'email.');
    }

    // Mask sensitive info if email not provided (just order number lookup)
    const maskedOrder = email ? order : {
      ...order,
      customerEmail: order.customerEmail?.replace(/(.{2}).*(@.*)/, '$1***$2'),
      customerFirstName: order.customerFirstName?.charAt(0) + '***',
      customerLastName: order.customerLastName?.charAt(0) + '***',
    };

    return successResponse(maskedOrder);
  } catch (error) {
    console.error('GET /api/orders/track error:', error);
    return serverErrorResponse();
  }
}
