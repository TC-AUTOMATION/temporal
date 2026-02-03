import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { generateToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

/**
 * POST /api/auth/verify-email
 * Verify email after registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    const { email: rawEmail, code } = validation.data;
    const email = rawEmail.toLowerCase();

    // Find the verification code
    const storedCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedCode) {
      return NextResponse.json(
        { success: false, error: 'Code invalide ou expiré' },
        { status: 400 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: storedCode.id },
      data: { used: true },
    });

    // Find user and mark email as verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Compte désactivé' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Create session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Email vérifié avec succès',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
