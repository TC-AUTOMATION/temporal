import { prisma } from '@/lib/db/prisma';

export interface GaugeTier {
  id: string;
  threshold: number;
  labelFr: string;
  labelEn: string;
  contestId?: string | null;
  type?: 'gift' | 'shipping' | 'other';
  sortOrder: number;
}

export interface GaugeConfig {
  maxAmount: number;
  tiers: GaugeTier[];
}

const GAUGE_CONFIG_KEY = 'gauge_config';

const DEFAULT_CONFIG: GaugeConfig = {
  maxAmount: 250,
  tiers: [
    { id: 'tier-1', threshold: 80, labelFr: 'Livraison gratuite', labelEn: 'Free shipping', contestId: null, type: 'shipping', sortOrder: 0 },
    { id: 'tier-2', threshold: 150, labelFr: 'Bonnet', labelEn: 'Beanie', contestId: null, type: 'gift', sortOrder: 1 },
    { id: 'tier-3', threshold: 200, labelFr: 'Veste', labelEn: 'Jacket', contestId: null, type: 'gift', sortOrder: 2 },
  ],
};

/**
 * Determine whether a tier is a free-shipping tier.
 *
 * Legacy configs may not carry the `type` field (it was added later), so we
 * fall back to a label heuristic for backward compatibility.
 */
function isShippingTier(tier: GaugeTier): boolean {
  if (tier.type === 'shipping') return true;
  if (tier.type) return false; // type set but not shipping -> it's a gift/other
  const label = `${tier.labelFr || ''} ${tier.labelEn || ''}`.toLowerCase();
  return label.includes('livraison') || label.includes('shipping');
}

export async function getGaugeConfig(): Promise<GaugeConfig> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: GAUGE_CONFIG_KEY },
    });
    if (!setting) return DEFAULT_CONFIG;
    return JSON.parse(setting.value) as GaugeConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Return the lowest cart total at which shipping becomes free,
 * or `null` if no free-shipping tier is configured.
 */
export function getFreeShippingThreshold(config: GaugeConfig): number | null {
  const shippingTiers = (config.tiers || []).filter(isShippingTier);
  if (shippingTiers.length === 0) return null;
  return Math.min(...shippingTiers.map(t => t.threshold));
}

/**
 * Helper used by order-creation routes: given a subtotal and a shipping cost,
 * return the adjusted cost (0 if the free-shipping threshold is reached).
 */
export async function applyFreeShipping(
  subtotal: number,
  shippingCost: number
): Promise<number> {
  if (shippingCost <= 0) return 0;
  const config = await getGaugeConfig();
  const threshold = getFreeShippingThreshold(config);
  if (threshold == null) return shippingCost;
  return subtotal >= threshold ? 0 : shippingCost;
}
