import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({ select: { id: true, orderNumber: true } })
  const orderIds = orders.map(o => o.id)

  const deletedEntries = await prisma.contestEntry.deleteMany({
    where: { orderId: { in: orderIds } },
  })

  await prisma.contest.updateMany({
    where: { winnerOrderId: { in: orderIds } },
    data: { winnerOrderId: null },
  })

  const deletedOrders = await prisma.order.deleteMany({})

  console.log(`Deleted ${deletedEntries.count} contest entries`)
  console.log(`Deleted ${deletedOrders.count} orders`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
