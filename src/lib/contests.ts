import { prisma } from '@/lib/db/prisma';

/**
 * Enter an order into exactly ONE active contest, based on the highest tier it qualifies for.
 *
 * Règle métier :
 *   - Une commande = une seule entrée (le palier le plus haut gagne).
 *   - ≥ 150 €  → concours veste (palier 150)
 *   - ≥ 70 €   → concours bonnet (palier 70)
 *   - < 70 €   → aucune entrée
 *   - Plusieurs commandes distinctes peuvent participer à plusieurs concours.
 *
 * Une commande qualifie si :
 *   - elle est liée à un userId (les invités ne peuvent pas gagner)
 *   - la commande est payée
 *   - le concours est actif, non tiré, dans sa fenêtre de dates
 *   - le total de la commande est >= contest.purchaseAmount
 *
 * Idempotent grâce à @@unique([contestId, orderId]) sur ContestEntry +
 * createMany({ skipDuplicates }).
 */
export async function enterOrderInContests(orderId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, total: true, paymentStatus: true },
  });

  if (!order || !order.userId || order.paymentStatus !== 'PAID') {
    return 0;
  }

  const orderTotal = Number(order.total);
  const now = new Date();

  // Récupérer tous les concours actifs éligibles, triés par palier décroissant.
  // On ne gardera QUE le plus haut palier atteint.
  const eligibleContests = await prisma.contest.findMany({
    where: {
      isActive: true,
      winnerId: null,
      OR: [{ endDate: null }, { endDate: { gt: now } }],
      startDate: { lte: now },
      purchaseAmount: { lte: orderTotal },
    },
    orderBy: { purchaseAmount: 'desc' },
    select: { id: true, purchaseAmount: true },
    take: 1,
  });

  if (eligibleContests.length === 0) return 0;

  const topTier = eligibleContests[0];

  const result = await prisma.contestEntry.createMany({
    data: [
      {
        contestId: topTier.id,
        userId: order.userId!,
        orderId: order.id,
        orderTotal: order.total,
      },
    ],
    skipDuplicates: true,
  });

  return result.count;
}
