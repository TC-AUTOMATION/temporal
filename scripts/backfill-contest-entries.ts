import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { enterOrderInContests } from '../src/lib/contests';

const prisma = new PrismaClient();

async function main() {
  const paidOrders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      userId: { not: null },
    },
    select: { id: true, orderNumber: true, total: true, userId: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${paidOrders.length} paid order(s) with a user account\n`);

  let totalEntries = 0;
  for (const order of paidOrders) {
    const count = await enterOrderInContests(order.id);
    if (count > 0) {
      console.log(`✅ ${order.orderNumber} (${order.total}€) → ${count} entry(ies)`);
      totalEntries += count;
    } else {
      console.log(`—  ${order.orderNumber} (${order.total}€) → not eligible / already entered`);
    }
  }

  console.log(`\nDone. ${totalEntries} contest entry(ies) created.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
