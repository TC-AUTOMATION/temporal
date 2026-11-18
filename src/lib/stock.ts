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

// ==================== HISTORIQUE DES MOUVEMENTS DE STOCK ====================

export type StockMovementSource = 'AUTO' | 'MANUAL';
export type StockMovementReason =
  | 'ORDER'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'MANUAL_ADJUSTMENT'
  | 'PRODUCT_EDIT'
  | 'INITIAL';

export interface StockMovementContext {
  source: StockMovementSource;
  reason: StockMovementReason;
  orderId?: string | null;
  orderNumber?: string | null;
  userId?: string | null;
  userName?: string | null;
  note?: string | null;
}

type AnyTx = TxClient | Prisma.TransactionClient;

/**
 * Écrit une ligne d'historique pour une variante dont le stock vient d'être
 * modifié (le stock lu est celui APRÈS modification, dans la même transaction).
 */
async function logMovement(
  tx: AnyTx,
  variantId: string,
  delta: number,
  ctx: StockMovementContext,
  extraNote?: string
) {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
    select: {
      id: true,
      stock: true,
      sku: true,
      color: true,
      size: true,
      productId: true,
      product: { select: { name: true } },
    },
  });
  if (!variant) return;

  const note = [ctx.note, extraNote].filter(Boolean).join(' · ') || null;

  await tx.stockMovement.create({
    data: {
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      delta,
      stockBefore: variant.stock - delta,
      stockAfter: variant.stock,
      source: ctx.source,
      reason: ctx.reason,
      orderId: ctx.orderId ?? null,
      orderNumber: ctx.orderNumber ?? null,
      userId: ctx.userId ?? null,
      userName: ctx.userName ?? null,
      note,
    },
  });
}

/**
 * Retire du stock (avec garde anti-négatif) pour une liste de variantes,
 * composants d'ensembles inclus, et journalise chaque mouvement.
 * Lève une erreur si le stock est insuffisant (la transaction est annulée).
 */
export async function decrementStockWithHistory(
  tx: AnyTx,
  ops: VariantOp[],
  ctx: StockMovementContext,
  insufficientMessage = 'Stock insuffisant'
): Promise<VariantOp[]> {
  const bundleIds = new Set(ops.map((o) => o.id));
  const expanded = await expandWithBundleComponents(tx, ops);
  for (const v of expanded) {
    if (v.quantity <= 0) continue;
    const updated = await tx.productVariant.updateMany({
      where: { id: v.id, stock: { gte: v.quantity } },
      data: { stock: { decrement: v.quantity } },
    });
    if (updated.count === 0) {
      throw new Error(`${insufficientMessage} (variant ${v.id})`);
    }
    await logMovement(tx, v.id, -v.quantity, ctx, bundleIds.has(v.id) ? undefined : 'Composant d\'ensemble');
  }
  return expanded;
}

/**
 * Remet du stock pour une liste de variantes (composants d'ensembles inclus)
 * et journalise chaque mouvement.
 */
export async function incrementStockWithHistory(
  tx: AnyTx,
  ops: VariantOp[],
  ctx: StockMovementContext
): Promise<VariantOp[]> {
  const bundleIds = new Set(ops.map((o) => o.id));
  const expanded = await expandWithBundleComponents(tx, ops);
  for (const v of expanded) {
    if (v.quantity <= 0) continue;
    const updated = await tx.productVariant.updateMany({
      where: { id: v.id },
      data: { stock: { increment: v.quantity } },
    });
    if (updated.count === 0) continue; // variante supprimée entre-temps
    await logMovement(tx, v.id, v.quantity, ctx, bundleIds.has(v.id) ? undefined : 'Composant d\'ensemble');
  }
  return expanded;
}

/**
 * Ajustement manuel d'une seule variante (sans expansion d'ensemble) :
 * delta positif ou négatif. Le stock ne peut pas descendre sous 0.
 */
