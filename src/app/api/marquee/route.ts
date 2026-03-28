import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/marquee
 * Public endpoint - returns only active marquee messages ordered by sortOrder
 */
export async function GET() {
  try {
    const messages = await prisma.marqueeMessage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        textFr: true,
        textEn: true,
        isActive: true,
        sortOrder: true,
      },
    });

    return successResponse({ messages });
  } catch (error) {
    console.error('GET /api/marquee error:', error);
    return serverErrorResponse();
  }
}
