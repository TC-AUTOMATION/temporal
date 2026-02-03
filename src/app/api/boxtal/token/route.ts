import { NextRequest, NextResponse } from 'next/server';

// Cache token to avoid excessive API calls
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * GET /api/boxtal/token
 * Generate a Boxtal Map Component access token
 *
 * Documentation: https://help.boxtal.com/hc/fr/sections/8687585116956-Composant-carte
 * Endpoint: POST https://api.boxtal.com/iam/account-app/token
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return NextResponse.json({
        accessToken: cachedToken.accessToken,
        expiresIn: Math.floor((cachedToken.expiresAt - Date.now()) / 1000),
      });
    }

    const accessKey = process.env.BOXTAL_MAP_ACCESS_KEY;
    const secretKey = process.env.BOXTAL_MAP_SECRET_KEY;

    if (!accessKey || !secretKey) {
      return NextResponse.json(
        { error: 'Boxtal Map API credentials not configured' },
        { status: 500 }
      );
    }

    // Generate Basic Auth header
    const auth = Buffer.from(`${accessKey}:${secretKey}`).toString('base64');

    // Call Boxtal authentication endpoint
    const response = await fetch('https://api.boxtal.com/iam/account-app/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Boxtal auth error:', response.status, errorText);
      return NextResponse.json(
        { error: `Boxtal authentication failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Cache the token (expires in 1 hour, cache for 55 minutes to be safe)
    const expiresIn = data.expiresIn || 3600;
    cachedToken = {
      accessToken: data.accessToken,
      expiresAt: Date.now() + (expiresIn - 300) * 1000, // 5 minutes buffer
    };

    console.log('Boxtal token obtained successfully');

    return NextResponse.json({
      accessToken: data.accessToken,
      expiresIn: expiresIn,
    });
  } catch (error) {
    console.error('Error generating Boxtal token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Boxtal token' },
      { status: 500 }
    );
  }
}
