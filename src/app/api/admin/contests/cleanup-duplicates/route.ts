import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/contests/cleanup-duplicates
 *
 * Nettoie les participations en double issues de l'ancien comportement
 * (avant le fix, une grosse commande pouvait être inscrite à plusieurs concours).
 *
 * Règle métier appliquée :
 *   - Une commande = une seule entrée, dans le concours du palier le plus haut
 *     que la commande atteint (purchaseAmount maximum).
 *   - Plusieurs commandes distinctes peuvent participer à plusieurs concours.
 *
 * On regroupe les entrées par orderId. Pour chaque commande qui possède
 * plusieurs entrées, on garde celle qui est dans le concours avec le
 * purchaseAmount le plus élevé et on supprime les autres.
 *
 * Les entrées manuelles (sans orderId) ne sont jamais touchées.
 * Une entrée gagnante (entry.userId === contest.winnerId) n'est jamais supprimée.
 */
export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    // Récupérer toutes les entrées liées à une commande, avec le contest associé
    const entries = await prisma.contestEntry.findMany({
      where: { orderId: { not: null } },
      select: {
        id: true,
        orderId: true,
        userId: true,
        contestId: true,
      },
    });

    // Récupérer les concours pour connaître purchaseAmount + winnerId
    const contestIds = [...new Set(entries.map((e) => e.contestId))];
    const contests = await prisma.contest.findMany({
      where: { id: { in: contestIds } },
      select: { id: true, purchaseAmount: true, winnerId: true, prizeName: true },
    });
    const contestMap = new Map(contests.map((c) => [c.id, c]));

    // Grouper par orderId
    const byOrder = new Map<string, typeof entries>();
    for (const entry of entries) {
      if (!entry.orderId) continue;
      const list = byOrder.get(entry.orderId) || [];
      list.push(entry);
      byOrder.set(entry.orderId, list);
    }

    const toDelete: string[] = [];
    const kept: { entryId: string; contestName: string }[] = [];

    for (const [, orderEntries] of byOrder) {
      if (orderEntries.length < 2) continue; // Pas de doublon

      // Trier par purchaseAmount décroissant
      const sorted = [...orderEntries].sort((a, b) => {
        const ca = contestMap.get(a.contestId);
        const cb = contestMap.get(b.contestId);
        const pa = ca ? Number(ca.purchaseAmount) : 0;
        const pb = cb ? Number(cb.purchaseAmount) : 0;
        return pb - pa;
      });

      // Garder l'entrée dans le palier le plus haut, supprimer les autres
      const [keep, ...drop] = sorted;
      const keepContest = contestMap.get(keep.contestId);
      kept.push({
        entryId: keep.id,
        contestName: keepContest?.prizeName || keep.contestId,
      });

      for (const entry of drop) {
        // Ne jamais supprimer une entrée gagnante
        const contest = contestMap.get(entry.contestId);
        if (
          contest?.winnerId &&
          entry.userId &&
          contest.winnerId === entry.userId
        ) {
          continue;
        }
        toDelete.push(entry.id);
      }
    }

    let deletedCount = 0;
    if (toDelete.length > 0) {
      const result = await prisma.contestEntry.deleteMany({
        where: { id: { in: toDelete } },
      });
      deletedCount = result.count;
    }

    return successResponse({
      deletedCount,
      ordersWithDuplicates: kept.length,
      message: `${deletedCount} participation(s) en double supprimée(s)`,
    });
  } catch (error) {
    console.error('POST /api/admin/contests/cleanup-duplicates error:', error);
    return serverErrorResponse();
  }
}
