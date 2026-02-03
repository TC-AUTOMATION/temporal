import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/health
 * Health check endpoint for Docker healthcheck
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        responseTime: `${responseTime}ms`,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[HEALTH] Database check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }, { status: 503 });
  }
}
