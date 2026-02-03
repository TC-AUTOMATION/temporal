import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      // Verify token and delete session from database
      const payload = verifyToken(token);
      if (payload) {
        await prisma.session.deleteMany({
          where: { token },
        });
      }
    }

    // Clear cookie
    cookieStore.delete('auth_token');

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookie even if there's an error
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  }
}
