/**
 * 🔒 API Security Wrapper for Temporal
 * Centralise toutes les protections de sécurité pour les routes API
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RateLimitConfig } from './rateLimit';
import { checkHoneypot } from './honeypot';
import { getCurrentUser, AuthUser } from './auth/jwt';

// Types
export interface SecureApiConfig {
  // Rate limiting
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };

  // Authentification requise
  requireAuth?: boolean;

  // Admin requis
  requireAdmin?: boolean;

  // Validation honeypot
  checkHoneypot?: boolean;

  // Méthodes autorisées
  allowedMethods?: string[];
}

export interface SecureApiContext {
  user: AuthUser | null;
  ip: string;
  userAgent: string;
}

type ApiHandler = (
  request: NextRequest,
  context: SecureApiContext
) => Promise<NextResponse>;

/**
 * Wrapper sécurisé pour les routes API
 */
export function secureApiRoute(
  handler: ApiHandler,
  config: SecureApiConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    // Récupérer les informations de la requête
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const method = request.method.toUpperCase();

    // ===========================================
    // 🔒 Vérification de la méthode HTTP
    // ===========================================
    if (config.allowedMethods && !config.allowedMethods.includes(method)) {
      logSecurityEvent('method_not_allowed', { ip, method, path: request.nextUrl.pathname });
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // ===========================================
    // 🔒 Rate Limiting
    // ===========================================
    if (config.rateLimit) {
      const rateLimitConfig: RateLimitConfig = {
        maxRequests: config.rateLimit.maxRequests,
        windowMs: config.rateLimit.windowMs,
        identifier: ip,
      };

      const result = checkRateLimit(rateLimitConfig);
      if (!result.success) {
        logSecurityEvent('rate_limit_exceeded', { ip, path: request.nextUrl.pathname });
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(result.resetAt),
            },
          }
        );
      }
    }

    // ===========================================
    // 🔒 Authentification
    // ===========================================
    let user: AuthUser | null = null;

    if (config.requireAuth || config.requireAdmin) {
      user = await getCurrentUser();

      if (!user) {
        logSecurityEvent('unauthorized_access', { ip, path: request.nextUrl.pathname });
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        logSecurityEvent('inactive_user_access', { ip, userId: user.id });
        return NextResponse.json(
          { success: false, error: 'Account is disabled' },
          { status: 403 }
        );
      }

      if (config.requireAdmin && !user.isAdmin) {
        logSecurityEvent('admin_access_denied', { ip, userId: user.id, path: request.nextUrl.pathname });
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    // ===========================================
    // 🔒 Honeypot Check (pour POST/PUT)
    // ===========================================
    if (config.checkHoneypot && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.clone().json();
        const honeypotResponse = checkHoneypot(body);
        if (honeypotResponse) {
          logSecurityEvent('honeypot_triggered', { ip, path: request.nextUrl.pathname });
          return NextResponse.json(
            { success: false, error: 'Request blocked' },
            { status: 403 }
          );
        }
      } catch {
        // Pas de body JSON, continuer
      }
    }

    // ===========================================
    // ✅ Exécuter le handler
    // ===========================================
    try {
      const context: SecureApiContext = { user, ip, userAgent };
      const response = await handler(request, context);

      // Ajouter des headers de sécurité à la réponse
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      return response;
    } catch (error) {
      console.error('[API] Handler error:', error);
      logSecurityEvent('api_error', {
        ip,
        path: request.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Récupère l'IP du client (avec support proxy)
 */
function getClientIp(request: NextRequest): string {
  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // X-Forwarded-For (premier IP = client original)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  // X-Real-IP (Caddy)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback
  return 'unknown';
}

/**
 * Log des événements de sécurité
 */
function logSecurityEvent(
  event: string,
  details: Record<string, string | number | undefined>
): void {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      type: 'SECURITY',
      event,
      timestamp,
      ...details,
    })
  );
}

// ===========================================
// Configurations prédéfinies
// ===========================================

export const AUTH_API_CONFIG: SecureApiConfig = {
  rateLimit: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 req/min
  },
  checkHoneypot: true,
};

export const STRICT_AUTH_API_CONFIG: SecureApiConfig = {
  rateLimit: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 3 req/min
  },
  checkHoneypot: true,
};

export const PROTECTED_API_CONFIG: SecureApiConfig = {
  requireAuth: true,
  rateLimit: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 req/min
  },
};

export const ADMIN_API_CONFIG: SecureApiConfig = {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
};
