import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { createShipmentForOrder } from '@/lib/boxtal';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';

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

/**
 * POST /api/admin/orders/[id]/shipment
 * Create a Boxtal shipment for an order
 */
export async function POST(
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
      include: {
        shipment: true,
        items: true,
      },
    });

    if (!order) return notFoundResponse('Commande introuvable');

    // Don't create duplicate shipments
    if (order.shipment?.trackingNumber && order.shipment.status !== 'pending') {
      return errorResponse('Un envoi existe déjà pour cette commande');
    }

    // Parse optional body for custom parcel dimensions
    let parcelOverride;
    try {
      const body = await request.json();
      if (body.weight || body.length || body.width || body.height) {
        parcelOverride = {
          weight: body.weight,
          length: body.length,
          width: body.width,
          height: body.height,
        };
      }
    } catch {
      // No body provided, use defaults
    }

    // Create shipment via Boxtal
    const result = await createShipmentForOrder({
      orderNumber: order.orderNumber,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || '',
      deliveryMethod: order.deliveryMethod,
      shippingStreet: order.shippingStreet || undefined,
      shippingCity: order.shippingCity || undefined,
      shippingPostalCode: order.shippingPostalCode || undefined,
      shippingCountry: order.shippingCountry || undefined,
      billingStreet: order.billingStreet || undefined,
      billingCity: order.billingCity || undefined,
      billingPostalCode: order.billingPostalCode || undefined,
      billingCountry: order.billingCountry || undefined,
      relayCarrier: order.relayCarrier || undefined,
      relayPointCode: order.relayPointCode || undefined,
      relayPointName: order.relayPointName || undefined,
    });

    if (!result.success) {
      return errorResponse(result.error || 'Erreur lors de la création de l\'envoi Boxtal');
    }

    // Determine carrier from order
    let carrier = order.relayCarrier || 'colissimo';
    if (order.deliveryMethod === 'HAND_DELIVERY') {
      carrier = 'main_propre';
    }

    // Calculate total weight from items
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedWeight = parcelOverride?.weight || totalItems * 0.3;

    // Generate tracking URL from carrier and tracking number
    const trackingUrl = result.trackingNumber ? getTrackingUrl(carrier, result.trackingNumber) : null;

    // Save or update shipment record
    const shipment = await prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        boxtalReference: result.trackingNumber || null,
        carrier: carrier,
        trackingNumber: result.trackingNumber || null,
        trackingUrl: trackingUrl,
        labelUrl: result.labelUrl || null,
        status: 'created',
        weight: estimatedWeight,
        dimensions: parcelOverride ? {
          length: parcelOverride.length || 30,
          width: parcelOverride.width || 25,
          height: parcelOverride.height || 5,
        } : { length: 30, width: 25, height: 5 },
      },
      update: {
        boxtalReference: result.trackingNumber || undefined,
        carrier: carrier,
        trackingNumber: result.trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
        labelUrl: result.labelUrl || undefined,
        status: 'created',
      },
    });

    // Update order with tracking info and URL
    await prisma.order.update({
      where: { id: order.id },
      data: {
        trackingNumber: result.trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
        status: order.deliveryMethod === 'HAND_DELIVERY' ? order.status : 'PREPARING',
      },
    });

    return successResponse({
      shipment,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
    });
  } catch (error) {
    console.error('POST /api/admin/orders/[id]/shipment error:', error);
    return serverErrorResponse();
  }
}

/**
 * GET /api/admin/orders/[id]/shipment
 * Get shipment details for an order
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
      include: {
        order: {
          select: {
            orderNumber: true,
            customerFirstName: true,
            customerLastName: true,
            deliveryMethod: true,
            relayCarrier: true,
            relayPointName: true,
            relayPointAddress: true,
          },
        },
      },
    });

    if (!shipment) {
      return notFoundResponse('Aucun envoi trouvé pour cette commande');
    }

    return successResponse(shipment);
  } catch (error) {
    console.error('GET /api/admin/orders/[id]/shipment error:', error);
    return serverErrorResponse();
  }
}
