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
 * GET /api/admin/orders/[id]/tracking
 * Get tracking info for an order
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

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        trackingNumber: true,
        trackingUrl: true,
        status: true,
        deliveryMethod: true,
        shippedAt: true,
        deliveredAt: true,
        relayCarrier: true,
        relayPointCode: true,
        relayPointName: true,
        relayPointAddress: true,
        shipment: {
          select: {
            id: true,
            boxtalReference: true,
            carrier: true,
            trackingNumber: true,
            trackingUrl: true,
            labelUrl: true,
            status: true,
            weight: true,
            dimensions: true,
            shippedAt: true,
            deliveredAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Commande introuvable');
    }

    // Build tracking URL based on carrier
    let trackingUrl = order.trackingUrl || order.shipment?.trackingUrl;
    if (!trackingUrl && order.trackingNumber) {
      const carrier = order.relayCarrier || order.shipment?.carrier || 'colissimo';
      trackingUrl = getTrackingUrl(carrier, order.trackingNumber);
    }

    return successResponse({
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryMethod: order.deliveryMethod,
      trackingNumber: order.trackingNumber || order.shipment?.trackingNumber,
      trackingUrl,
      carrier: order.relayCarrier || order.shipment?.carrier,
      shipment: order.shipment,
      relay: order.relayPointCode ? {
        carrier: order.relayCarrier,
        code: order.relayPointCode,
        name: order.relayPointName,
        address: order.relayPointAddress,
      } : null,
      shippedAt: order.shippedAt || order.shipment?.shippedAt,
      deliveredAt: order.deliveredAt || order.shipment?.deliveredAt,
    });
  } catch (error) {
    console.error('GET /api/admin/orders/[id]/tracking error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/orders/[id]/tracking
 * Update tracking info manually
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFoundResponse('Commande introuvable');

    const updateData: Record<string, unknown> = {};
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.trackingUrl !== undefined) updateData.trackingUrl = body.trackingUrl;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Also update shipment if it exists
    if (order.id) {
      const shipment = await prisma.shipment.findUnique({ where: { orderId: order.id } });
      if (shipment) {
        const shipmentUpdate: Record<string, unknown> = {};
        if (body.trackingNumber) shipmentUpdate.trackingNumber = body.trackingNumber;
        if (body.trackingUrl) shipmentUpdate.trackingUrl = body.trackingUrl;
        if (body.shipmentStatus) shipmentUpdate.status = body.shipmentStatus;
        if (Object.keys(shipmentUpdate).length > 0) {
          await prisma.shipment.update({
            where: { orderId: order.id },
            data: shipmentUpdate,
          });
        }
      }
    }

    return successResponse(updated);
  } catch (error) {
    console.error('PUT /api/admin/orders/[id]/tracking error:', error);
    return serverErrorResponse();
  }
}

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const urls: Record<string, string> = {
    'mondial_relay': `https://www.mondialrelay.fr/suivi-de-colis?NumEnvoi=${trackingNumber}`,
    'colissimo': `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
    'chronopost': `https://www.chronopost.fr/tracking-no-powerful/tracking-show/${trackingNumber}`,
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'dhl': `https://www.dhl.com/fr-fr/home/suivi.html?tracking-id=${trackingNumber}`,
  };
  return urls[carrier] || '';
}
