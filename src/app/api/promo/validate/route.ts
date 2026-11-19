import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { validatePromoCodeSchema } from '@/lib/validations';
import { checkPromoValidity, computePromoDiscount } from '@/lib/promo';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/promo/validate
 * Validate a promo code and calculate discount (aperçu ; le montant final est
 * recalculé côté serveur lors du paiement).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validatePromoCodeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { code, cartTotal, items } = validation.data;

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!promo) {
      return errorResponse('Code promo invalide');
    }

    const subtotal = new Prisma.Decimal(cartTotal);
    const invalid = checkPromoValidity(promo, subtotal);
    if (invalid) return errorResponse(invalid);

    const result = await computePromoDiscount(prisma, promo, {
      subtotal,
      shippingCost: null,
      lines: items || [],
    });
    if (!result) {
      return errorResponse("Ce code promo ne s'applique pas à votre panier");
    }

    const discount = Number(result.discount);
    return successResponse({
      valid: true,
      code: promo.code,
      type: promo.type,
      discount,
      discountLabel: result.label,
      newTotal: Math.max(0, cartTotal - discount),
    });
  } catch (error) {
    console.error('POST /api/promo/validate error:', error);
    return serverErrorResponse();
  }
}
