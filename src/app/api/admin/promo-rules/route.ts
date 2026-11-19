import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { promoRuleSchema, toDbData } from './shared';

/**
 * GET /api/admin/promo-rules
 * Promos à paliers (TIERED) + données pour les sélecteurs (packs, catégories, produits).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const [promos, packs, categories, products] = await Promise.all([
      prisma.promoCode.findMany({
        where: { type: 'TIERED' },
        orderBy: { validFrom: 'desc' },
        include: { _count: { select: { orders: true } } },
      }),
      prisma.pack.findMany({ select: { id: true, name: true, isActive: true }, orderBy: { name: 'asc' } }),
      prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return successResponse({ promos, packs, categories, products });
  } catch (error) {
    console.error('GET /api/admin/promo-rules error:', error);
    return serverErrorResponse();
  }
}

/** POST /api/admin/promo-rules — créer une promo à paliers */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const parsed = promoRuleSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const existing = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } });
    if (existing) return errorResponse('Ce code existe déjà');

    const promo = await prisma.promoCode.create({ data: toDbData(parsed.data) });
    return successResponse(promo, 201);
  } catch (error) {
    console.error('POST /api/admin/promo-rules error:', error);
    return serverErrorResponse();
  }
}
