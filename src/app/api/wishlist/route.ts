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

const addToWishlistSchema = z.object({
  productId: z.string().cuid(),
});

/**
 * GET /api/wishlist
 * Get user's wishlist items
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                color: true,
                colorHex: true,
                size: true,
                stock: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({
      items: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error('GET /api/wishlist error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = addToWishlistSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { productId } = validation.data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (existing) {
      return errorResponse('Product already in wishlist', 400);
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
            variants: true,
          },
        },
      },
    });

    return successResponse(wishlistItem, 201);
  } catch (error) {
    console.error('POST /api/wishlist error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/wishlist
 * Remove product from wishlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Find and delete
    const deleted = await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (deleted.count === 0) {
      return errorResponse('Product not in wishlist', 404);
    }

    return successResponse({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('DELETE /api/wishlist error:', error);
    return serverErrorResponse();
  }
}
