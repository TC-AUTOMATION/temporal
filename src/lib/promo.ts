import { Prisma, type PromoCode, type PrismaClient } from '@prisma/client';

/**
 * Logique de calcul des codes promo, partagée par :
 *  - /api/promo/validate (aperçu au checkout)
 *  - /api/promo/auto     (promo automatique en cours, ex. Black Friday)
 *  - /api/stripe         (création de la session de paiement)
 *  - /api/orders         (commande directe)
 *
 * Type TIERED (paliers) : une liste de paliers évalués dans l'ordre, le premier
 * dont la condition est remplie donne le % de réduction appliqué sur TOUTE la
 * commande (sous-total). Ex. Black Friday :
 *   1. un ensemble (pack) complet au panier → -20 %
 *   2. n'importe quel article              → -15 %
 */

const D = Prisma.Decimal;
type Decimal = Prisma.Decimal;
type Db = Prisma.TransactionClient | PrismaClient;

export type TierCondition = 'ANY' | 'PACK' | 'CATEGORY' | 'PRODUCT';

export interface PromoTier {
  condition: TierCondition;
  /** PACK: ids de packs (vide = n'importe quel pack) · CATEGORY: slugs · PRODUCT: ids produits */
  targets: string[];
  percent: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface PromoContext {
  subtotal: Decimal;
  /** Frais de livraison (pour FREE_SHIPPING). null = inconnu (aperçu) */
  shippingCost: Decimal | null;
  lines: CartLine[];
}

export interface PromoResult {
  promo: PromoCode;
  discount: Decimal;
  label: string;
  tierIndex?: number;
}

export function parseTiers(rules: unknown): PromoTier[] {
  if (!Array.isArray(rules)) return [];
  return rules
    .filter((r): r is PromoTier =>
      !!r && typeof r === 'object' &&
      ['ANY', 'PACK', 'CATEGORY', 'PRODUCT'].includes((r as PromoTier).condition) &&
      typeof (r as PromoTier).percent === 'number'
    )
    .map((r) => ({ condition: r.condition, targets: Array.isArray(r.targets) ? r.targets.map(String) : [], percent: r.percent }));
}

/** Infos sur le panier nécessaires pour évaluer les conditions des paliers. */
interface CartFacts {
  productQty: Map<string, number>;
  categorySlugs: Set<string>;
  packs: { id: string; items: { productId: string; quantity: number }[] }[];
}

async function loadCartFacts(db: Db, lines: CartLine[]): Promise<CartFacts> {
  const productQty = new Map<string, number>();
  for (const l of lines) productQty.set(l.productId, (productQty.get(l.productId) || 0) + l.quantity);

  const ids = Array.from(productQty.keys());
  const [products, packs] = await Promise.all([
    ids.length
      ? db.product.findMany({ where: { id: { in: ids } }, select: { category: { select: { slug: true } } } })
      : Promise.resolve([]),
    db.pack.findMany({ select: { id: true, items: { select: { productId: true, quantity: true } } } }),
  ]);
  return {
    productQty,
    categorySlugs: new Set(products.map((p) => p.category.slug)),
    packs,
  };
}

function tierMatches(tier: PromoTier, facts: CartFacts): boolean {
  switch (tier.condition) {
    case 'ANY':
      return facts.productQty.size > 0;
    case 'CATEGORY':
      return tier.targets.some((slug) => facts.categorySlugs.has(slug));
    case 'PRODUCT':
      return tier.targets.some((id) => (facts.productQty.get(id) || 0) > 0);
    case 'PACK': {
      const candidates = tier.targets.length ? facts.packs.filter((p) => tier.targets.includes(p.id)) : facts.packs;
      // Un pack est "au panier" si tous ses produits y sont dans les bonnes quantités
      return candidates.some(
        (pack) =>
          pack.items.length > 0 &&
          pack.items.every((it) => (facts.productQty.get(it.productId) || 0) >= it.quantity)
      );
    }
  }
}

/** Vérifie dates / activation / utilisations / minimum. Retourne un message d'erreur ou null. */
export function checkPromoValidity(promo: PromoCode, subtotal: Decimal, now = new Date()): string | null {
  if (!promo.isActive) return "Ce code promo n'est plus actif";
  if (promo.validFrom && now < promo.validFrom) return "Ce code promo n'est pas encore valide";
  if (promo.validUntil && now > promo.validUntil) return 'Ce code promo a expiré';
  if (promo.maxUses && promo.usedCount >= promo.maxUses) return "Ce code promo a atteint sa limite d'utilisation";
  if (promo.minPurchase && subtotal.lt(promo.minPurchase)) {
    return `Minimum d'achat requis: ${Number(promo.minPurchase).toFixed(2)}€`;
  }
  return null;
}

/**
 * Calcule la réduction d'un code (déjà validé). Retourne null si le code ne
 * s'applique pas à ce panier (ex. aucun palier ne correspond).
 */
export async function computePromoDiscount(
  db: Db,
  promo: PromoCode,
  ctx: PromoContext,
  facts?: CartFacts
): Promise<PromoResult | null> {
  const { subtotal } = ctx;
  let discount = new D(0);
  let label = '';
  let tierIndex: number | undefined;
  const capMax = () => {
    if (promo.maxDiscount && discount.gt(promo.maxDiscount)) discount = new D(promo.maxDiscount.toString());
  };

  switch (promo.type) {
    case 'PERCENTAGE':
      discount = subtotal.mul(promo.value).div(100);
      capMax();
      label = `${Number(promo.value)}% de réduction`;
      break;
    case 'FIXED':
      discount = new D(promo.value.toString());
      label = `${Number(promo.value).toFixed(2)}€ de réduction`;
      break;
    case 'FREE_SHIPPING':
      discount = ctx.shippingCost ?? new D(5.9);
      label = ctx.shippingCost ? 'Livraison offerte' : "Livraison gratuite (jusqu'a 5,90€)";
      break;
    case 'PER_TRANCHE': {
      const trancheSize = promo.trancheSize ? new D(promo.trancheSize.toString()) : new D(100);
      const tranches = Math.floor(Number(subtotal.div(trancheSize)));
      discount = new D(tranches).mul(promo.value);
      capMax();
      const valueNum = Number(promo.value).toFixed(2);
      const trancheNum = Number(trancheSize).toFixed(0);
      label = tranches > 0
        ? `-${Number(discount.gt(subtotal) ? subtotal : discount).toFixed(2)}€ (${tranches}× ${valueNum}€ par tranche de ${trancheNum}€)`
        : `${valueNum}€ par tranche de ${trancheNum}€`;
      break;
    }
    case 'TIERED': {
      const tiers = parseTiers(promo.rules);
      const f = facts ?? (await loadCartFacts(db, ctx.lines));
      const idx = tiers.findIndex((t) => tierMatches(t, f));
      if (idx === -1) return null;
      tierIndex = idx;
      discount = subtotal.mul(tiers[idx].percent).div(100);
      capMax();
      label = `${promo.name || promo.code} : -${tiers[idx].percent}% sur la commande`;
      break;
    }
  }

  if (discount.gt(subtotal) && promo.type !== 'FREE_SHIPPING') discount = subtotal;
  discount = discount.toDecimalPlaces(2);
  return { promo, discount, label, tierIndex };
}

async function userUsageExceeded(db: Db, promo: PromoCode, userId?: string | null) {
  if (!promo.maxUsesPerUser || !userId) return false;
  const count = await db.order.count({
    where: { userId, promoCodeId: promo.id, paymentStatus: { in: ['PAID', 'PENDING'] } },
  });
  return count >= promo.maxUsesPerUser;
}

/** Meilleure promo automatique active pour ce panier (ou null). */
export async function findBestAutomaticPromo(
  db: Db,
  ctx: PromoContext,
  userId?: string | null
): Promise<PromoResult | null> {
  const now = new Date();
  const autos = await db.promoCode.findMany({
    where: {
      isAutomatic: true,
      isActive: true,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
  });
  if (autos.length === 0) return null;

  const facts = await loadCartFacts(db, ctx.lines);
  let best: PromoResult | null = null;
  for (const promo of autos) {
    if (checkPromoValidity(promo, ctx.subtotal, now)) continue;
    if (await userUsageExceeded(db, promo, userId)) continue;
    const r = await computePromoDiscount(db, promo, ctx, facts);
    if (r && r.discount.gt(0) && (!best || r.discount.gt(best.discount))) best = r;
  }
  return best;
}

/**
 * Promo finale d'une commande : le code saisi par le client et la meilleure
 * promo automatique ne se cumulent pas — on garde la plus avantageuse.
 * Lève une erreur si le code saisi dépasse la limite par utilisateur.
 */
export async function resolveOrderPromo(
  db: Db,
  opts: { code?: string | null; userId?: string | null; ctx: PromoContext }
): Promise<PromoResult | null> {
  let fromCode: PromoResult | null = null;

  if (opts.code) {
    const promo = await db.promoCode.findUnique({ where: { code: opts.code.toUpperCase() } });
    if (promo && !checkPromoValidity(promo, opts.ctx.subtotal)) {
      if (await userUsageExceeded(db, promo, opts.userId)) {
        throw new Error('Vous avez déjà utilisé ce code promo le nombre maximum de fois');
      }
      fromCode = await computePromoDiscount(db, promo, opts.ctx);
    }
  }

  const auto = await findBestAutomaticPromo(db, opts.ctx, opts.userId);
  if (auto && (!fromCode || auto.discount.gt(fromCode.discount))) return auto;
  return fromCode;
}
