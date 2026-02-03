import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { productSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

/**
 * GET /api/products
 * Get all products (public) with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort'); // default, newest, price-asc, price-desc
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    // Default to active products for public
    if (active !== 'all') {
      where.isActive = true;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as any).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as any).lte = parseFloat(maxPrice);
      }
    }

    // Determine sort order
    let orderBy: any = { sortOrder: 'asc' }; // Default: sortOrder
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, nameEn: true, slug: true },
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
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + products.length < total,
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if SKU or slug already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku: data.sku }, { slug: data.slug }],
      },
    });

    if (existing) {
      return errorResponse('Un produit avec ce SKU ou slug existe déjà');
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return errorResponse('Catégorie non trouvée');
    }

    // Create product on Stripe first
    const stripe = getStripe();

    const stripeProduct = await stripe.products.create({
      name: data.name,
      description: data.description || undefined,
      images: data.images?.filter((img: string) => img && img.startsWith('http')) || undefined,
      metadata: {
        sku: data.sku,
        slug: data.slug,
      },
    });

    // Create a price for this product on Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100), // Stripe uses cents
      currency: 'eur',
    });

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        descriptionEn: data.descriptionEn,
        materials: data.materials,
        materialsEn: data.materialsEn,
        careInstructions: data.careInstructions,
        careInstructionsEn: data.careInstructionsEn,
        modelInfo: data.modelInfo,
        price: data.price,
        originalPrice: data.originalPrice,
        categoryId: data.categoryId,
        images: data.images,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isNew: data.isNew ?? true,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return successResponse(product, 201);
  } catch (error) {
    console.error('POST /api/products error:', error);
    return serverErrorResponse();
  }
}
