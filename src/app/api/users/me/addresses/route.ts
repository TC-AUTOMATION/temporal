import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { addressSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/users/me/addresses
 * Get current user's addresses
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });

    return successResponse(addresses);
  } catch (error) {
    console.error('GET /api/users/me/addresses error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/users/me/addresses
 * Add a new address
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // If this is the first address or marked as default, update others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // Check if user has any addresses
    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label,
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault || existingCount === 0, // First address is default
      },
    });

    return successResponse(address, 201);
  } catch (error) {
    console.error('POST /api/users/me/addresses error:', error);
    return serverErrorResponse();
  }
}
