import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const updatePackSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1),
  })).optional(),
});

/**
 * GET /api/admin/packs/[id]
 * Get a single pack with products (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    const pack = await prisma.pack.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!pack) {
      return notFoundResponse('Pack not found');
    }

    // Calculate original price
    const originalPrice = pack.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    return successResponse({
      pack: {
        ...pack,
        originalPrice,
        discount: originalPrice - Number(pack.price),
        discountPercent: originalPrice > 0
          ? Math.round(((originalPrice - Number(pack.price)) / originalPrice) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/packs/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/packs/[id]
 * Update a pack (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const validation = updatePackSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if pack exists
    const existing = await prisma.pack.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Pack not found');
    }

    // If updating slug, check for duplicates
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.pack.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate) {
        return validationErrorResponse({ message: 'Pack slug already exists' } as unknown as z.ZodError);
      }
    }

    // If updating items, verify products exist
    if (data.items) {
      const productIds = data.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        return validationErrorResponse({ message: 'One or more products not found' } as unknown as z.ZodError);
      }
    }

    // Update pack with items (replace items if provided)
    const pack = await prisma.pack.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.items && {
          items: {
            deleteMany: {}, // Remove all existing items
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return successResponse({ pack });
  } catch (error) {
    console.error('PUT /api/admin/packs/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/packs/[id]
 * Delete a pack (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { id } = await params;

    // Check if pack exists
    const existing = await prisma.pack.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Pack not found');
    }

    await prisma.pack.delete({ where: { id } });

    return successResponse({ message: 'Pack deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/packs/[id] error:', error);
    return serverErrorResponse();
  }
}
