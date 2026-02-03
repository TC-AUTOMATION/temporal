/**
 * 🔒 CSRF Protection for Temporal
 * Génère et valide des tokens CSRF pour protéger contre les attaques Cross-Site Request Forgery
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

// Configuration
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET or JWT_SECRET environment variable is required');
}

/**
 * Génère un token CSRF aléatoire
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Crée un hash du token avec le secret
 */
function hashToken(token: string): string {
  return crypto
    .createHmac('sha256', CSRF_SECRET!)
    .update(token)
    .digest('hex');
}

/**
 * Définit le cookie CSRF et retourne le token
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const hashedToken = hashToken(token);

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 heure
  });

  return token;
}

/**
 * Valide le token CSRF
 * Compare le token envoyé dans le header avec le hash stocké dans le cookie
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  try {
    // Récupérer le token du header
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (!headerToken) {
      console.warn('[CSRF] Missing CSRF token in header');
      return false;
    }

    // Récupérer le hash du cookie
    const cookieStore = await cookies();
    const cookieHash = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    if (!cookieHash) {
      console.warn('[CSRF] Missing CSRF cookie');
      return false;
    }

    // Hasher le token reçu et comparer
    const expectedHash = hashToken(headerToken);

    // Comparaison timing-safe
    const isValid = crypto.timingSafeEqual(
      Buffer.from(cookieHash),
      Buffer.from(expectedHash)
    );

    if (!isValid) {
      console.warn('[CSRF] Token validation failed');
    }

    return isValid;
  } catch (error) {
    console.error('[CSRF] Validation error:', error);
    return false;
  }
}

/**
 * Middleware pour protéger les routes API
 * À utiliser sur les routes POST, PUT, DELETE, PATCH
 */
export async function csrfProtection(request: Request): Promise<Response | null> {
  const method = request.method.toUpperCase();

  // Skip pour GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  // Skip pour les webhooks (ils ont leur propre validation)
  const url = new URL(request.url);
  if (url.pathname.includes('/webhook')) {
    return null;
  }

  // Valider le token
  const isValid = await validateCsrfToken(request);
  if (!isValid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid CSRF token'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}

/**
 * Hook React pour utiliser le CSRF token côté client
 * Usage: const { csrfToken, fetchWithCsrf } = useCsrf();
 */
export function getCsrfHeaders(token: string): HeadersInit {
  return {
    [CSRF_HEADER_NAME]: token,
  };
}
