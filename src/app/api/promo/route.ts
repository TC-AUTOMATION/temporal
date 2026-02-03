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
 * GET /api/promo
 * Get all promo codes (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return successResponse(promoCodes);
  } catch (error) {
    console.error('GET /api/promo error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/promo
 * Create a new promo code (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = promoCodeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return errorResponse('Ce code promo existe déjà');
    }

    // Create Stripe coupon
    const stripe = getStripe();
    let stripeCouponId: string | null = null;
    let stripePromoId: string | null = null;

    try {
      // Create Stripe Coupon based on type
      const couponParams: Stripe.CouponCreateParams = {
        name: data.code,
        metadata: { code: data.code },
      };

      if (data.type === 'PERCENTAGE') {
        couponParams.percent_off = Number(data.value);
      } else if (data.type === 'FIXED') {
        couponParams.amount_off = Math.round(Number(data.value) * 100); // Convert to cents
        couponParams.currency = 'eur';
      }
      // FREE_SHIPPING is handled locally, not on Stripe

      if (data.type !== 'FREE_SHIPPING') {
        if (data.maxUses) {
          couponParams.max_redemptions = data.maxUses;
        }
        if (data.validUntil) {
          couponParams.redeem_by = Math.floor(new Date(data.validUntil).getTime() / 1000);
        }

        const stripeCoupon = await stripe.coupons.create(couponParams);
        stripeCouponId = stripeCoupon.id;

        // Create a Promotion Code (this is what customers use)
        // Note: Stripe v20+ uses 'promotion' object with 'type' and 'coupon' nested
        const promoCodeParams: Stripe.PromotionCodeCreateParams = {
          promotion: {
            type: 'coupon',
            coupon: stripeCoupon.id,
          },
          code: data.code,
          active: data.isActive ?? true,
        };

        if (data.minPurchase) {
          promoCodeParams.restrictions = {
            minimum_amount: Math.round(Number(data.minPurchase) * 100),
            minimum_amount_currency: 'eur',
          };
        }

        const stripePromo = await stripe.promotionCodes.create(promoCodeParams);
        stripePromoId = stripePromo.id;
      }
    } catch (stripeError) {
      console.error('Stripe coupon creation error:', stripeError);
      // Continue without Stripe sync - local promo still works
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        isActive: data.isActive,
        stripeCouponId,
        stripePromoId,
      },
    });

    return successResponse(promoCode, 201);
  } catch (error) {
    console.error('POST /api/promo error:', error);
    return serverErrorResponse();
  }
}
