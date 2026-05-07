import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/contests/[id]/draw
 * Draw a random winner for a contest (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    // Get contest with entries
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        entries: true,
      },
    });

    if (!contest) {
      return notFoundResponse('Contest not found');
    }

    if (contest.winnerId) {
      return errorResponse('Contest already has a winner', 400);
    }

    if (contest.entries.length === 0) {
      return errorResponse('No entries in this contest', 400);
    }

    // Draw random winner
    const randomIndex = Math.floor(Math.random() * contest.entries.length);
    const winnerEntry = contest.entries[randomIndex];

    // Update contest with winner (peut être null si la participation est manuelle)
    const updatedContest = await prisma.contest.update({
      where: { id },
      data: {
        winnerId: winnerEntry.userId ?? null,
        winnerOrderId: winnerEntry.orderId ?? null,
        drawnAt: new Date(),
        isActive: false, // Close contest after drawing
      },
    });

    // Get winner user info (si la participation gagnante n'est pas manuelle)
    const winner = winnerEntry.userId
      ? await prisma.user.findUnique({
          where: { id: winnerEntry.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        })
      : null;

    // Get winning order info (si applicable)
    const order = winnerEntry.orderId
      ? await prisma.order.findUnique({
          where: { id: winnerEntry.orderId },
          select: {
            id: true,
            orderNumber: true,
            total: true,
          },
        })
      : null;

    // Pour les participations manuelles, inclure les infos saisies à la main
    const manualWinner =
      !winner && (winnerEntry as { manualName?: string | null }).manualName
        ? {
            manualName: (winnerEntry as { manualName?: string | null }).manualName,
            manualEmail: (winnerEntry as { manualEmail?: string | null }).manualEmail,
          }
        : null;

    return successResponse({
      contest: updatedContest,
      winner,
      manualWinner,
      winningOrder: order,
      totalEntries: contest.entries.length,
    });
  } catch (error) {
    console.error('POST /api/admin/contests/[id]/draw error:', error);
    return serverErrorResponse();
  }
}
