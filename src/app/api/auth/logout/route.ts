import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/api/response';

// Safari-compatible cookie deletion: set with maxAge: 0 and matching attributes
// instead of cookieStore.delete() which Safari may ignore.
const expiredCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 0,
};

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

    // Clear cookie (Safari-compatible)
    cookieStore.set('auth_token', '', expiredCookieOptions);

    return successResponse({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookie even if there's an error
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', expiredCookieOptions);

    return successResponse({ message: 'Déconnexion réussie' });
  }
}
