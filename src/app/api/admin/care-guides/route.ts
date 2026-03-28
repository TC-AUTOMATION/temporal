import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/care-guides
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const guides = await prisma.careGuide.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(guides);
  } catch (error) {
    console.error('GET /api/admin/care-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/admin/care-guides
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { categorySlug, nameFr, nameEn, instructionsFr, instructionsEn, iconSymbols, sortOrder, isActive } = body;

    if (!categorySlug || !nameFr || !nameEn || !instructionsFr || !instructionsEn) {
      return errorResponse('Champs requis manquants');
    }

    const guide = await prisma.careGuide.create({
      data: {
        categorySlug,
        nameFr,
        nameEn,
        instructionsFr,
        instructionsEn,
        iconSymbols: iconSymbols || [],
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    return successResponse(guide, 201);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return errorResponse('Un guide de lavage existe déjà pour cette catégorie');
    }
    console.error('POST /api/admin/care-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/care-guides
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

    const guide = await prisma.careGuide.update({
      where: { id },
      data,
    });

    return successResponse(guide);
  } catch (error) {
    console.error('PUT /api/admin/care-guides error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/care-guides
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

    await prisma.careGuide.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/admin/care-guides error:', error);
    return serverErrorResponse();
  }
}
