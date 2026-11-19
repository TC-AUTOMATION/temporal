import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
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
import { promoRuleSchema, toDbData } from '../shared';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/promo-rules/[id] — modifier (formulaire complet) ou juste { isActive } */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();
    const { id } = await params;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing || existing.type !== 'TIERED') return notFoundResponse('Promo introuvable');

    const body = await request.json();
    if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
      const promo = await prisma.promoCode.update({ where: { id }, data: { isActive: body.isActive } });
      return successResponse(promo);
    }

    const parsed = promoRuleSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);
    if (parsed.data.code !== existing.code) {
      const clash = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } });
      if (clash) return errorResponse('Ce code existe déjà');
    }

    const promo = await prisma.promoCode.update({ where: { id }, data: toDbData(parsed.data) });
    return successResponse(promo);
  } catch (error) {
    console.error('PATCH /api/admin/promo-rules/[id] error:', error);
    return serverErrorResponse();
  }
}

/** DELETE — supprime, ou désactive si des commandes l'ont utilisée */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();
    const { id } = await params;

    const existing = await prisma.promoCode.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!existing || existing.type !== 'TIERED') return notFoundResponse('Promo introuvable');

    if (existing._count.orders > 0) {
      await prisma.promoCode.update({ where: { id }, data: { isActive: false } });
      return successResponse({ deactivated: true });
    }
    await prisma.promoCode.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/admin/promo-rules/[id] error:', error);
    return serverErrorResponse();
  }
}
