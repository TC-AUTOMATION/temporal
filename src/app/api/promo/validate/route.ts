import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validatePromoCodeSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { Prisma } from '@prisma/client';

const DecimalCtor = Prisma.Decimal;

/**
 * POST /api/promo/validate
 * Validate a promo code and calculate discount
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validatePromoCodeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { code, cartTotal } = validation.data;

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return errorResponse('Code promo invalide');
    }

    if (!promo.isActive) {
      return errorResponse('Ce code promo n\'est plus actif');
    }

    const now = new Date();

    if (promo.validFrom && now < promo.validFrom) {
      return errorResponse('Ce code promo n\'est pas encore valide');
    }

    if (promo.validUntil && now > promo.validUntil) {
      return errorResponse('Ce code promo a expiré');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return errorResponse('Ce code promo a atteint sa limite d\'utilisation');
    }

    const cartDecimal = new DecimalCtor(cartTotal);

    if (promo.minPurchase && cartDecimal.lt(promo.minPurchase)) {
      return errorResponse(`Minimum d'achat requis: ${Number(promo.minPurchase).toFixed(2)}€`);
    }

    // Calculate discount
    let discount = new DecimalCtor(0);
    let discountLabel = '';

    if (promo.type === 'PERCENTAGE') {
      discount = cartDecimal.mul(promo.value).div(100);
      if (promo.maxDiscount && discount.gt(promo.maxDiscount)) {
        discount = new DecimalCtor(promo.maxDiscount.toString());
      }
      discountLabel = `${Number(promo.value)}% de réduction`;
    } else if (promo.type === 'FIXED') {
      discount = new DecimalCtor(promo.value.toString());
      if (discount.gt(cartDecimal)) {
        discount = cartDecimal;
      }
      discountLabel = `${Number(promo.value).toFixed(2)}€ de réduction`;
    } else if (promo.type === 'FREE_SHIPPING') {
      discount = new DecimalCtor(5.9); // Standard shipping cost
      discountLabel = 'Livraison gratuite';
    }

    return successResponse({
      valid: true,
      code: promo.code,
      type: promo.type,
      discount: Number(discount),
      discountLabel,
      newTotal: Math.max(0, cartTotal - Number(discount)),
    });
  } catch (error) {
    console.error('POST /api/promo/validate error:', error);
    return serverErrorResponse();
  }
}
