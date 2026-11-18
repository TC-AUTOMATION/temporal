import { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

const REASONS = ['ORDER', 'ORDER_CANCELLED', 'ORDER_REFUNDED', 'MANUAL_ADJUSTMENT', 'PRODUCT_EDIT', 'INITIAL'] as const;

/**
 * GET /api/admin/stock/history
 * Query: source (AUTO|MANUAL), reason, productId, variantId, q (produit / n° commande / note),
 *        hideInitial=1, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const sp = request.nextUrl.searchParams;
    const source = sp.get('source');
    const reason = sp.get('reason');
    const productId = sp.get('productId');
    const variantId = sp.get('variantId');
    const q = sp.get('q')?.trim();
    const hideInitial = sp.get('hideInitial') === '1';
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const limit = Math.min(200, Math.max(1, Number(sp.get('limit')) || 50));

    const where: Prisma.StockMovementWhereInput = {};
    if (source === 'AUTO' || source === 'MANUAL') where.source = source;
    if (reason && (REASONS as readonly string[]).includes(reason)) {
      where.reason = reason as (typeof REASONS)[number];
    } else if (hideInitial) {
      where.reason = { not: 'INITIAL' };
    }
    if (productId) where.productId = productId;
    if (variantId) where.variantId = variantId;
    if (q) {
      where.OR = [
        { productName: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { note: { contains: q, mode: 'insensitive' } },
        { userName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, movements, totals] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockMovement.groupBy({
        by: ['source'],
        where: { ...where, reason: where.reason ?? { not: 'INITIAL' } },
        _sum: { delta: true },
        _count: true,
      }),
    ]);

    const summary = { AUTO: { count: 0, net: 0 }, MANUAL: { count: 0, net: 0 } };
    for (const t of totals) {
      summary[t.source] = { count: t._count, net: t._sum.delta || 0 };
    }

    return successResponse({
      movements,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary,
    });
  } catch (error) {
    console.error('GET /api/admin/stock/history error:', error);
    return serverErrorResponse();
  }
}
