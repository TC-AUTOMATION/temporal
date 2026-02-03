import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ticketReplySchema, updateTicketStatusSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { sendEmail } from '@/lib/email/send';
import { ticketReplyEmail } from '@/lib/email/templates/ticket';

/**
 * GET /api/tickets/[id]
 * Get a single ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
    });

    if (!ticket) {
      return notFoundResponse('Ticket non trouvé');
    }

    // Check access: user must own the ticket or be admin
    if (ticket.userId !== user.id && !user.isAdmin) {
      return forbiddenResponse('Accès refusé à ce ticket');
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('GET /api/tickets/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/tickets/[id]
 * Update ticket status and priority (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse('Seuls les administrateurs peuvent mettre à jour les tickets');
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return notFoundResponse('Ticket non trouvé');
    }

    const body = await request.json();
    const validation = updateTicketStatusSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.priority && { priority: data.priority }),
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return successResponse(updatedTicket);
  } catch (error) {
    console.error('PUT /api/tickets/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/tickets/[id]
 * Add a reply to a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return notFoundResponse('Ticket non trouvé');
    }

    // Check access: user must own the ticket or be admin
    if (ticket.userId !== user.id && !user.isAdmin) {
      return forbiddenResponse('Accès refusé à ce ticket');
    }

    const body = await request.json();
    const validation = ticketReplySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = validation.data;

    // Create reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: user.id,
        message: data.message,
        isAdmin: user.isAdmin,
      },
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
    });

    // Update ticket status based on who replies
    if (user.isAdmin) {
      // Admin replied - set to waiting for customer and send email notification
      await prisma.ticket.update({
        where: { id },
        data: { status: 'WAITING_CUSTOMER' },
      });

      // Get customer email to notify them
      const customerEmail = ticket.userId
        ? (await prisma.user.findUnique({ where: { id: ticket.userId }, select: { email: true } }))?.email
        : ticket.guestEmail;

      if (customerEmail) {
        try {
          await sendEmail({
            to: customerEmail,
            subject: `Réponse à votre ticket #${ticket.ticketNumber} - Temporal`,
            html: ticketReplyEmail({
              ticketNumber: ticket.ticketNumber,
              customerName: ticket.guestName || 'Client',
              replyMessage: data.message,
              ticketSubject: ticket.subject,
            }),
          });
          console.log(`Ticket reply email sent to ${customerEmail} for ticket ${ticket.ticketNumber}`);
        } catch (emailError) {
          console.error('Failed to send ticket reply email:', emailError);
        }
      }
    } else if (ticket.status === 'WAITING_CUSTOMER') {
      // Customer replied - set back to in progress
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Get updated ticket with all replies
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id },
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
    });

    return successResponse(updatedTicket, 201);
  } catch (error) {
    console.error('POST /api/tickets/[id] error:', error);
    return serverErrorResponse();
  }
}
