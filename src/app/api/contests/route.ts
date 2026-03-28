import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/contests
 * Public endpoint - returns only active contests (no auth required)
 */
export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    return successResponse({ contests });
  } catch (error) {
    console.error('GET /api/contests error:', error);
    return serverErrorResponse();
  }
}
