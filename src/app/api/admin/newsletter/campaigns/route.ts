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

const campaignSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  subjectEn: z.string().optional(),
  contentHtml: z.string().min(1, 'Content is required'),
  contentHtmlEn: z.string().optional(),
});

/**
 * GET /api/admin/newsletter/campaigns
 * List all newsletter campaigns (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const campaigns = await prisma.newsletterCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ campaigns });
  } catch (error) {
    console.error('GET /api/admin/newsletter/campaigns error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/newsletter/campaigns
 * Create a new campaign (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = campaignSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: data.subject,
        subjectEn: data.subjectEn,
        contentHtml: data.contentHtml,
        contentHtmlEn: data.contentHtmlEn,
        status: 'draft',
      },
    });

    return successResponse({ campaign }, 201);
  } catch (error) {
    console.error('POST /api/admin/newsletter/campaigns error:', error);
    return serverErrorResponse();
  }
}
