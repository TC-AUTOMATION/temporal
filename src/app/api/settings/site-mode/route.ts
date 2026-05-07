import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/settings/site-mode
 * Public endpoint - returns siteMode and countdownDate
 */
export async function GET() {
  try {
    const [siteModeSetting, countdownSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'siteMode' } }),
      prisma.setting.findUnique({ where: { key: 'countdownDate' } }),
    ]);

    return successResponse({
      siteMode: siteModeSetting?.value || 'countdown',
      countdownDate: countdownSetting?.value || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('GET /api/settings/site-mode error:', error);
    return serverErrorResponse();
  }
}
