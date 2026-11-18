import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { backfillStockHistory } from '@/lib/stockBackfill';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/stock/backfill   body: { dryRun?: boolean }
 * Reconstitue l'historique de stock à partir de toutes les commandes en base.
 * Peut être relancé sans risque (les lignes importées sont régénérées).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json().catch(() => ({}));
    const result = await backfillStockHistory({ dryRun: body?.dryRun === true });
    return successResponse(result);
  } catch (error) {
    console.error('POST /api/admin/stock/backfill error:', error);
    return serverErrorResponse();
  }
}
