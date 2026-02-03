import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const popupSchema = z.object({
  type: z.enum(['NEWSLETTER', 'DELIVERY_ISSUE', 'NEW_DROP']),
  isActive: z.boolean().default(false),
  titleFr: z.string().min(1, 'Titre FR requis').max(200),
  titleEn: z.string().min(1, 'Titre EN requis').max(200),
  subtitleFr: z.string().max(500).optional(),
  subtitleEn: z.string().max(500).optional(),
  buttonTextFr: z.string().max(100).optional(),
  buttonTextEn: z.string().max(100).optional(),
  contentFr: z.string().max(2000).optional(),
  contentEn: z.string().max(2000).optional(),
  linkUrl: z.string().url().optional().or(z.literal('')),
  showDelay: z.number().int().min(0).max(60000).default(5000),
  showOnce: z.boolean().default(true),
});

/**
 * GET /api/popups
 * Get all popups (admin) or only active popup (public)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';
    const type = searchParams.get('type');

    // Public access: only get active popup
    if (!user || !user.isAdmin) {
      const where: Record<string, unknown> = { isActive: true };
      if (type) {
        where.type = type.toUpperCase();
      }

      const popup = await prisma.popup.findFirst({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      return successResponse(popup);
    }

    // Admin access: get all popups
    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (type) {
      where.type = type.toUpperCase();
    }

    const popups = await prisma.popup.findMany({
      where,
      orderBy: { type: 'asc' },
    });

    return successResponse(popups);
  } catch (error) {
    console.error('GET /api/popups error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/popups
 * Create a new popup (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = popupSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // If activating this popup, deactivate other popups of the same type
    if (data.isActive) {
      await prisma.popup.updateMany({
        where: { type: data.type },
        data: { isActive: false },
      });
    }

    const popup = await prisma.popup.create({
      data: {
        type: data.type,
        isActive: data.isActive,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        subtitleFr: data.subtitleFr || null,
        subtitleEn: data.subtitleEn || null,
        buttonTextFr: data.buttonTextFr || null,
        buttonTextEn: data.buttonTextEn || null,
        contentFr: data.contentFr || null,
        contentEn: data.contentEn || null,
        linkUrl: data.linkUrl || null,
        showDelay: data.showDelay,
        showOnce: data.showOnce,
      },
    });

    return successResponse(popup, 201);
  } catch (error) {
    console.error('POST /api/popups error:', error);
    return serverErrorResponse();
  }
}
