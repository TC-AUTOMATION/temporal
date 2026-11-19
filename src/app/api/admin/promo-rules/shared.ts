import { z } from 'zod';

export const tierSchema = z.object({
  condition: z.enum(['ANY', 'PACK', 'CATEGORY', 'PRODUCT']),
  targets: z.array(z.string()).default([]),
  percent: z.number().min(1).max(90),
});

export const promoRuleSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(50)
    .transform((s) => s.toUpperCase().replace(/\s+/g, ''))
    .refine((s) => /^[A-Z0-9_-]+$/.test(s), 'Lettres, chiffres, - et _ uniquement'),
  name: z.string().min(1).max(80),
  isAutomatic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  tiers: z.array(tierSchema).min(1, 'Au moins un palier'),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().nullable().optional(),
  minPurchase: z.number().positive().nullable().optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().nullable().optional(),
});

export function toDbData(d: z.infer<typeof promoRuleSchema>) {
  return {
    code: d.code,
    name: d.name,
    type: 'TIERED' as const,
    // value = meilleur % (indicatif, pour l'affichage dans les listes existantes)
    value: Math.max(...d.tiers.map((t) => t.percent)),
    rules: d.tiers,
    isAutomatic: d.isAutomatic,
    isActive: d.isActive,
    validFrom: new Date(d.validFrom),
    validUntil: d.validUntil ? new Date(d.validUntil) : null,
    minPurchase: d.minPurchase ?? null,
    maxDiscount: d.maxDiscount ?? null,
    maxUses: d.maxUses ?? null,
    maxUsesPerUser: d.maxUsesPerUser ?? null,
  };
}
