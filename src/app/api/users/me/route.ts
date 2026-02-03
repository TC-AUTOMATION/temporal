import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { updateUserSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isAdmin: true,
        isActive: true,
        newsletter: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    return successResponse(fullUser);
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/users/me
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Convert empty strings to null for optional fields
    const firstName = data.firstName === '' ? null : data.firstName;
    const lastName = data.lastName === '' ? null : data.lastName;
    const phone = data.phone === '' ? null : data.phone;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(data.newsletter !== undefined && { newsletter: data.newsletter }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isAdmin: true,
        newsletter: true,
        createdAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('PUT /api/users/me error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/users/me
 * Delete current user account
 */
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return successResponse({ message: 'Compte désactivé' });
  } catch (error) {
    console.error('DELETE /api/users/me error:', error);
    return serverErrorResponse();
  }
}
