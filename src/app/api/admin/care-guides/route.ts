import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string, currentId?: string): Promise<string> {
  const seed = base || 'guide';
  let slug = seed;
  let i = 2;
  for (let attempt = 0; attempt < 50; attempt++) {
    const existing = await prisma.careGuide.findUnique({ where: { categorySlug: slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${seed}-${i++}`;
  }
  return `${seed}-${Date.now()}`;
}

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

    if (!nameFr || !nameEn) {
      return errorResponse('Nom FR et Nom EN requis');
    }

    const slug = await uniqueSlug(categorySlug?.trim() || slugify(nameFr));

    const guide = await prisma.careGuide.create({
      data: {
        categorySlug: slug,
        nameFr,
        nameEn,
        instructionsFr: instructionsFr || '',
        instructionsEn: instructionsEn || '',
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

    if (data.nameFr !== undefined && !data.nameFr) {
      return errorResponse('Nom FR requis');
    }
    if (data.nameEn !== undefined && !data.nameEn) {
      return errorResponse('Nom EN requis');
    }

    if (data.categorySlug !== undefined && data.categorySlug) {
      data.categorySlug = await uniqueSlug(slugify(data.categorySlug), id);
    }

    const guide = await prisma.careGuide.update({
      where: { id },
      data,
    });

    return successResponse(guide);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return errorResponse('Un guide de lavage existe déjà pour cette catégorie');
    }
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
