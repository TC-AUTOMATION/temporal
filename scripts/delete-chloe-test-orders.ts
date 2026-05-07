/**
 * Supprime les commandes test de Chloé Thiel — sauf celle(s) du sticker.
 *
 * Usage :
 *   npx tsx scripts/delete-chloe-test-orders.ts              # dry-run (affiche seulement)
 *   npx tsx scripts/delete-chloe-test-orders.ts --confirm    # supprime réellement
 *
 * Règle : on garde toute commande dont TOUS les items contiennent "sticker"
 * (casse insensible) dans le nom du produit. Les autres sont supprimées.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isStickerOrder(items: { productName: string }[]): boolean {
  if (items.length === 0) return false;
  return items.every((it) => it.productName.toLowerCase().includes('sticker'));
}

async function main() {
  const confirm = process.argv.includes('--confirm');

  const orders = await prisma.order.findMany({
    where: {
      customerFirstName: { equals: 'Chloe', mode: 'insensitive' },
      customerLastName: { equals: 'Thiel', mode: 'insensitive' },
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      createdAt: true,
      customerEmail: true,
      items: { select: { productName: true, quantity: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Trouvé ${orders.length} commande(s) de Chloé Thiel.\n`);

  const toKeep: typeof orders = [];
  const toDelete: typeof orders = [];

  for (const o of orders) {
    if (isStickerOrder(o.items)) {
      toKeep.push(o);
    } else {
      toDelete.push(o);
    }
  }

  console.log('=== À CONSERVER (stickers) ===');
  for (const o of toKeep) {
    const items = o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ');
    console.log(`  KEEP ${o.orderNumber} | ${o.total}€ | ${o.createdAt.toISOString()} | ${items}`);
  }

  console.log('\n=== À SUPPRIMER ===');
  for (const o of toDelete) {
    const items = o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ');
    console.log(`  DEL  ${o.orderNumber} | ${o.total}€ | ${o.createdAt.toISOString()} | ${items}`);
  }

  if (toDelete.length === 0) {
    console.log('\nRien à supprimer.');
    return;
  }

  if (!confirm) {
    console.log(`\n[dry-run] ${toDelete.length} commande(s) seraient supprimées.`);
    console.log(`Relance avec --confirm pour exécuter réellement.`);
    return;
  }

  const idsToDelete = toDelete.map((o) => o.id);

  // Nettoyer les entrées de concours liées à ces commandes
  const deletedEntries = await prisma.contestEntry.deleteMany({
    where: { orderId: { in: idsToDelete } },
  });

  // Décrocher les winnerOrderId éventuels
  await prisma.contest.updateMany({
    where: { winnerOrderId: { in: idsToDelete } },
    data: { winnerOrderId: null },
  });

  // Supprimer les shipments liés
  await prisma.shipment.deleteMany({
    where: { orderId: { in: idsToDelete } },
  });

  // Les OrderItem ont onDelete: Cascade, donc supprimer les commandes suffit
  const deletedOrders = await prisma.order.deleteMany({
    where: { id: { in: idsToDelete } },
  });

  console.log(`\n✅ ${deletedOrders.count} commande(s) supprimée(s)`);
  console.log(`✅ ${deletedEntries.count} entrée(s) de concours nettoyée(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
