import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const updatePopupSchema = z.object({
  type: z.enum(['NEWSLETTER', 'DELIVERY_ISSUE', 'NEW_DROP']).optional(),
  isActive: z.boolean().optional(),
  titleFr: z.string().min(1).max(200).optional(),
  titleEn: z.string().min(1).max(200).optional(),
  subtitleFr: z.string().max(500).optional().nullable(),
  subtitleEn: z.string().max(500).optional().nullable(),
  buttonTextFr: z.string().max(100).optional().nullable(),
  buttonTextEn: z.string().max(100).optional().nullable(),
  contentFr: z.string().max(2000).optional().nullable(),
  contentEn: z.string().max(2000).optional().nullable(),
  linkUrl: z.string().url().optional().nullable().or(z.literal('')),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).max(5).optional(),
  showDelay: z.number().int().min(0).max(60000).optional(),
  showOnce: z.boolean().optional(),
});

/**
 * GET /api/popups/[id]
 * Get a single popup by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const popup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!popup) {
      return notFoundResponse();
    }

    return successResponse(popup);
  } catch (error) {
    console.error('GET /api/popups/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/popups/[id]
 * Update a popup (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updatePopupSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check popup exists
    const existingPopup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!existingPopup) {
      return notFoundResponse();
    }

    // If activating this popup, deactivate other popups of the same type
    const popupType = data.type || existingPopup.type;
    if (data.isActive === true) {
      await prisma.popup.updateMany({
        where: {
          type: popupType,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    const popup = await prisma.popup.update({
      where: { id },
      data: {
        ...data,
        linkUrl: data.linkUrl === '' ? null : data.linkUrl,
        image: data.image === '' ? null : data.image,
      },
    });

    return successResponse(popup);
  } catch (error) {
    console.error('PUT /api/popups/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/popups/[id]
 * Delete a popup (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await params;

    // Check popup exists
    const existingPopup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!existingPopup) {
      return notFoundResponse();
    }

    await prisma.popup.delete({
      where: { id },
    });

    return successResponse({ message: 'Popup supprimé avec succès' });
  } catch (error) {
    console.error('DELETE /api/popups/[id] error:', error);
    return serverErrorResponse();
  }
}
