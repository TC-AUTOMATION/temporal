import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { productSchema } from '@/lib/validations';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

/**
 * GET /api/products/[id]
 * Get a single product by ID (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            color: true,
            colorHex: true,
            size: true,
            stock: true,
          },
        },
      },
    });

    if (!product) {
      return notFoundResponse('Product not found');
    }

    // Don't return inactive products to public
    if (!product.isActive) {
      return notFoundResponse('Product not found');
    }

    const response = successResponse({ product });
    // Anti-cache headers for Safari compatibility
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PATCH /api/products/[id]
 * Update a product (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = productSchema.partial().safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse('Product not found');
    }

    const stripe = getStripe();
    let newStripePriceId = existing.stripePriceId;

    // Sync with Stripe if product exists on Stripe
    if (existing.stripeProductId) {
      // Update Stripe product info (name, description, images)
      const stripeUpdateData: Stripe.ProductUpdateParams = {};
      if (data.name) stripeUpdateData.name = data.name;
      if (data.description !== undefined) stripeUpdateData.description = data.description || '';
      if (data.images) {
        stripeUpdateData.images = data.images.filter((img: string) => img && img.startsWith('http'));
      }
      if (data.isActive !== undefined) stripeUpdateData.active = data.isActive;

      if (Object.keys(stripeUpdateData).length > 0) {
        await stripe.products.update(existing.stripeProductId, stripeUpdateData);
      }

      // If price changed, create a new price (Stripe prices are immutable)
      if (data.price !== undefined && Number(data.price) !== Number(existing.price)) {
        const newPrice = await stripe.prices.create({
          product: existing.stripeProductId,
          unit_amount: Math.round(data.price * 100),
          currency: 'eur',
        });
        newStripePriceId = newPrice.id;

        // Archive old price if exists
        if (existing.stripePriceId) {
          await stripe.prices.update(existing.stripePriceId, { active: false });
        }
      }
    } else {
      // Product doesn't exist on Stripe yet, create it
      const stripeProduct = await stripe.products.create({
        name: data.name || existing.name,
        description: data.description || existing.description || undefined,
        images: (data.images || existing.images)?.filter((img: string) => img && img.startsWith('http')) || undefined,
        metadata: {
          sku: data.sku || existing.sku,
          slug: data.slug || existing.slug,
        },
      });

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round((data.price ?? Number(existing.price)) * 100),
        currency: 'eur',
      });

      newStripePriceId = stripePrice.id;
      // Will be saved along with product update below
      (data as any).stripeProductId = stripeProduct.id;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.sku && { sku: data.sku }),
        ...(data.name && { name: data.name }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.materials !== undefined && { materials: data.materials }),
        ...(data.materialsEn !== undefined && { materialsEn: data.materialsEn }),
        ...(data.careInstructions !== undefined && { careInstructions: data.careInstructions }),
        ...(data.careInstructionsEn !== undefined && { careInstructionsEn: data.careInstructionsEn }),
        ...(data.modelInfo !== undefined && { modelInfo: data.modelInfo }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.images && { images: data.images }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isNew !== undefined && { isNew: data.isNew }),
        ...((data as any).stripeProductId && { stripeProductId: (data as any).stripeProductId }),
        ...(newStripePriceId && { stripePriceId: newStripePriceId }),
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return successResponse(product);
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse('Product not found');
    }

    // Archive on Stripe if exists
    if (existing.stripeProductId) {
      const stripe = getStripe();
      await stripe.products.update(existing.stripeProductId, { active: false });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return serverErrorResponse();
  }
}
