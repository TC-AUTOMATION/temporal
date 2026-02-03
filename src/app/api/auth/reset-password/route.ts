import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/send';
import { passwordResetEmail } from '@/lib/email/templates';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/auth/reset-password
 * Send password reset email with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store in VerificationCode table with type 'PASSWORD_RESET'
    await prisma.verificationCode.create({
      data: {
        email: email.toLowerCase(),
        code: resetToken,
        expiresAt,
        used: false,
      },
    });

    // Send password reset email
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Réinitialisation de votre mot de passe Temporal',
      html: passwordResetEmail(resetToken),
    });

    // Log code for debugging (even if email is sent, keep console.log for dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset code for ${email}: ${resetToken} (Email sent: ${emailResult.success})`);
    }

    // Log warning if email failed but continue (security: don't reveal if user exists)
    if (!emailResult.success) {
      console.error(`[ERROR] Failed to send password reset email to ${email}:`, emailResult.error);
    }

    return successResponse({
      message: 'If an account exists with this email, a reset link has been sent.',
      // Only return code in development mode for testing
      devCode: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);
    return serverErrorResponse();
  }
}
