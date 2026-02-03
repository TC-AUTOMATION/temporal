import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const confirmResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/reset-password/confirm
 * Confirm password reset with code and set new password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = confirmResetSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email, code, password } = validation.data;

    // Find valid verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationCode) {
      return errorResponse('Invalid or expired reset code', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and mark code as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      }),
    ]);

    return successResponse({
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('POST /api/auth/reset-password/confirm error:', error);
    return serverErrorResponse();
  }
}
