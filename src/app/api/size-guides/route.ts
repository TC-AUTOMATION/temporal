import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/size-guides
 * Get all active size guides (public)
 */
export async function GET() {
  try {
    const guides = await prisma.sizeGuide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const response = successResponse(guides);
    // Anti-cache headers for Safari compatibility
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('GET /api/size-guides error:', error);
    return serverErrorResponse();
  }
}
