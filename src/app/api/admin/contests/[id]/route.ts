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

const updateContestSchema = z.object({
  number: z.string().min(1).optional(),
  prizeName: z.string().min(1).optional(),
  prizeNameEn: z.string().optional().nullable(),
  prizeValue: z.number().min(0).optional(),
  prizeImage: z.string().optional().nullable(),
  purchaseAmount: z.number().min(0).optional(),
  description: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

/**
 * GET /api/admin/contests/[id]
 * Get a single contest with entries (admin only)
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
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!contest) {
      return notFoundResponse('Contest not found');
    }

    return successResponse({ contest });
  } catch (error) {
    console.error('GET /api/admin/contests/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/contests/[id]
 * Update a contest (admin only)
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
    const validation = updateContestSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if contest exists
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Contest not found');
    }

    // If updating number, check for duplicates
    if (data.number && data.number !== existing.number) {
      const duplicate = await prisma.contest.findUnique({
        where: { number: data.number },
      });
      if (duplicate) {
        return validationErrorResponse({ message: 'Contest number already exists' } as unknown as z.ZodError);
      }
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: {
        ...(data.number && { number: data.number }),
        ...(data.prizeName && { prizeName: data.prizeName }),
        ...(data.prizeNameEn !== undefined && { prizeNameEn: data.prizeNameEn }),
        ...(data.prizeValue !== undefined && { prizeValue: data.prizeValue }),
        ...(data.prizeImage !== undefined && { prizeImage: data.prizeImage }),
        ...(data.purchaseAmount !== undefined && { purchaseAmount: data.purchaseAmount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      },
    });

    return successResponse({ contest });
  } catch (error) {
    console.error('PUT /api/admin/contests/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/contests/[id]
 * Delete a contest (admin only)
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

    // Check if contest exists
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Contest not found');
    }

    await prisma.contest.delete({ where: { id } });

    return successResponse({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/contests/[id] error:', error);
    return serverErrorResponse();
  }
}
