import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createTicketSchema, createGuestTicketSchema } from '@/lib/validations';
import { getCurrentUser, generateTicketNumber } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/tickets
 * Get all tickets (admin) or user's tickets (user)
 * For guests, they can query by email
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '100');
    const guestEmail = searchParams.get('email');
    const ticketNumber = searchParams.get('ticketNumber');

    // Build query
    const where: Record<string, unknown> = {};

    // If user is authenticated
    if (user) {
      // If admin, show all tickets
      if (!user.isAdmin) {
        where.userId = user.id;
      }
    } else if (guestEmail) {
      // Guest can query their tickets by email
      where.guestEmail = guestEmail.toLowerCase();
    } else if (ticketNumber) {
      // Guest can query by ticket number
      where.ticketNumber = ticketNumber;
    } else {
      return unauthorizedResponse();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return successResponse(tickets);
  } catch (error) {
    console.error('GET /api/tickets error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/tickets
 * Create a new ticket (authenticated or guest)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // If user is authenticated, use authenticated ticket creation
    if (user) {
      const validation = createTicketSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error);
      }

      const data = validation.data;

      // Create ticket for authenticated user
      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          userId: user.id,
          orderId: data.orderId,
          subject: data.subject,
          message: data.message,
          status: 'OPEN',
          priority: 'MEDIUM',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  isAdmin: true,
                },
              },
            },
          },
        },
      });

      return successResponse(ticket, 201);
    } else {
      // Guest ticket creation
      const validation = createGuestTicketSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error);
      }

      const data = validation.data;

      // Check if guest has a user account, link if exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      // Create guest ticket
      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          userId: existingUser?.id || null,
          guestEmail: existingUser ? null : data.email.toLowerCase(),
          guestName: existingUser ? null : data.name,
          orderId: data.orderId,
          subject: data.subject,
          message: data.message,
          status: 'OPEN',
          priority: 'MEDIUM',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          replies: true,
        },
      });

      return successResponse({
        ...ticket,
        ticketNumber: ticket.ticketNumber,
        message: 'Ticket créé avec succès. Conservez votre numéro de ticket pour suivre votre demande.'
      }, 201);
    }
  } catch (error) {
    console.error('POST /api/tickets error:', error);
    return serverErrorResponse();
  }
}
