import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  source: z.string().max(50).default('popup'),
});

/**
 * GET /api/newsletter
 * Get all newsletter subscribers (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return successResponse({
      subscribers,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET /api/newsletter error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/newsletter
 * Subscribe to newsletter (public)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;
    const email = data.email.toLowerCase();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return errorResponse('Vous êtes déjà inscrit à la newsletter', 400);
      } else {
        // Reactivate subscription
        const subscriber = await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            firstName: data.firstName || existing.firstName,
            lastName: data.lastName || existing.lastName,
            source: data.source,
          },
        });
        return successResponse({
          ...subscriber,
          message: 'Vous êtes à nouveau inscrit à la newsletter',
        });
      }
    }

    // Check if user has an account
    const user = await getCurrentUser();
    const existingUser = user || await prisma.user.findUnique({
      where: { email },
    });

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName: data.firstName || existingUser?.firstName || null,
        lastName: data.lastName || existingUser?.lastName || null,
        source: data.source,
        userId: existingUser?.id || null,
      },
    });

    // Also update user's newsletter preference if they have an account
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { newsletter: true },
      });
    }

    return successResponse({
      ...subscriber,
      message: 'Inscription réussie ! Bienvenue dans la communauté Temporal.',
    }, 201);
  } catch (error) {
    console.error('POST /api/newsletter error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/newsletter
 * Unsubscribe from newsletter
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return errorResponse('Email requis', 400);
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return errorResponse('Email non trouvé', 404);
    }

    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: { isActive: false },
    });

    // Also update user's newsletter preference if they have an account
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { newsletter: false },
      });
    }

    return successResponse({ message: 'Désinscription effectuée avec succès' });
  } catch (error) {
    console.error('DELETE /api/newsletter error:', error);
    return serverErrorResponse();
  }
}
