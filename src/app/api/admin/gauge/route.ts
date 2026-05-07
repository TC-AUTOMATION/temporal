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

const GAUGE_CONFIG_KEY = 'gauge_config';

const tierSchema = z.object({
  id: z.string(),
  threshold: z.number().min(0),
  labelFr: z.string().min(1),
  labelEn: z.string().min(1),
  contestId: z.string().optional().nullable(),
  type: z.enum(['gift', 'shipping', 'other']).default('gift'),
  sortOrder: z.number().min(0),
});

const gaugeConfigSchema = z.object({
  maxAmount: z.number().min(1),
  tiers: z.array(tierSchema).min(1),
});

export type GaugeTier = z.infer<typeof tierSchema>;
export type GaugeConfig = z.infer<typeof gaugeConfigSchema>;

const DEFAULT_CONFIG: GaugeConfig = {
  maxAmount: 250,
  tiers: [
    { id: 'tier-1', threshold: 80, labelFr: 'Livraison gratuite', labelEn: 'Free shipping', contestId: null, type: 'shipping', sortOrder: 0 },
    { id: 'tier-2', threshold: 150, labelFr: 'Bonnet', labelEn: 'Beanie', contestId: null, type: 'gift', sortOrder: 1 },
    { id: 'tier-3', threshold: 200, labelFr: 'Veste', labelEn: 'Jacket', contestId: null, type: 'gift', sortOrder: 2 },
  ],
};

/**
 * GET /api/admin/gauge
 * Fetch gauge configuration (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const setting = await prisma.setting.findUnique({
      where: { key: GAUGE_CONFIG_KEY },
    });

    let config: GaugeConfig;
    if (setting) {
      try {
        config = JSON.parse(setting.value);
      } catch {
        config = DEFAULT_CONFIG;
      }
    } else {
      config = DEFAULT_CONFIG;
    }

    // Also fetch available contests for the dropdown
    const contests = await prisma.contest.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        prizeName: true,
        prizeNameEn: true,
        purchaseAmount: true,
      },
    });

    return successResponse({ config, contests });
  } catch (error) {
    console.error('GET /api/admin/gauge error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/gauge
 * Update gauge configuration (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = gaugeConfigSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const config = validation.data;

    // Sort tiers by threshold
    config.tiers.sort((a, b) => a.threshold - b.threshold);
    config.tiers.forEach((tier, index) => {
      tier.sortOrder = index;
    });

    await prisma.setting.upsert({
      where: { key: GAUGE_CONFIG_KEY },
      create: {
        key: GAUGE_CONFIG_KEY,
        value: JSON.stringify(config),
        type: 'json',
      },
      update: {
        value: JSON.stringify(config),
      },
    });

    return successResponse({ config });
  } catch (error) {
    console.error('PUT /api/admin/gauge error:', error);
    return serverErrorResponse();
  }
}
