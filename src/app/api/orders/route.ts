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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    // Non-admins can only see their own orders
    if (!user.isAdmin) {
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
    const shippingCost = data.deliveryMethod === 'HAND_DELIVERY' ? new DecimalCtor(0) : new DecimalCtor(5.9);

    // Apply promo code if provided
    let discount = new DecimalCtor(0);
    let promoCodeId: string | undefined;

    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase() },
      });

      if (promo && promo.isActive) {
        const now = new Date();
        const validFrom = promo.validFrom || new Date(0);
        const validUntil = promo.validUntil || new Date('2099-12-31');

        if (now >= validFrom && now <= validUntil) {
          if (!promo.maxUses || promo.usedCount < promo.maxUses) {
            if (!promo.minPurchase || subtotal.gte(promo.minPurchase)) {
              promoCodeId = promo.id;

              if (promo.type === 'PERCENTAGE') {
                discount = subtotal.mul(promo.value).div(100);
                if (promo.maxDiscount && discount.gt(promo.maxDiscount)) {
                  discount = new DecimalCtor(promo.maxDiscount.toString());
                }
              } else if (promo.type === 'FIXED') {
                discount = new DecimalCtor(promo.value.toString());
              } else if (promo.type === 'FREE_SHIPPING') {
                discount = shippingCost;
              }
            }
          }
        }
      }
    }

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
        },
      });

      // Update promo code usage
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Decrement stock for variants
      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    return successResponse(order, 201);
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return serverErrorResponse();
  }
}
