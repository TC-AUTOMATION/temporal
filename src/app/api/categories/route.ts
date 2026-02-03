import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { categorySchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/categories
 * Get all categories (public)
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return successResponse(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/categories
 * Create a new category (admin only)
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
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return errorResponse('Une catégorie avec ce slug existe déjà');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    return successResponse(category, 201);
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return serverErrorResponse();
  }
}
