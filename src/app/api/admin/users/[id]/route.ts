import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

// Update user schema
const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  newsletter: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/users/[id]
 * Get user details with order history (admin only)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse();
    }
    if (!currentUser.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isAdmin: true,
        isActive: true,
        newsletter: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            items: {
              select: {
                productName: true,
                quantity: true,
              },
            },
          },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        },
        addresses: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            postalCode: true,
            country: true,
            isDefault: true,
          },
        },
        _count: {
          select: {
            orders: true,
            tickets: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return notFoundResponse('Utilisateur non trouvé');
    }

    // Calculate total spent
    const totalSpent = user.orders.reduce((sum, order) => {
      return sum + Number(order.total);
    }, 0);

    return successResponse({
      user: {
        ...user,
        totalSpent,
        orderCount: user._count.orders,
        ticketCount: user._count.tickets,
        addressCount: user._count.addresses,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/users/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin only)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse();
    }
    if (!currentUser.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse('Utilisateur non trouvé');
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Données invalides');
    }

    const data = validation.data;

    // Prevent self-deactivation
    if (currentUser.id === id && data.isActive === false) {
      return errorResponse('Vous ne pouvez pas désactiver votre propre compte');
    }

    // Prevent self-demotion
    if (currentUser.id === id && data.isAdmin === false) {
      return errorResponse('Vous ne pouvez pas retirer vos droits administrateur');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isAdmin: true,
        isActive: true,
        newsletter: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('PUT /api/admin/users/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete user (admin only)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse();
    }
    if (!currentUser.isAdmin) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse('Utilisateur non trouvé');
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      return errorResponse('Vous ne pouvez pas supprimer votre propre compte');
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return serverErrorResponse();
  }
}
