import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';

// PUT - Update stickers order
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { order } = await request.json();

    if (!order || !Array.isArray(order)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Update each sticker's sortOrder
    const updates = order.map((item: { id: string; sortOrder: number }) =>
      prisma.product.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: 'Stickers order updated successfully',
    });
  } catch (error) {
    console.error('Error updating stickers order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stickers order' },
      { status: 500 }
    );
  }
}

// GET - Get current stickers order
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stickers = await prisma.product.findMany({
      where: {
        name: { contains: 'Sticker' },
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: { stickers },
    });
  } catch (error) {
    console.error('Error fetching stickers order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stickers order' },
      { status: 500 }
    );
  }
}
