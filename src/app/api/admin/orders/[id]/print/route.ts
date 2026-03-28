import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/orders/[id]/print
 * Mark an order as printed
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return notFoundResponse('Commande introuvable');

    const updated = await prisma.order.update({
      where: { id },
      data: { printedAt: new Date() },
      select: { id: true, orderNumber: true, printedAt: true },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('POST /api/admin/orders/[id]/print error:', error);
    return serverErrorResponse();
  }
}
