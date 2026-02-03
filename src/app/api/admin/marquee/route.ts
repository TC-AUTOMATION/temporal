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

const marqueeSchema = z.object({
  textFr: z.string().min(1, 'French text is required'),
  textEn: z.string().min(1, 'English text is required'),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/marquee
 * List all marquee messages (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const messages = await prisma.marqueeMessage.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ messages });
  } catch (error) {
    console.error('GET /api/admin/marquee error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/marquee
 * Create a new marquee message (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = marqueeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Get max sort order
    const maxOrder = await prisma.marqueeMessage.aggregate({
      _max: { sortOrder: true },
    });

    const message = await prisma.marqueeMessage.create({
      data: {
        textFr: data.textFr,
        textEn: data.textEn,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        isActive: data.isActive ?? true,
      },
    });

    return successResponse({ message }, 201);
  } catch (error) {
    console.error('POST /api/admin/marquee error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/marquee
 * Bulk update marquee messages order (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const { messages } = body as { messages: Array<{ id: string; sortOrder: number }> };

    if (!Array.isArray(messages)) {
      return validationErrorResponse({ message: 'Messages array is required' } as unknown as z.ZodError);
    }

    // Update all in transaction
    await prisma.$transaction(
      messages.map((msg) =>
        prisma.marqueeMessage.update({
          where: { id: msg.id },
          data: { sortOrder: msg.sortOrder },
        })
      )
    );

    const updated = await prisma.marqueeMessage.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ messages: updated });
  } catch (error) {
    console.error('PUT /api/admin/marquee error:', error);
    return serverErrorResponse();
  }
}
