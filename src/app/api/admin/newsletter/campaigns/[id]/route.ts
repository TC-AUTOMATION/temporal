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
  errorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const updateCampaignSchema = z.object({
  subject: z.string().min(1).optional(),
  subjectEn: z.string().optional().nullable(),
  contentHtml: z.string().min(1).optional(),
  contentHtmlEn: z.string().optional().nullable(),
});

/**
 * GET /api/admin/newsletter/campaigns/[id]
 * Get a single campaign (admin only)
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

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return notFoundResponse('Campaign not found');
    }

    return successResponse({ campaign });
  } catch (error) {
    console.error('GET /api/admin/newsletter/campaigns/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/newsletter/campaigns/[id]
 * Update a campaign (admin only)
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
    const validation = updateCampaignSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if campaign exists
    const existing = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Campaign not found');
    }

    // Can't update sent campaigns
    if (existing.status === 'sent') {
      return errorResponse('Cannot update a sent campaign', 400);
    }

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...(data.subject && { subject: data.subject }),
        ...(data.subjectEn !== undefined && { subjectEn: data.subjectEn }),
        ...(data.contentHtml && { contentHtml: data.contentHtml }),
        ...(data.contentHtmlEn !== undefined && { contentHtmlEn: data.contentHtmlEn }),
      },
    });

    return successResponse({ campaign });
  } catch (error) {
    console.error('PUT /api/admin/newsletter/campaigns/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/newsletter/campaigns/[id]
 * Delete a campaign (admin only)
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

    // Check if campaign exists
    const existing = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Campaign not found');
    }

    await prisma.newsletterCampaign.delete({ where: { id } });

    return successResponse({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/newsletter/campaigns/[id] error:', error);
    return serverErrorResponse();
  }
}
