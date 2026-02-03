import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { checkoutSchema } from '@/lib/validations';
import { getCurrentUser, generateOrderNumber } from '@/lib/auth/jwt';
import { Prisma } from '@prisma/client';

type DecimalType = Prisma.Decimal;
const DecimalCtor = Prisma.Decimal;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

/**
 * POST /api/stripe
 * Create a Stripe checkout session and prepare the order
 * All stock validation and decrement happens inside a transaction to prevent race conditions
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const user = await getCurrentUser();
    const body = await request.json();

    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Determine delivery method and shipping
    const isRelay = data.deliveryMethod === 'RELAY';
    const isHandDelivery = data.deliveryMethod === 'HAND_DELIVERY';
    const isHomeDelivery = data.deliveryMethod === 'DELIVERY';

    let shippingCost = new DecimalCtor(0);
    let shippingName = '';
    let shippingDescription = '';

    if (isHandDelivery) {
      shippingCost = new DecimalCtor(0);
      shippingName = 'Remise en main propre';
      shippingDescription = 'Sur rendez-vous';
    } else if (isRelay) {
      shippingCost = new DecimalCtor(3.9);
      shippingName = 'Point Relais';
      shippingDescription = data.relayPointName || '2-3 jours';
    } else if (isHomeDelivery) {
      shippingCost = new DecimalCtor(5.9);
      shippingName = 'Livraison à domicile';
      shippingDescription = 'Colissimo avec suivi - 48-72h';
    }

    // Use a transaction for all database operations to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Fetch products with variants (inside transaction for consistency)
      const productIds = data.items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { variants: true },
      });

      if (products.length !== productIds.length) {
        throw new Error('Un ou plusieurs produits sont introuvables');
      }

      // Build line items and validate/decrement stock
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
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
      const variantsToDecrement: Array<{ id: string; quantity: number }> = [];

      let subtotal = new DecimalCtor(0);

      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Find variant if size/color specified
        let variant = null;
        if (item.size || item.color) {
          variant = product.variants.find(
            v => v.size === item.size && v.color === item.color && v.isActive
          );
          if (!variant) {
            throw new Error(`Variante introuvable pour ${product.name} (${item.color} - ${item.size})`);
          }
          if (variant.stock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name} (${item.color} - ${item.size}). Disponible: ${variant.stock}`);
          }
          // Queue for stock decrement
          variantsToDecrement.push({ id: variant.id, quantity: item.quantity });
        }

        const unitPrice = new DecimalCtor(product.price.toString());
        const totalPrice = unitPrice.mul(item.quantity);
        subtotal = subtotal.add(totalPrice);

        // Stripe line item - use existing Stripe price if available
        if (product.stripePriceId) {
          lineItems.push({
            price: product.stripePriceId,
            quantity: item.quantity,
          });
        } else {
          // Fallback to price_data for products not yet synced
          lineItems.push({
            price_data: {
              currency: 'eur',
              product_data: {
                name: product.name,
                description: item.size ? `Taille: ${item.size}${item.color ? ` - Couleur: ${item.color}` : ''}` : undefined,
                images: product.images.length > 0 ? [product.images[0]] : undefined,
              },
              unit_amount: Math.round(Number(product.price) * 100),
            },
            quantity: item.quantity,
          });
        }

        // Order item for database
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

      // Decrement stock for all variants (inside transaction)
      for (const v of variantsToDecrement) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { stock: { decrement: v.quantity } },
        });
      }

      // Apply promo code with per-user validation
      let discount = new DecimalCtor(0);
      let promoCodeId: string | undefined;

      if (data.promoCode) {
        const promo = await tx.promoCode.findUnique({
          where: { code: data.promoCode.toUpperCase() },
        });

        if (promo && promo.isActive) {
          const now = new Date();
          const validFrom = promo.validFrom || new Date(0);
          const validUntil = promo.validUntil || new Date('2099-12-31');

          if (now >= validFrom && now <= validUntil) {
            // Check global max uses
            if (!promo.maxUses || promo.usedCount < promo.maxUses) {
              // Check per-user limit if user is authenticated
              if (promo.maxUsesPerUser && user?.id) {
                const userUsageCount = await tx.order.count({
                  where: {
                    userId: user.id,
                    promoCodeId: promo.id,
                    paymentStatus: { in: ['PAID', 'PENDING'] },
                  },
                });
                if (userUsageCount >= promo.maxUsesPerUser) {
                  throw new Error('Vous avez déjà utilisé ce code promo le nombre maximum de fois');
                }
              }

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

                // Increment promo code usage count
                await tx.promoCode.update({
                  where: { id: promo.id },
                  data: { usedCount: { increment: 1 } },
                });
              }
            }
          }
        }
      }

      const total = subtotal.add(shippingCost).sub(discount);

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Build shipping address based on delivery method
      let shippingStreet = data.address;
      let shippingCity = data.city;
      let shippingPostalCode = data.postalCode;

      // For relay points, store relay info in shipping address
      // Format: [RELAY:carrier-boxtalCode] Name - Address
      if (isRelay && data.relayPointId) {
        const relayCode = data.relayPointCode || data.relayPointId.split('-').slice(1).join('-');
        const relayId = data.relayCarrier ? `${data.relayCarrier}-${relayCode}` : data.relayPointId;
        shippingStreet = `[RELAY:${relayId}] ${data.relayPointName || ''} - ${data.relayPointAddress || ''}`;
        shippingCity = data.relayPointCity || data.city;
        shippingPostalCode = data.relayPointPostalCode || data.postalCode;
      }

      // Create pending order in database
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id,
          customerEmail: data.email,
          customerPhone: data.phone,
          customerFirstName: data.firstName,
          customerLastName: data.lastName,
          shippingStreet,
          shippingCity,
          shippingPostalCode,
          shippingCountry: data.country,
          subtotal,
          shippingCost,
          discount,
          total,
          deliveryMethod: isRelay ? 'DELIVERY' : (data.deliveryMethod as 'DELIVERY' | 'HAND_DELIVERY'), // Map RELAY to DELIVERY for DB enum
          promoCodeId,
          customerNotes: isRelay
            ? `[POINT RELAIS: ${data.relayCarrier || ''} - ${data.relayPointName || ''}]\n${data.notes || ''}`
            : data.notes,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
      });

      return { order, lineItems, discount, orderNumber };
    });

    // Add shipping to Stripe if applicable
    if (shippingCost.gt(0)) {
      result.lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingName,
            description: shippingDescription,
          },
          unit_amount: Math.round(Number(shippingCost) * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: result.lineItems,
      mode: 'payment',
      customer_email: data.email,
      metadata: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
      },
      // Apply discount as coupon if applicable
      ...(result.discount.gt(0) ? {
        discounts: [{
          coupon: await createStripeCoupon(stripe, result.discount, data.promoCode || 'PROMO'),
        }],
      } : {}),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/checkout?success=true&order=${result.orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/checkout?canceled=true`,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: result.order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderNumber: result.order.orderNumber,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la création du paiement';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Helper to create a one-time coupon for discounts
async function createStripeCoupon(stripe: Stripe, amount: DecimalType, name: string): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(Number(amount) * 100),
    currency: 'eur',
    duration: 'once',
    name: `Réduction ${name}`,
  });
  return coupon.id;
}
