import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { autoPromoSchema } from '@/lib/validations';
import { findBestAutomaticPromo } from '@/lib/promo';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/promo/auto
 * Retourne la promo automatique active la plus avantageuse pour ce panier
 * (ex. Black Friday), ou null. Aucun code à saisir.
 */
export async function POST(request: NextRequest) {
  try {
    const validation = autoPromoSchema.safeParse(await request.json());
    if (!validation.success) return validationErrorResponse(validation.error);
    const { cartTotal, items } = validation.data;
    if (!items?.length || cartTotal <= 0) return successResponse(null);

    const user = await getCurrentUser();
    const result = await findBestAutomaticPromo(
      prisma,
      { subtotal: new Prisma.Decimal(cartTotal), shippingCost: null, lines: items },
      user?.id
    );
    if (!result) return successResponse(null);

    return successResponse({
      code: result.promo.code,
      name: result.promo.name || result.promo.code,
      discount: Number(result.discount),
      discountLabel: result.label,
      validUntil: result.promo.validUntil,
    });
  } catch (error) {
    console.error('POST /api/promo/auto error:', error);
    return serverErrorResponse();
  }
}
