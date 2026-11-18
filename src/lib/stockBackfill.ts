import type { Prisma, StockMovementReason } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

/**
 * Reconstitue l'historique de stock à partir de TOUTES les commandes déjà en base.
 *
 * Pour chaque commande :
 *  - une ligne "ORDER" (−quantité) à la date de création de la commande
 *  - si elle a été annulée / paiement échoué → une ligne "ORDER_CANCELLED" (+quantité)
 *  - si elle a été remboursée → une ligne "ORDER_REFUNDED" (+quantité)
 *  (les composants d'ensembles sont aussi pris en compte)
 *
 * Les stocks avant/après de chaque ligne sont recalculés à rebours depuis le stock
 * actuel, et une ligne "INITIAL" indique le stock de départ estimé de chaque variante.
 *
 * Idempotent : les lignes déjà importées (isBackfill = true) sont supprimées puis
 * régénérées ; les mouvements enregistrés en direct ne sont jamais touchés, et une
 * commande qui a déjà un mouvement en direct du même type n'est pas réimportée.
 */
export async function backfillStockHistory(options: { dryRun?: boolean } = {}) {
  const { dryRun = false } = options;

  const [orders, variants, components, liveMovements] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            productId: true,
            variantId: true,
            productName: true,
            productSku: true,
            color: true,
            size: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        productId: true,
        sku: true,
        color: true,
        size: true,
        stock: true,
        product: { select: { name: true } },
      },
    }),
    prisma.productBundleComponent.findMany({
      select: { bundleVariantId: true, componentVariantId: true, quantity: true },
    }),
    prisma.stockMovement.findMany({
      where: { isBackfill: false },
      select: { variantId: true, orderId: true, reason: true, delta: true, createdAt: true },
    }),
  ]);

  const variantById = new Map(variants.map((v) => [v.id, v]));
  const variantByKey = new Map(variants.map((v) => [`${v.productId}__${v.color}__${v.size}`, v]));
  const componentsByBundle = new Map<string, { componentVariantId: string; quantity: number }[]>();
  for (const c of components) {
    const list = componentsByBundle.get(c.bundleVariantId) || [];
    list.push(c);
    componentsByBundle.set(c.bundleVariantId, list);
  }
  const liveKeys = new Set(
    liveMovements.filter((m) => m.orderId).map((m) => `${m.orderId}__${m.reason}`)
  );

  type Ev = {
    variantId: string | null;
    productId: string | null;
    productName: string;
    sku: string | null;
    color: string | null;
    size: string | null;
    delta: number;
    reason: StockMovementReason;
    orderId: string;
    orderNumber: string;
    note: string | null;
    createdAt: Date;
  };
  const events: Ev[] = [];
  let unmatchedItems = 0;
  let ordersUsed = 0;

  for (const order of orders) {
    const isCancelled = order.status === 'CANCELLED' || order.paymentStatus === 'FAILED';
    const isRefunded = order.status === 'REFUNDED' || order.paymentStatus === 'REFUNDED';
    const restoreReason: StockMovementReason | null = isRefunded
      ? 'ORDER_REFUNDED'
      : isCancelled
        ? 'ORDER_CANCELLED'
        : null;

    const doSale = !liveKeys.has(`${order.id}__ORDER`);
    const doRestore = restoreReason !== null && !liveKeys.has(`${order.id}__${restoreReason}`);
    if (!doSale && !doRestore) continue;
    ordersUsed++;

    // Lignes de stock concernées par cette commande (avec composants d'ensembles)
    const lines: Omit<Ev, 'delta' | 'reason' | 'createdAt' | 'note'>[] = [];
    const lineQty: number[] = [];
    const lineNote: (string | null)[] = [];
    for (const item of order.items) {
      const variant =
        (item.variantId && variantById.get(item.variantId)) ||
        variantByKey.get(`${item.productId}__${item.color}__${item.size}`) ||
        null;
      if (!variant && !item.color && !item.size) continue; // produit sans variante → pas de stock
      if (!variant) unmatchedItems++;

      lines.push({
        variantId: variant?.id ?? null,
        productId: variant?.productId ?? item.productId,
        productName: variant?.product.name ?? item.productName,
        sku: variant?.sku ?? item.productSku,
        color: variant?.color ?? item.color,
        size: variant?.size ?? item.size,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
      lineQty.push(item.quantity);
      lineNote.push(variant ? null : 'Variante supprimée depuis');

      for (const comp of (variant && componentsByBundle.get(variant.id)) || []) {
        const cv = variantById.get(comp.componentVariantId);
        if (!cv) continue;
        lines.push({
          variantId: cv.id,
          productId: cv.productId,
          productName: cv.product.name,
          sku: cv.sku,
          color: cv.color,
          size: cv.size,
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
        lineQty.push(item.quantity * comp.quantity);
        lineNote.push("Composant d'ensemble");
      }
    }

    lines.forEach((line, i) => {
      if (doSale) {
        events.push({ ...line, delta: -lineQty[i], reason: 'ORDER', note: lineNote[i], createdAt: order.createdAt });
      }
      if (doRestore && restoreReason) {
        // La date exacte d'annulation n'est pas stockée : on prend la dernière mise à jour
        const at = order.updatedAt > order.createdAt ? order.updatedAt : new Date(order.createdAt.getTime() + 1000);
        events.push({ ...line, delta: lineQty[i], reason: restoreReason, note: lineNote[i], createdAt: at });
      }
    });
  }

  // Recalcul des stocks avant/après à rebours depuis le stock actuel, en tenant
  // compte des mouvements en direct (qui sont exacts).
  type Row = Prisma.StockMovementCreateManyInput;
  const rows: Row[] = [];
  const byVariant = new Map<string, Ev[]>();
  for (const ev of events) {
    if (!ev.variantId) {
      rows.push({ ...ev, source: 'AUTO', isBackfill: true });
      continue;
    }
    const list = byVariant.get(ev.variantId) || [];
    list.push(ev);
    byVariant.set(ev.variantId, list);
  }

  const liveByVariant = new Map<string, { delta: number; createdAt: Date }[]>();
  for (const m of liveMovements) {
    if (!m.variantId) continue;
    const list = liveByVariant.get(m.variantId) || [];
    list.push(m);
    liveByVariant.set(m.variantId, list);
  }

  for (const [variantId, evs] of byVariant) {
    const variant = variantById.get(variantId)!;
    const timeline: { delta: number; createdAt: Date; ev?: Ev }[] = [
      ...evs.map((ev) => ({ delta: ev.delta, createdAt: ev.createdAt, ev })),
      ...(liveByVariant.get(variantId) || []),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    let after = variant.stock;
    const computed: Row[] = [];
    for (let i = timeline.length - 1; i >= 0; i--) {
      const t = timeline[i];
      const before = after - t.delta;
      if (t.ev) {
        computed.push({ ...t.ev, source: 'AUTO', isBackfill: true, stockBefore: before, stockAfter: after });
      }
      after = before;
    }
    const startStock = after;
    const firstAt = timeline[0].createdAt;
    rows.push({
      variantId,
      productId: variant.productId,
      productName: variant.product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      delta: startStock,
      stockBefore: 0,
      stockAfter: startStock,
      source: 'AUTO',
      reason: 'INITIAL',
      note: 'Stock de départ estimé (reconstitué depuis les commandes)',
      isBackfill: true,
      createdAt: new Date(firstAt.getTime() - 1000),
    });
    rows.push(...computed.reverse());
  }

  const stats = {
    ordersScanned: orders.length,
    ordersImported: ordersUsed,
    movementsCreated: rows.length,
    variantsCovered: byVariant.size,
    unmatchedItems,
  };

  if (dryRun) return { ...stats, dryRun: true };

  await prisma.$transaction(
    async (tx) => {
      await tx.stockMovement.deleteMany({ where: { isBackfill: true } });
      for (let i = 0; i < rows.length; i += 1000) {
        await tx.stockMovement.createMany({ data: rows.slice(i, i + 1000) });
      }
    },
    { timeout: 60_000 }
  );

  return { ...stats, dryRun: false };
}