export async function adjustVariantStock(
  tx: AnyTx,
  variantId: string,
  delta: number,
  ctx: StockMovementContext
) {
  if (delta === 0) return;
  if (delta < 0) {
    const updated = await tx.productVariant.updateMany({
      where: { id: variantId, stock: { gte: -delta } },
      data: { stock: { decrement: -delta } },
    });
    if (updated.count === 0) throw new Error('Stock insuffisant pour retirer cette quantité');
  } else {
    const updated = await tx.productVariant.updateMany({
      where: { id: variantId },
      data: { stock: { increment: delta } },
    });
    if (updated.count === 0) throw new Error('Variante introuvable');
  }
  await logMovement(tx, variantId, delta, ctx);
}

/** Construit la liste d'opérations stock à partir des lignes d'une commande. */
export function opsFromOrderItems(
  items: { variantId: string | null; quantity: number }[]
): VariantOp[] {
  return items
    .filter((i) => i.variantId)
    .map((i) => ({ id: i.variantId as string, quantity: i.quantity }));
}

export interface VariantInput {
  sku: string;
  color: string;
  colorHex?: string | null;
  size: string;
  stock: number;
  isActive?: boolean;
}

/**
 * Synchronise les variantes d'un produit avec la liste envoyée par le
 * formulaire admin, SANS supprimer/recréer les variantes existantes :
 *  - même (couleur, taille) → mise à jour en place (ID conservé)
 *  - nouvelle → créée
 *  - absente → supprimée (les lignes de commande sont détachées)
 * Chaque changement de stock est journalisé (source MANUAL, PRODUCT_EDIT).
 */
export async function syncProductVariants(
  tx: AnyTx,
  productId: string,
  variants: VariantInput[],
  actor: { userId?: string | null; userName?: string | null; note?: string | null }
) {
  const ctx: StockMovementContext = {
    source: 'MANUAL',
    reason: 'PRODUCT_EDIT',
    userId: actor.userId,
    userName: actor.userName,
    note: actor.note ?? 'Modifié depuis la fiche produit',
  };
  const key = (color: string, size: string) => `${color}__${size}`;

  const existing = await tx.productVariant.findMany({ where: { productId } });
  const existingByKey = new Map(existing.map((v) => [key(v.color, v.size), v]));
  const incomingKeys = new Set(variants.map((v) => key(v.color, v.size)));

  // 1. Supprimer les variantes retirées (on journalise la sortie du stock restant)
  const toDelete = existing.filter((v) => !incomingKeys.has(key(v.color, v.size)));
  if (toDelete.length > 0) {
    const ids = toDelete.map((v) => v.id);
    const productName =
      (await tx.product.findUnique({ where: { id: productId }, select: { name: true } }))?.name || '';
    for (const v of toDelete) {
      if (v.stock !== 0) {
        await tx.stockMovement.create({
          data: {
            variantId: null,
            productId,
            productName,
            sku: v.sku,
            color: v.color,
            size: v.size,
            delta: -v.stock,
            stockBefore: v.stock,
            stockAfter: 0,
            source: 'MANUAL',
            reason: 'PRODUCT_EDIT',
            userId: actor.userId ?? null,
            userName: actor.userName ?? null,
            note: 'Variante supprimée de la fiche produit',
          },
        });
      }
    }
    await tx.orderItem.updateMany({ where: { variantId: { in: ids } }, data: { variantId: null } });
    await tx.productVariant.deleteMany({ where: { id: { in: ids } } });
  }

  // 2. Mettre à jour / créer
  for (const v of variants) {
    const current = existingByKey.get(key(v.color, v.size));
    if (current) {
      const delta = v.stock - current.stock;
      await tx.productVariant.update({
        where: { id: current.id },
        data: {
          sku: v.sku,
          colorHex: v.colorHex || null,
          isActive: v.isActive ?? true,
          ...(delta !== 0 && { stock: { increment: delta } }),
        },
      });
      if (delta !== 0) await logMovement(tx, current.id, delta, ctx);
    } else {
      const created = await tx.productVariant.create({
        data: {
          productId,
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex || null,
          size: v.size,
          stock: v.stock,
          isActive: v.isActive ?? true,
        },
      });
      if (v.stock !== 0) await logMovement(tx, created.id, v.stock, ctx);
    }
  }
}
