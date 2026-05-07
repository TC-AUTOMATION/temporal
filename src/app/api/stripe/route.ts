import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { checkoutSchema } from '@/lib/validations';
import { getCurrentUser, generateOrderNumber } from '@/lib/auth/jwt';
import { Prisma } from '@prisma/client';
import { getGaugeConfig, getFreeShippingThreshold } from '@/lib/gauge';
import { expandWithBundleComponents } from '@/lib/stock';

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
 * Create a Stripe checkout session and prepare the order.
 *
 * Flow:
 * 1. Validate input
 * 2. Transaction: validate stock, decrement stock, validate promo, create PENDING order
 *    - Promo usedCount is NOT incremented here (done in webhook on payment success)
 * 3. Create Stripe checkout session
 * 4. If Stripe fails → rollback: cancel order, restore stock
 * 5. Link session ID to order
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const currentUser = await getCurrentUser();
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

    // Guest → account creation on opt-in
    // If a guest checks "create my account", we create a passwordless User row
    // matching the checkout email so subsequent orders link to the same profile
    // and the customer can later claim it via the reset-password flow.
    let user = currentUser;
    if (!user && data.createAccount) {
      const email = data.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        user = await prisma.user.create({
          data: {
            email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            // No password yet — they claim via /reset-password
            newsletter: true,
          },
        });
      } else if (!existing.password) {
        // Existing passwordless account from a previous checkout — reuse it
        user = existing;
      }
      // If an account with a password exists, we intentionally DON'T link
      // (security: the guest may not be the account owner). They can sign
      // in and retry instead.
    }

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

    // Read the free-shipping threshold from the gauge config (null if none set)
    const gaugeConfig = await getGaugeConfig();
    const freeShippingThreshold = getFreeShippingThreshold(gaugeConfig);

    // Use a transaction for all database operations
    const result = await prisma.$transaction(async (tx) => {
      // Fetch products with variants (inside transaction for consistency)
      const productIds = data.items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { variants: true },
      });

      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new Error(`Certains articles de votre panier ne sont plus disponibles. Veuillez vider votre panier et réessayer. (IDs: ${missingIds.join(', ')})`);
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
        } else if (product.variants.length > 0) {
          // Product has variants but no size/color specified - check total stock
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          if (totalStock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name}. Disponible: ${totalStock}`);
          }
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

      // Atomic stock decrement with guard: fail if stock would go negative.
      // On étend les variantes "bundle" en leurs composants (ex: ensemble = veste + jogging).
      const expandedDecrements = await expandWithBundleComponents(tx, variantsToDecrement);
      for (const v of expandedDecrements) {
        const updated = await tx.productVariant.updateMany({
          where: { id: v.id, stock: { gte: v.quantity } },
          data: { stock: { decrement: v.quantity } },
        });
        if (updated.count === 0) {
          throw new Error('Stock insuffisant (mis à jour par une autre commande)');
        }
      }

      // Apply free shipping if the cart reached the gauge threshold
      if (
        freeShippingThreshold != null &&
        !isHandDelivery &&
        subtotal.gte(freeShippingThreshold)
      ) {
        shippingCost = new DecimalCtor(0);
        shippingDescription = shippingDescription
          ? `${shippingDescription} (offerte)`
          : 'Livraison offerte';
      }

      // Validate promo code (but do NOT increment usedCount - that happens on payment confirmation)
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
                } else if (promo.type === 'PER_TRANCHE') {
                  const trancheSize = promo.trancheSize
                    ? new DecimalCtor(promo.trancheSize.toString())
                    : new DecimalCtor(100);
                  const tranches = Math.floor(Number(subtotal.div(trancheSize)));
                  discount = new DecimalCtor(tranches).mul(promo.value);
                  if (promo.maxDiscount && discount.gt(promo.maxDiscount)) {
                    discount = new DecimalCtor(promo.maxDiscount.toString());
                  }
                  if (discount.gt(subtotal)) {
                    discount = subtotal;
                  }
                }

                // NOTE: usedCount is incremented in webhook handleCheckoutCompleted
                // This prevents promo from being "used" if payment never completes
              }
            }
          }
        }
      }

      const total = subtotal.add(shippingCost).sub(discount);

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Billing address is ALWAYS the real person's address (collected on the checkout form)
      // Shipping address is what the carrier sees:
      //   - DELIVERY     → same as billing
      //   - RELAY        → the relay point address
      //   - HAND_DELIVERY → same as billing (will be overridden by direct handover anyway)
      let shippingStreet: string | null = data.address;
      let shippingCity: string | null = data.city;
      let shippingPostalCode: string | null = data.postalCode;

      if (isRelay && data.relayPointName) {
        shippingStreet = data.relayPointAddress || data.relayPointName;
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
          // Billing (always the real person)
          billingStreet: data.address,
          billingCity: data.city,
          billingPostalCode: data.postalCode,
          billingCountry: data.country,
          // Shipping (where the carrier drops the parcel)
          shippingStreet,
          shippingCity,
          shippingPostalCode,
          shippingCountry: data.country,
          relayCarrier: isRelay ? (data.relayCarrier || null) : null,
          relayPointCode: isRelay ? (data.relayPointCode || data.relayPointId?.split('-').slice(1).join('-') || null) : null,
          relayPointName: isRelay ? (data.relayPointName || null) : null,
          relayPointAddress: isRelay ? (`${data.relayPointAddress || ''}${data.relayPointCity ? ', ' + data.relayPointPostalCode + ' ' + data.relayPointCity : ''}` || null) : null,
          subtotal,
          shippingCost,
          discount,
          total,
          deliveryMethod: data.deliveryMethod as 'DELIVERY' | 'RELAY' | 'HAND_DELIVERY',
          promoCodeId,
          customerNotes: data.notes || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
      });

      return { order, lineItems, discount, orderNumber, variantsToDecrement, promoCodeId };
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

    // Create Stripe checkout session - if this fails, rollback the order
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: result.lineItems,
          mode: 'payment',
          customer_email: data.email,
          metadata: {
            orderId: result.order.id,
            orderNumber: result.order.orderNumber,
          },
          ...(result.discount.gt(0) ? {
            discounts: [{
              coupon: await createStripeCoupon(stripe, result.discount, data.promoCode || 'PROMO'),
            }],
          } : {}),
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/checkout?success=true&order=${result.orderNumber}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/checkout?canceled=true`,
        },
        // Idempotency key prevents duplicate sessions on retry
        { idempotencyKey: `checkout-${result.order.id}` }
      );
    } catch (stripeError) {
      // Stripe session creation failed → rollback order, restore stock
      console.error('Stripe session creation failed, rolling back:', stripeError);
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: result.order.id },
          data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
        });
        for (const v of result.variantsToDecrement) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { stock: { increment: v.quantity } },
          });
        }
      });
      throw stripeError;
    }

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: result.order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
        orderNumber: result.order.orderNumber,
      },
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la création du paiement';
    return NextResponse.json(
      { success: false, error: message },
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
