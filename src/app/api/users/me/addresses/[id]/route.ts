import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const updateAddressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('France'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * PUT /api/users/me/addresses/[id]
 * Update an address
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validation = updateAddressSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          id: { not: resolvedParams.id },
        },
        data: { isDefault: false },
      });
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: resolvedParams.id },
      data: {
        label: data.label,
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault ?? address.isDefault,
      },
    });

    return successResponse(updatedAddress);
  } catch (error) {
    console.error('PUT /api/users/me/addresses/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/users/me/addresses/[id]
 * Delete an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const resolvedParams = await params;

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    if (!address) {
      return errorResponse('Address not found', 404);
    }

    // Delete address
    await prisma.address.delete({
      where: { id: resolvedParams.id },
    });

    return successResponse({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/users/me/addresses/[id] error:', error);
    return serverErrorResponse();
  }
}
