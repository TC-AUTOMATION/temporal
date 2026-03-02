import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🔒 Proxy de sécurité Temporal (Next.js 16+)
 * - Headers de sécurité
 * - Protection des routes sensibles
 */

// Routes API sensibles (rate limiting plus strict dans l'app)
const SENSITIVE_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ===========================================
  // 🔒 Headers de sécurité
  // ===========================================
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // ===========================================
  // 🔒 Protection contre les bots malveillants
  // ===========================================
  const userAgent = request.headers.get('user-agent') || '';

  // Récupérer l'IP client
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Bloquer les user-agents vides ou suspects
  if (!userAgent || userAgent.length < 10) {
    // Logger mais ne pas bloquer (peut être des health checks)
    console.warn(`[SECURITY] Suspicious empty/short user-agent from ${clientIp}`);
  }

  // Bloquer les scanners connus
  const suspiciousPatterns = /sqlmap|nikto|nmap|masscan|zgrab|censys|shodan/i;
  if (suspiciousPatterns.test(userAgent)) {
    console.warn(`[SECURITY] Blocked scanner bot: ${userAgent} from ${clientIp}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ===========================================
  // 🔒 Protection des routes admin
  // ===========================================
  if (pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ===========================================
  // 🔒 Logging des requêtes sensibles
  // ===========================================
  if (SENSITIVE_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[AUTH] ${request.method} ${pathname} from ${clientIp}`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/webhook).*)',
  ],
};
