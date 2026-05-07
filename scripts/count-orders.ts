import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.order.count()
  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, customerEmail: true, total: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  console.log(`Total orders: ${count}`)
  console.log(JSON.stringify(orders, null, 2))
  const tickets = await prisma.ticket.count({ where: { orderId: { not: null } } })
  const entries = await prisma.contestEntry.count()
  console.log(`Tickets linked to orders: ${tickets}`)
  console.log(`Contest entries: ${entries}`)
}
main().finally(() => prisma.$disconnect())
