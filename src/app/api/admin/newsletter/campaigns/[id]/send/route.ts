import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api/response';
import { sendEmail } from '@/lib/email/send';
import { newsletterEmailWrapper } from '@/lib/email/templates/newsletter';

/**
 * POST /api/admin/newsletter/campaigns/[id]/send
 * Send a newsletter campaign to all active subscribers (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    // Get campaign
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return notFoundResponse('Campaign not found');
    }

    if (campaign.status === 'sent') {
      return errorResponse('Campaign has already been sent', 400);
    }

    if (campaign.status === 'sending') {
      return errorResponse('Campaign is already being sent', 400);
    }

    // Mark as sending
    await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'sending' },
    });

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
    });

    if (subscribers.length === 0) {
      await prisma.newsletterCampaign.update({
        where: { id },
        data: { status: 'draft' },
      });
      return errorResponse('No active subscribers found', 400);
    }

    // Send emails in batches of 10
    const BATCH_SIZE = 10;
    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            const html = newsletterEmailWrapper(campaign.contentHtml);

            await sendEmail({
              to: subscriber.email,
              subject: campaign.subject,
              html,
            });
            sentCount++;
          } catch (error) {
            console.error(`Failed to send to ${subscriber.email}:`, error);
            errorCount++;
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount,
      },
    });

    return successResponse({
      message: 'Newsletter sent successfully',
      sentCount,
      errorCount,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    console.error('POST /api/admin/newsletter/campaigns/[id]/send error:', error);

    // Reset campaign status on error
    const { id } = await params;
    await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'draft' },
    }).catch(() => {});

    return serverErrorResponse();
  }
}
