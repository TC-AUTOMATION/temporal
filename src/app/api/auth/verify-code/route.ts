import { NextRequest, NextResponse } from 'next/server';

// Shared verification codes store
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Also check the send-code endpoint's store
import { verificationCodes as sendCodeStore } from '../send-code/route';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check both stores (in case of server restart, etc.)
    const stored = sendCodeStore.get(emailLower) || verificationCodes.get(emailLower);

    if (!stored) {
      return NextResponse.json(
        { error: 'No code found for this email. Please request a new code.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      // Clean up expired code
      sendCodeStore.delete(emailLower);
      verificationCodes.delete(emailLower);

      return NextResponse.json(
        { error: 'Code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: 'Invalid code. Please try again.' },
        { status: 400 }
      );
    }

    // Code is valid - clean up
    sendCodeStore.delete(emailLower);
    verificationCodes.delete(emailLower);

    // Determine if user is admin
    const adminEmails = ['pradeltom08@gmail.com', 'chloethiel201@gmail.com'];
    const isAdmin = adminEmails.includes(emailLower);

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
      isAdmin
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
