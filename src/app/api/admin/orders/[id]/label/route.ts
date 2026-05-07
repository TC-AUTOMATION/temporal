import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/orders/[id]/label
 * Get shipping label URL for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: id },
      select: {
        id: true,
        labelUrl: true,
        carrier: true,
        trackingNumber: true,
        order: {
          select: {
            orderNumber: true,
            customerFirstName: true,
            customerLastName: true,
            shippingStreet: true,
            shippingCity: true,
            shippingPostalCode: true,
            shippingCountry: true,
            deliveryMethod: true,
            relayPointName: true,
            relayPointAddress: true,
          },
        },
      },
    });

    if (!shipment) {
      return notFoundResponse('Aucun envoi trouvé - créez d\'abord l\'expédition');
    }

    return successResponse({
      labelUrl: shipment.labelUrl,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      order: shipment.order,
    });
  } catch (error) {
    console.error('GET /api/admin/orders/[id]/label error:', error);
    return serverErrorResponse();
  }
}
