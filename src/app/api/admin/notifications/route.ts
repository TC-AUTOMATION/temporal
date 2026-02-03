import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';

/**
 * GET /api/admin/notifications
 * Get all admin notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin auth
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const notifications = await prisma.adminNotification.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Count unread
    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/notifications
 * Mark notifications as read
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin auth
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      // Mark all as read
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (ids && Array.isArray(ids)) {
      // Mark specific notifications as read
      await prisma.adminNotification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Notifications mises à jour' },
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications
 * Delete old notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin auth
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('days') || '30');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.adminNotification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: result.count },
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
