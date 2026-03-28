import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
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
 * POST /api/admin/stripe/sync-promos
 * Sync all promo codes to Stripe with correct parameters
 * Creates missing coupons/promotion codes and updates existing ones
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const stripe = getStripe();
    const promoCodes = await prisma.promoCode.findMany();

    const results: Array<{
      code: string;
      status: 'created' | 'updated' | 'skipped' | 'error';
      message?: string;
      stripeCouponId?: string;
      stripePromoId?: string;
    }> = [];

    for (const promo of promoCodes) {
      try {
        // Check if existing Stripe promo is still valid
        let existingPromoValid = false;
        if (promo.stripePromoId) {
          try {
            const existing = await stripe.promotionCodes.retrieve(promo.stripePromoId);
            existingPromoValid = !!existing.id;

            // Update active status if it differs
            if (existing.active !== promo.isActive) {
              await stripe.promotionCodes.update(promo.stripePromoId, {
                active: promo.isActive,
              });
            }

            results.push({
              code: promo.code,
              status: 'updated',
              message: 'Stripe promo exists, synced active status',
              stripeCouponId: promo.stripeCouponId || undefined,
              stripePromoId: promo.stripePromoId,
            });
          } catch {
            existingPromoValid = false;
          }
        }

        if (existingPromoValid) continue;

        // Create new Stripe coupon
        const couponParams: Stripe.CouponCreateParams = {
          name: promo.code,
          duration: 'forever',
          metadata: {
            code: promo.code,
            type: promo.type,
            source: 'temporal-admin',
            synced_at: new Date().toISOString(),
          },
        };

        if (promo.type === 'PERCENTAGE') {
          couponParams.percent_off = Number(promo.value);
        } else if (promo.type === 'FIXED') {
          couponParams.amount_off = Math.round(Number(promo.value) * 100);
          couponParams.currency = 'eur';
        } else if (promo.type === 'FREE_SHIPPING') {
          couponParams.amount_off = 590; // 5.90€ standard shipping
          couponParams.currency = 'eur';
        }

        if (promo.validUntil) {
          couponParams.redeem_by = Math.floor(new Date(promo.validUntil).getTime() / 1000);
        }

        const stripeCoupon = await stripe.coupons.create(couponParams);

        // Create Stripe promotion code with ALL parameters
        const promoCodeParams: Stripe.PromotionCodeCreateParams = {
          promotion: {
            type: 'coupon',
            coupon: stripeCoupon.id,
          },
          code: promo.code,
          active: promo.isActive,
          metadata: {
            type: promo.type,
            source: 'temporal-admin',
            synced_at: new Date().toISOString(),
          },
        };

        // Max redemptions
        if (promo.maxUses) {
          promoCodeParams.max_redemptions = promo.maxUses;
        }

        // Expiry date
        if (promo.validUntil) {
          promoCodeParams.expires_at = Math.floor(new Date(promo.validUntil).getTime() / 1000);
        }

        // Minimum purchase restriction
        if (promo.minPurchase && Number(promo.minPurchase) > 0) {
          promoCodeParams.restrictions = {
            minimum_amount: Math.round(Number(promo.minPurchase) * 100),
            minimum_amount_currency: 'eur',
          };
        }

        const stripePromo = await stripe.promotionCodes.create(promoCodeParams);

        // Save Stripe IDs to database
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: {
            stripeCouponId: stripeCoupon.id,
            stripePromoId: stripePromo.id,
          },
        });

        results.push({
          code: promo.code,
          status: 'created',
          message: `Coupon + Promotion Code created on Stripe`,
          stripeCouponId: stripeCoupon.id,
          stripePromoId: stripePromo.id,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          code: promo.code,
          status: 'error',
          message,
        });
      }
    }

    const created = results.filter(r => r.status === 'created').length;
    const updated = results.filter(r => r.status === 'updated').length;
    const errors = results.filter(r => r.status === 'error').length;

    return successResponse({
      message: `Sync terminée: ${created} créés, ${updated} mis à jour, ${errors} erreurs`,
      created,
      updated,
      errors,
      total: promoCodes.length,
      details: results,
    });
  } catch (error) {
    console.error('Stripe promo sync error:', error);
    return serverErrorResponse();
  }
}
