import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const contestSchema = z.object({
  number: z.string().min(1),
  prizeName: z.string().min(1),
  prizeNameEn: z.string().optional(),
  prizeValue: z.number().min(0),
  prizeImage: z.string().optional(),
  purchaseAmount: z.number().min(0),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

/**
 * GET /api/admin/contests
 * List all contests (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const includeEntries = searchParams.get('includeEntries') === 'true';

    const contests = await prisma.contest.findMany({
      orderBy: { number: 'asc' },
      include: includeEntries ? {
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: {
          select: { entries: true },
        },
      } : {
        _count: {
          select: { entries: true },
        },
      },
    });

    return successResponse({ contests });
  } catch (error) {
    console.error('GET /api/admin/contests error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/contests
 * Create a new contest (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = contestSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if contest number already exists
    const existing = await prisma.contest.findUnique({
      where: { number: data.number },
    });
    if (existing) {
      return validationErrorResponse({ message: 'Contest number already exists' } as unknown as z.ZodError);
    }

    const contest = await prisma.contest.create({
      data: {
        number: data.number,
        prizeName: data.prizeName,
        prizeNameEn: data.prizeNameEn,
        prizeValue: data.prizeValue,
        prizeImage: data.prizeImage,
        purchaseAmount: data.purchaseAmount,
        description: data.description,
        descriptionEn: data.descriptionEn,
        isActive: data.isActive ?? true,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return successResponse({ contest }, 201);
  } catch (error) {
    console.error('POST /api/admin/contests error:', error);
    return serverErrorResponse();
  }
}
