import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

const GAUGE_CONFIG_KEY = 'gauge_config';

const DEFAULT_CONFIG = {
  maxAmount: 250,
  tiers: [
    { id: 'tier-1', threshold: 80, labelFr: 'Livraison gratuite', labelEn: 'Free shipping', contestId: null, sortOrder: 0 },
    { id: 'tier-2', threshold: 150, labelFr: 'Bonnet', labelEn: 'Beanie', contestId: null, sortOrder: 1 },
    { id: 'tier-3', threshold: 200, labelFr: 'Veste', labelEn: 'Jacket', contestId: null, sortOrder: 2 },
  ],
};

/**
 * GET /api/gauge
 * Public endpoint - returns gauge config (no auth required)
 */
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: GAUGE_CONFIG_KEY },
    });

    let config;
    if (setting) {
      try {
        config = JSON.parse(setting.value);
      } catch {
        config = DEFAULT_CONFIG;
      }
    } else {
      config = DEFAULT_CONFIG;
    }

    return successResponse({ config });
  } catch (error) {
    console.error('GET /api/gauge error:', error);
    return serverErrorResponse();
  }
}
