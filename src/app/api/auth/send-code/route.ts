import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendCodeSchema } from '@/lib/validations';
import { generateVerificationCode, isAdminEmail } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email/send';
import { verificationCodeEmail } from '@/lib/email/templates';

/**
 * POST /api/auth/send-code
 * Send a verification code to the user's email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = sendCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase();

    // Rate limiting: 5 requests per email per 15 minutes
    const rateLimit = checkRateLimit({
      identifier: `send-code:${email}`,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${resetInMinutes} minutes.` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    // Store the new code in database
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send verification email using Resend
    const emailResult = await sendEmail({
      to: email,
      subject: 'Votre code de connexion Temporal',
      html: verificationCodeEmail(code),
    });

    // Log code for debugging (even if email is sent, keep console.log for dev)
    console.log(`[TEMPORAL AUTH] Code for ${email}: ${code} (Email sent: ${emailResult.success})`);

    // Créer ou mettre à jour l'utilisateur si c'est un admin
    if (isAdminEmail(email)) {
      await prisma.user.upsert({
        where: { email },
        update: { isAdmin: true },
        create: { email, isAdmin: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Code envoyé',
      },
    });
  } catch (error) {
    console.error('Error sending code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    );
  }
}
