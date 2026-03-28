import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/orders/print-queue
 * Returns paid orders that haven't been printed yet
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const [pendingOrders, recentlyPrinted] = await Promise.all([
      // Unprinted paid orders (adminNotes doesn't start with "Printed at")
      prisma.order.findMany({
        where: {
          paymentStatus: 'PAID',
          OR: [
            { adminNotes: null },
            { NOT: { adminNotes: { startsWith: 'Printed at' } } },
          ],
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
          promoCode: { select: { code: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Recently printed orders (last 24h) for reprint
      prisma.order.findMany({
        where: {
          adminNotes: { startsWith: 'Printed at' },
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
          promoCode: { select: { code: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    return successResponse({ pendingOrders, recentlyPrinted });
  } catch (error) {
    console.error('GET /api/admin/orders/print-queue error:', error);
    return serverErrorResponse();
  }
}
