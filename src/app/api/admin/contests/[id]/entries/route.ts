import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

/**
 * GET /api/admin/contests/[id]/entries
 * List all entries for a contest with user + order details (admin only).
 * Les participations manuelles (sans user/order) sont aussi retournées.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { id: true, number: true, prizeName: true, prizeNameEn: true, purchaseAmount: true },
    });

    if (!contest) {
      return notFoundResponse('Contest not found');
    }

    const entries = await prisma.contestEntry.findMany({
      where: { contestId: id },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = [...new Set(entries.map((e) => e.userId).filter((v): v is string => !!v))];
    const orderIds = [...new Set(entries.map((e) => e.orderId).filter((v): v is string => !!v))];

    const [users, orders] = await Promise.all([
      userIds.length
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, firstName: true, lastName: true },
          })
        : Promise.resolve([]),
      orderIds.length
        ? prisma.order.findMany({
            where: { id: { in: orderIds } },
            select: { id: true, orderNumber: true, total: true, createdAt: true, status: true },
          })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const orderMap = new Map(orders.map((o) => [o.id, o]));

    const enriched = entries.map((entry) => {
      const linkedUser = entry.userId ? userMap.get(entry.userId) || null : null;
      const linkedOrder = entry.orderId ? orderMap.get(entry.orderId) || null : null;
      return {
        id: entry.id,
        createdAt: entry.createdAt,
        orderTotal: entry.orderTotal,
        isManual: !entry.orderId,
        manualName: (entry as { manualName?: string | null }).manualName || null,
        manualEmail: (entry as { manualEmail?: string | null }).manualEmail || null,
        manualNote: (entry as { manualNote?: string | null }).manualNote || null,
        user: linkedUser,
        order: linkedOrder,
      };
    });

    return successResponse({
      contest,
      count: enriched.length,
      entries: enriched,
    });
  } catch (error) {
    console.error('GET /api/admin/contests/[id]/entries error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/contests/[id]/entries
 * Ajoute manuellement un participant à un concours (admin seulement).
 * Exemple : personnes qui ont acheté hors-ligne / en DM.
 */
const manualEntrySchema = z.object({
  manualName: z.string().min(1, 'Nom requis').max(200),
  manualEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  manualNote: z.string().max(1000).optional().or(z.literal('')),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) return notFoundResponse('Contest not found');

    const body = await request.json();
    const validation = manualEntrySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues.map((i) => i.message).join(', '));
    }
    const { manualName, manualEmail, manualNote } = validation.data;

    const entry = await prisma.contestEntry.create({
      data: {
        contestId: id,
        manualName,
        manualEmail: manualEmail || null,
        manualNote: manualNote || null,
        addedByAdminId: user.id,
      },
    });

    return successResponse({ entry }, 201);
  } catch (error) {
    console.error('POST /api/admin/contests/[id]/entries error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/contests/[id]/entries?entryId=...
 * Supprime une participation (utile pour retirer une entrée manuelle erronée).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');
    if (!entryId) return errorResponse('entryId is required');

    const entry = await prisma.contestEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.contestId !== id) {
      return notFoundResponse('Entry not found');
    }

    await prisma.contestEntry.delete({ where: { id: entryId } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/admin/contests/[id]/entries error:', error);
    return serverErrorResponse();
  }
}
