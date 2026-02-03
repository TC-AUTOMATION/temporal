import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAdminEmail } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
import { verificationCodeEmail } from '@/lib/email/templates';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  newsletter: z.boolean().optional(),
});

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      );
    }

    const { email: rawEmail, password, firstName, lastName, newsletter } = validation.data;
    const email = rawEmail.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but has no password, allow setting one
      if (existingUser.password) {
        return NextResponse.json(
          { success: false, error: 'Un compte existe déjà avec cet email' },
          { status: 400 }
        );
      }

      // User exists without password (created via OTP), update with password
      const hashedPassword = await bcrypt.hash(password, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          newsletter: newsletter ?? existingUser.newsletter,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          message: 'Compte mis à jour. Vérifiez votre email.',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            isAdmin: updatedUser.isAdmin,
          },
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if email should be admin
    const isAdmin = isAdminEmail(email);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        newsletter: newsletter ?? false,
        isAdmin,
        emailVerified: false,
      },
    });

    // Generate and store verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.verificationCode.create({
      data: {
        email,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send verification email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Vérifiez votre email - Temporal',
      html: verificationCodeEmail(verificationCode),
    });

    // Log code for debugging (even if email is sent, keep console.log for dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Verification code for ${email}: ${verificationCode} (Email sent: ${emailResult.success})`);
    }

    // Log warning if email failed
    if (!emailResult.success) {
      console.error(`[ERROR] Failed to send verification email to ${email}:`, emailResult.error);
      // Still return success - user can request a new code
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Compte créé. Vérifiez votre email.',
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
    console.error('Error registering:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
