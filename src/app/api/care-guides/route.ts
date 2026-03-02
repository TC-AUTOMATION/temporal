import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/care-guides
 * Get all active care guides (public)
 */
export async function GET() {
  try {
    const guides = await prisma.careGuide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const response = successResponse(guides);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('GET /api/care-guides error:', error);
    return serverErrorResponse();
  }
}
