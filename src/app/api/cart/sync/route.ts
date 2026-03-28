import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/cart/sync
 * Syncs the client-side cart state to the database for analytics.
 * Rate-limited: only updates if last update was > 30 seconds ago.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, items, total } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return errorResponse('sessionId is required');
    }

    if (!Array.isArray(items)) {
      return errorResponse('items must be an array');
    }

    const itemCount = items.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    );

    // Rate limit: check if last update was < 30 seconds ago
    const existing = await prisma.cartSnapshot.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      const timeSinceLastUpdate = Date.now() - new Date(existing.updatedAt).getTime();
      if (timeSinceLastUpdate < 30_000) {
        return successResponse({ throttled: true, id: existing.id });
      }
    }

    // Upsert cart snapshot by sessionId
    const snapshot = await prisma.cartSnapshot.upsert({
      where: existing ? { id: existing.id } : { id: 'nonexistent' },
      update: {
        items,
        total: total || 0,
        itemCount,
        userId: userId || null,
      },
      create: {
        sessionId,
        userId: userId || null,
        items,
        total: total || 0,
        itemCount,
      },
    });

    return successResponse({ id: snapshot.id });
  } catch (error) {
    console.error('POST /api/cart/sync error:', error);
    return serverErrorResponse();
  }
}
