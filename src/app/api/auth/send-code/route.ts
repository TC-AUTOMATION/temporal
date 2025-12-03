import { NextRequest, NextResponse } from 'next/server';

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code
    verificationCodes.set(email.toLowerCase(), { code, expiresAt });

    // In production, send email via Resend, SendGrid, etc.
    // For now, we'll log it and also return it for demo purposes
    console.log(`[TEMPORAL AUTH] Code for ${email}: ${code}`);

    // Send email (example with a hypothetical email service)
    // await sendEmail({
    //   to: email,
    //   subject: 'Votre code de connexion Temporal',
    //   html: `
    //     <h1>Code de vérification</h1>
    //     <p>Votre code de connexion est: <strong>${code}</strong></p>
    //     <p>Ce code expire dans 10 minutes.</p>
    //   `
    // });

    return NextResponse.json({
      success: true,
      message: 'Code sent successfully',
      // Remove this in production - only for demo
      demo_code: code
    });
  } catch (error) {
    console.error('Error sending code:', error);
    return NextResponse.json(
      { error: 'Failed to send code' },
      { status: 500 }
    );
  }
}

// Export the codes map for the verify endpoint
export { verificationCodes };
