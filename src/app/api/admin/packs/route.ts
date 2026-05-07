import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

/**
 * Sanitize a slug: lowercase, remove accents, replace non-alphanum with dashes,
 * collapse multiple dashes, trim leading/trailing dashes.
 */
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const slugField = z
  .string()
  .min(1, 'Slug is required')
  .transform(sanitizeSlug)
  .refine((s) => s.length > 0, 'Slug must contain at least one alphanumeric character');

const packSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: slugField,
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().optional(),
  images: z.array(z.string()).max(10).optional().default([]),
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1),
  })).min(1, 'At least one product is required'),
});

/**
 * GET /api/admin/packs
 * List all packs with their products (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const packs = await prisma.pack.findMany({
      orderBy: { createdAt: 'desc' },
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

    // Calculate original price for each pack
    const packsWithOriginalPrice = packs.map((pack) => {
      const originalPrice = pack.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);
      return {
        ...pack,
        originalPrice,
        discount: originalPrice - Number(pack.price),
        discountPercent: originalPrice > 0
          ? Math.round(((originalPrice - Number(pack.price)) / originalPrice) * 100)
          : 0,
      };
    });

    return successResponse({ packs: packsWithOriginalPrice });
  } catch (error) {
    console.error('GET /api/admin/packs error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/packs
 * Create a new pack (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json();
    const validation = packSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if slug already exists
    const existing = await prisma.pack.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return validationErrorResponse({ message: 'Pack slug already exists' } as unknown as z.ZodError);
    }

    // Verify all products exist
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      return validationErrorResponse({ message: 'One or more products not found' } as unknown as z.ZodError);
    }

    // Create pack with items
    const pack = await prisma.pack.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        image: data.image,
        images: data.images ?? [],
        isActive: data.isActive ?? true,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
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

    return successResponse({ pack }, 201);
  } catch (error) {
    console.error('POST /api/admin/packs error:', error);
    return serverErrorResponse();
  }
}
