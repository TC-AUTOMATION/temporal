import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const updateMarqueeSchema = z.object({
  textFr: z.string().min(1).optional(),
  textEn: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/marquee/[id]
 * Get a single marquee message (admin only)
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

    const message = await prisma.marqueeMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return notFoundResponse('Marquee message not found');
    }

    return successResponse({ message });
  } catch (error) {
    console.error('GET /api/admin/marquee/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/marquee/[id]
 * Update a marquee message (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const validation = updateMarqueeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if message exists
    const existing = await prisma.marqueeMessage.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Marquee message not found');
    }

    const message = await prisma.marqueeMessage.update({
      where: { id },
      data: {
        ...(data.textFr && { textFr: data.textFr }),
        ...(data.textEn && { textEn: data.textEn }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return successResponse({ message });
  } catch (error) {
    console.error('PUT /api/admin/marquee/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/marquee/[id]
 * Delete a marquee message (admin only)
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

    // Check if message exists
    const existing = await prisma.marqueeMessage.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Marquee message not found');
    }

    await prisma.marqueeMessage.delete({ where: { id } });

    return successResponse({ message: 'Marquee message deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/marquee/[id] error:', error);
    return serverErrorResponse();
  }
}
