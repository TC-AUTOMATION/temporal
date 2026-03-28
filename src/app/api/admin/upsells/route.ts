import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const upsellSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameEn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  productId: z.string().min(1, 'Product is required'),
  triggerType: z.enum(['cart_total', 'product_in_cart', 'category_in_cart']),
  triggerValue: z.string().min(1, 'Trigger value is required'),
  displayLocation: z.enum(['cart', 'checkout', 'product_page']),
  discountType: z.enum(['percentage', 'fixed', 'free']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  freeThreshold: z.number().min(0).optional().nullable(),
  message: z.string().optional().nullable(),
  messageEn: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * GET /api/admin/upsells
 * List all upsells with product details (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const upsells = await prisma.upsell.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            price: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return successResponse({ upsells });
  } catch (error) {
    console.error('GET /api/admin/upsells error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/upsells
 * Create a new upsell (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = upsellSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues.map(i => i.message).join(', '));
    }

    const data = validation.data;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      return errorResponse('Product not found');
    }

    const upsell = await prisma.upsell.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        productId: data.productId,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        displayLocation: data.displayLocation,
        discountType: data.discountType,
        discountValue: data.discountValue,
        freeThreshold: data.freeThreshold,
        message: data.message,
        messageEn: data.messageEn,
        image: data.image,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            price: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return successResponse({ upsell }, 201);
  } catch (error) {
    console.error('POST /api/admin/upsells error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/upsells
 * Update an existing upsell (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse('Upsell ID is required');
    }

    const existing = await prisma.upsell.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Upsell not found', 404);
    }

    // Validate update data (partial)
    const partialSchema = upsellSchema.partial();
    const validation = partialSchema.safeParse(updateData);
    if (!validation.success) {
      return errorResponse(validation.error.issues.map(i => i.message).join(', '));
    }

    const data = validation.data;

    // If productId is changing, verify new product exists
    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!product) {
        return errorResponse('Product not found');
      }
    }

    const upsell = await prisma.upsell.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.productId !== undefined && { productId: data.productId }),
        ...(data.triggerType !== undefined && { triggerType: data.triggerType }),
        ...(data.triggerValue !== undefined && { triggerValue: data.triggerValue }),
        ...(data.displayLocation !== undefined && { displayLocation: data.displayLocation }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.freeThreshold !== undefined && { freeThreshold: data.freeThreshold }),
        ...(data.message !== undefined && { message: data.message }),
        ...(data.messageEn !== undefined && { messageEn: data.messageEn }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            price: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return successResponse({ upsell });
  } catch (error) {
    console.error('PUT /api/admin/upsells error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/upsells
 * Delete an upsell (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Upsell ID is required');
    }

    const existing = await prisma.upsell.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Upsell not found', 404);
    }

    await prisma.upsell.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/admin/upsells error:', error);
    return serverErrorResponse();
  }
}
