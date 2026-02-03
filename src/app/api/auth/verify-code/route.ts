import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyCodeSchema } from '@/lib/validations';
import { generateToken, isAdminEmail } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/verify-code
 * Verify the code and create/login user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    const { email: rawEmail, code } = validation.data;
    const email = rawEmail.toLowerCase();

    // Rate limiting: 10 attempts per email per 15 minutes
    const rateLimit = checkRateLimit({
      identifier: `verify-code:${email}`,
      maxRequests: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${resetInMinutes} minutes.` },
        { status: 429 }
      );
    }

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
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: storedCode.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const isAdmin = isAdminEmail(email);

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          isAdmin,
        },
      });
    } else if (user.isAdmin !== isAdmin) {
      // Update admin status if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé' },
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
        message: 'Connexion réussie',
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
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
