import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createOrderSchema } from '@/lib/validations';
import { getCurrentUser, generateOrderNumber } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { Prisma } from '@prisma/client';
import { sanitizeNote } from '@/lib/sanitize';
import { getGaugeConfig, getFreeShippingThreshold } from '@/lib/gauge';
import { decrementStockWithHistory } from '@/lib/stock';
import { resolveOrderPromo } from '@/lib/promo';

type DecimalType = Prisma.Decimal;
const DecimalCtor = Prisma.Decimal;

/**
 * GET /api/orders
 * Get orders - users see their own, admins see all
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const mine = searchParams.get('mine');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    // Non-admins can only see their own orders; admins see all unless ?mine=true
    if (!user.isAdmin || mine === 'true') {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true },
              },
            },
          },
          promoCode: {
            select: { code: true, type: true, value: true },
          },
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          shipment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Validate products exist and have stock
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    if (products.length !== productIds.length) {
      return errorResponse('Un ou plusieurs produits sont introuvables');
    }

    // Calculate totals and validate stock
    let subtotal = new DecimalCtor(0);
    const orderItems: Array<{
      productId: string;
      variantId?: string;
      productName: string;
      productSku: string;
      color?: string;
      size?: string;
      quantity: number;
      unitPrice: DecimalType;
      totalPrice: DecimalType;
    }> = [];

    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      // Find variant if size/color specified
      let variant = null;
      if (item.size || item.color) {
        variant = product.variants.find(
          v => v.size === item.size && v.color === item.color && v.isActive
        );
        if (variant && variant.stock < item.quantity) {
          return errorResponse(`Stock insuffisant pour ${product.name} (${item.color} - ${item.size})`);
        }
      }

      const unitPrice = new DecimalCtor(product.price.toString());
      const totalPrice = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(totalPrice);

      orderItems.push({
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        productSku: variant?.sku || product.sku,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Calculate shipping
    const isRelay = data.deliveryMethod === 'RELAY';
    const isHandDelivery = data.deliveryMethod === 'HAND_DELIVERY';
    let shippingCost = isHandDelivery ? new DecimalCtor(0) : isRelay ? new DecimalCtor(3.9) : new DecimalCtor(5.9);

    // Apply free shipping if the cart reached the gauge threshold
    if (!isHandDelivery) {
      const gaugeConfig = await getGaugeConfig();
      const freeShippingThreshold = getFreeShippingThreshold(gaugeConfig);
      if (freeShippingThreshold != null && subtotal.gte(freeShippingThreshold)) {
        shippingCost = new DecimalCtor(0);
      }
    }

    // Promo : code saisi OU promo automatique active, la plus avantageuse
    const promoResult = await resolveOrderPromo(prisma, {
      code: data.promoCode,
      userId: user?.id,
      ctx: {
        subtotal,
        shippingCost,
        lines: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    });
    const discount = promoResult?.discount ?? new DecimalCtor(0);
    const promoCodeId: string | undefined = promoResult?.promo.id;

    const total = subtotal.add(shippingCost).sub(discount);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user?.id,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerFirstName: data.customerFirstName,
          customerLastName: data.customerLastName,
          shippingStreet: data.shippingStreet,
          shippingCity: data.shippingCity,
          shippingPostalCode: data.shippingPostalCode,
          shippingCountry: data.shippingCountry,
          // Relay point info
          relayCarrier: data.relayCarrier || null,
          relayPointCode: data.relayPointCode || null,
          relayPointName: data.relayPointName || null,
          relayPointAddress: data.relayPointAddress || null,
          subtotal,
          shippingCost,
          discount,
          total,
          deliveryMethod: data.deliveryMethod,
          promoCodeId,
          customerNotes: sanitizeNote(data.customerNotes),
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          shipment: true,
        },
      });

      // Increment promo code usage (direct order = already paid/admin)
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Atomic stock decrement with guard (y compris composants des bundles)
      const decrementOps = orderItems
        .filter((item) => item.variantId)
        .map((item) => ({ id: item.variantId as string, quantity: item.quantity }));
      await decrementStockWithHistory(tx, decrementOps, {
        source: 'AUTO',
        reason: 'ORDER',
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
      });

      return newOrder;
    });

    return successResponse(order, 201);
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return serverErrorResponse();
  }
}
