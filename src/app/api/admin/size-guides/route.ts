import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/size-guides
 * Get all size guides (admin)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const guides = await prisma.sizeGuide.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse(guides);
  } catch (error) {
    console.error('GET /api/admin/size-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/size-guides
 * Create a new size guide
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { categorySlug, nameFr, nameEn, tipsFr, tipsEn, sizes, unit, sortOrder, isActive } = body;

    if (!categorySlug || !nameFr || !nameEn || !sizes) {
      return errorResponse('Champs requis manquants');
    }

    const guide = await prisma.sizeGuide.create({
      data: {
        categorySlug,
        nameFr,
        nameEn,
        tipsFr: tipsFr || '',
        tipsEn: tipsEn || '',
        sizes,
        unit: unit || 'cm',
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    return successResponse(guide, 201);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return errorResponse('Un guide des tailles existe déjà pour cette catégorie');
    }
    console.error('POST /api/admin/size-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/size-guides
 * Update a size guide
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return errorResponse('ID requis');
    }

    const guide = await prisma.sizeGuide.update({
      where: { id },
      data,
    });

    return successResponse(guide);
  } catch (error) {
    console.error('PUT /api/admin/size-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/size-guides
 * Delete a size guide
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('ID requis');
    }

    await prisma.sizeGuide.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/admin/size-guides error:', error);
    return serverErrorResponse();
  }
}
