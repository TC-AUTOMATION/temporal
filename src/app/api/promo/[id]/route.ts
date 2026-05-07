import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { promoCodeSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

/**
 * PUT /api/promo/[id]
 * Update a promo code (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;

    // Check if promo code exists
    const existing = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse('Code promo non trouvé');
    }

    const body = await request.json();

    // Make validation partial for updates
    const updateSchema = promoCodeSchema.partial();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // If updating code, check if it's already taken
    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.promoCode.findUnique({
        where: { code: data.code },
      });

      if (duplicate) {
        return errorResponse('Ce code promo existe déjà');
      }
    }

    // Sync changes to Stripe (skip for dynamic PER_TRANCHE - applied at checkout)
    const stripe = getStripe();
    const effectiveType = data.type || existing.type;
    const isDynamic = effectiveType === 'PER_TRANCHE';
    const needsStripeRecreate = !isDynamic && (data.type !== undefined || data.value !== undefined);

    if (needsStripeRecreate && existing.stripePromoId) {
      // Discount parameters changed - deactivate old promo and create new coupon+promo
      try {
        await stripe.promotionCodes.update(existing.stripePromoId, { active: false });

        const newType = data.type || existing.type;
        const newValue = data.value !== undefined ? data.value : Number(existing.value);
        const newMinPurchase = data.minPurchase !== undefined ? data.minPurchase : (existing.minPurchase ? Number(existing.minPurchase) : undefined);
        const newMaxUses = data.maxUses !== undefined ? data.maxUses : (existing.maxUses || undefined);
        const newValidUntil = data.validUntil !== undefined ? data.validUntil : (existing.validUntil ? existing.validUntil.toISOString() : undefined);
        const newCode = data.code || existing.code;
        const newIsActive = data.isActive !== undefined ? data.isActive : existing.isActive;

        const couponParams: Stripe.CouponCreateParams = {
          name: newCode,
          duration: 'forever',
          metadata: { code: newCode, type: newType, source: 'temporal-admin' },
        };

        if (newType === 'PERCENTAGE') {
          couponParams.percent_off = newValue;
        } else if (newType === 'FIXED') {
          couponParams.amount_off = Math.round(newValue * 100);
          couponParams.currency = 'eur';
        } else if (newType === 'FREE_SHIPPING') {
          couponParams.amount_off = 590;
          couponParams.currency = 'eur';
        }

        if (newValidUntil) {
          couponParams.redeem_by = Math.floor(new Date(newValidUntil).getTime() / 1000);
        }

        const newCoupon = await stripe.coupons.create(couponParams);

        const promoParams: Stripe.PromotionCodeCreateParams = {
          promotion: { type: 'coupon', coupon: newCoupon.id },
          code: newCode,
          active: newIsActive,
          metadata: { type: newType, source: 'temporal-admin' },
        };

        if (newMaxUses) promoParams.max_redemptions = newMaxUses;
        if (newValidUntil) promoParams.expires_at = Math.floor(new Date(newValidUntil).getTime() / 1000);
        if (newMinPurchase) {
          promoParams.restrictions = {
            minimum_amount: Math.round(newMinPurchase * 100),
            minimum_amount_currency: 'eur',
          };
        }

        const newPromo = await stripe.promotionCodes.create(promoParams);

        // Update Stripe IDs in DB
        await prisma.promoCode.update({
          where: { id },
          data: {
            stripeCouponId: newCoupon.id,
            stripePromoId: newPromo.id,
          },
        });
      } catch (stripeError) {
        console.error('Stripe promo recreate error:', stripeError);
      }
    } else if (existing.stripePromoId && data.isActive !== undefined) {
      // Only active status changed - simple update
      try {
        await stripe.promotionCodes.update(existing.stripePromoId, {
          active: data.isActive,
        });
      } catch (stripeError) {
        console.error('Stripe promo update error:', stripeError);
      }
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.trancheSize !== undefined && { trancheSize: data.trancheSize }),
        ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.maxUsesPerUser !== undefined && { maxUsesPerUser: data.maxUsesPerUser }),
        ...(data.validFrom && { validFrom: new Date(data.validFrom) }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil ? new Date(data.validUntil) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return successResponse(promoCode);
  } catch (error) {
    console.error('PUT /api/promo/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/promo/[id]
 * Delete or deactivate a promo code (admin only)
 * If the promo code has been used in orders, it will be deactivated instead of deleted
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;

    // Check if promo code exists
    const existing = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existing) {
      return notFoundResponse('Code promo non trouvé');
    }

    // Deactivate on Stripe if exists
    const stripe = getStripe();
    if (existing.stripePromoId) {
      try {
        await stripe.promotionCodes.update(existing.stripePromoId, { active: false });
      } catch (stripeError) {
        console.error('Stripe promo deactivation error:', stripeError);
      }
    }

    // If promo code has been used in orders, deactivate instead of delete
    if (existing._count.orders > 0) {
      const promoCode = await prisma.promoCode.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        ...promoCode,
        _deactivated: true,
        _message: 'Code promo désactivé (utilisé dans des commandes)',
      });
    }

    // Otherwise, delete it
    await prisma.promoCode.delete({
      where: { id },
    });

    return successResponse({
      id,
      _deleted: true,
      _message: 'Code promo supprimé',
    });
  } catch (error) {
    console.error('DELETE /api/promo/[id] error:', error);
    return serverErrorResponse();
  }
}
