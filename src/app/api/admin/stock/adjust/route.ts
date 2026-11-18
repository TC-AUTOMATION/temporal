import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { adjustVariantStock } from '@/lib/stock';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';

const schema = z.object({
  variantId: z.string().min(1),
  // delta : +2 / -1 … ; set : fixe le stock à cette valeur
  mode: z.enum(['delta', 'set']).default('delta'),
  value: z.number().int(),
  note: z.string().max(500).optional(),
});

/**
 * POST /api/admin/stock/adjust
 * Ajustement manuel du stock d'une variante, journalisé dans l'historique (source MANUAL).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const { variantId, mode, value, note } = parsed.data;

    if (mode === 'set' && value < 0) return errorResponse('Le stock ne peut pas être négatif');

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true },
      });
      if (!variant) return null;

      const delta = mode === 'set' ? value - variant.stock : value;
      if (delta === 0) return { delta: 0, stock: variant.stock };

      await adjustVariantStock(tx, variantId, delta, {
        source: 'MANUAL',
        reason: 'MANUAL_ADJUSTMENT',
        userId: user.id,
        userName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        note: note?.trim() || null,
      });
      return { delta, stock: variant.stock + delta };
    });

    if (!result) return notFoundResponse('Variante introuvable');
    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Stock insuffisant')) {
      return errorResponse(error.message);
    }
    console.error('POST /api/admin/stock/adjust error:', error);
    return serverErrorResponse();
  }
}
