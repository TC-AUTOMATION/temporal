import { NextResponse } from 'next/server';
import { setCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Génère et retourne un nouveau token CSRF
 */
export async function GET() {
  try {
    const token = await setCsrfToken();

    return NextResponse.json({
      success: true,
      csrfToken: token,
    });
  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
