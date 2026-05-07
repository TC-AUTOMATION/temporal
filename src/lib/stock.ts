import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Utilitaires de gestion du stock qui prennent en compte les variantes "bundle"
 * (ensembles composés de plusieurs variantes, par ex. veste + jogging).
 *
 * Quand une variante marquée isBundle est vendue, il faut aussi décrémenter
 * le stock de ses composants (via ProductBundleComponent). Symétriquement,
 * quand on restaure le stock (annulation, remboursement), on restaure aussi
 * les composants.
 */

type TxClient = Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$extends'
>;

export interface VariantOp {
  id: string;
  quantity: number;
}

/**
 * Étend une liste de décréments/incréments variantes pour inclure
 * les composants éventuels (si la variante est un bundle).
 *
 * Retourne la liste agrégée (y compris la variante elle-même) avec les
 * quantités sommées par variantId.
 */
export async function expandWithBundleComponents(
  tx: TxClient | Prisma.TransactionClient,
  ops: VariantOp[]
): Promise<VariantOp[]> {
  if (ops.length === 0) return [];

  const variantIds = ops.map((o) => o.id);

  // Récupérer les composants pour tous les variants fournis (seuls les bundles en auront)
  const components = await tx.productBundleComponent.findMany({
    where: { bundleVariantId: { in: variantIds } },
    select: {
      bundleVariantId: true,
      componentVariantId: true,
      quantity: true,
    },
  });

  // Map bundleVariantId → composants
  const byBundle = new Map<string, { componentVariantId: string; quantity: number }[]>();
  for (const c of components) {
    const list = byBundle.get(c.bundleVariantId) || [];
    list.push({ componentVariantId: c.componentVariantId, quantity: c.quantity });
    byBundle.set(c.bundleVariantId, list);
  }

  // Agréger par variantId final (ajoute les composants, en plus de la variante elle-même)
  const agg = new Map<string, number>();
  for (const op of ops) {
    agg.set(op.id, (agg.get(op.id) || 0) + op.quantity);
    const comps = byBundle.get(op.id);
    if (comps) {
      for (const c of comps) {
        agg.set(
          c.componentVariantId,
          (agg.get(c.componentVariantId) || 0) + c.quantity * op.quantity
        );
      }
    }
  }

  return Array.from(agg.entries()).map(([id, quantity]) => ({ id, quantity }));
}
