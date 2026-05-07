import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/cart-spy
 * Fetches cart snapshots with filters for the admin dashboard.
 * Query params:
 *   - dateFrom: ISO date string
 *   - dateTo: ISO date string
 *   - minTotal: minimum cart total
 *   - maxTotal: maximum cart total
 *   - loggedIn: "true" | "false" - filter by logged in status
 *   - search: search by product name or user email
 *   - analytics: "true" - return aggregated analytics data
 *   - limit: number of results (default 100)
 *   - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const analytics = searchParams.get('analytics') === 'true';

    if (analytics) {
      return getAnalytics();
    }

    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minTotal = searchParams.get('minTotal');
    const maxTotal = searchParams.get('maxTotal');
    const loggedIn = searchParams.get('loggedIn');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: Record<string, unknown> = {};

    // Only show carts with items
    where.itemCount = { gt: 0 };

    if (dateFrom || dateTo) {
      where.updatedAt = {};
      if (dateFrom) (where.updatedAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.updatedAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    if (minTotal || maxTotal) {
      where.total = {};
      if (minTotal) (where.total as Record<string, unknown>).gte = parseFloat(minTotal);
      if (maxTotal) (where.total as Record<string, unknown>).lte = parseFloat(maxTotal);
    }

    if (loggedIn === 'true') {
      where.userId = { not: null };
    } else if (loggedIn === 'false') {
      where.userId = null;
    }

    const [snapshots, totalCount] = await Promise.all([
      prisma.cartSnapshot.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.cartSnapshot.count({ where }),
    ]);

    // Post-filter by search (product name in JSON items or user email)
    let filtered = snapshots;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = snapshots.filter((snap) => {
        // Search in user email
        if (snap.user?.email?.toLowerCase().includes(searchLower)) return true;
        if (snap.user?.firstName?.toLowerCase().includes(searchLower)) return true;
        if (snap.user?.lastName?.toLowerCase().includes(searchLower)) return true;

        // Search in cart items (JSON array)
        const items = snap.items as Array<{ name?: string }>;
        if (Array.isArray(items)) {
          return items.some(
            (item) => item.name && item.name.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    }

    return successResponse({
      snapshots: filtered,
      total: search ? filtered.length : totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET /api/admin/cart-spy error:', error);
    return serverErrorResponse();
  }
}

async function getAnalytics() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // All carts with items
    const allCarts = await prisma.cartSnapshot.findMany({
      where: { itemCount: { gt: 0 } },
    });

    const totalCarts = allCarts.length;
    const totalPotentialRevenue = allCarts.reduce(
      (sum, c) => sum + Number(c.total),
      0
    );
    const avgCartValue = totalCarts > 0 ? totalPotentialRevenue / totalCarts : 0;

    // Recent carts (7 days) for the "active" metric
    const recentCarts = allCarts.filter(
      (c) => new Date(c.updatedAt).getTime() >= sevenDaysAgo.getTime()
    );
    const carts24h = allCarts.filter(
      (c) => new Date(c.updatedAt).getTime() >= twentyFourHoursAgo.getTime()
    );

    // Most popular products across ALL carts
    const productCounts: Record<string, { name: string; count: number; cartCount: number; image?: string }> = {};
    for (const cart of allCarts) {
      const items = cart.items as Array<{ id?: string; name?: string; quantity?: number; image?: string }>;
      if (Array.isArray(items)) {
        for (const item of items) {
          const key = item.id || item.name || 'unknown';
          if (!productCounts[key]) {
            productCounts[key] = { name: item.name || 'Unknown', count: 0, cartCount: 0, image: item.image };
          }
          productCounts[key].count += item.quantity || 1;
          productCounts[key].cartCount += 1;
        }
      }
    }

    const mostAddedProducts = Object.entries(productCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostPopularProduct = mostAddedProducts[0] || null;

    // Cart age stats (how long since last update)
    const cartAges = allCarts.map((c) => {
      const age = now.getTime() - new Date(c.updatedAt).getTime();
      return age / (1000 * 60 * 60); // in hours
    });
    const avgCartAge = cartAges.length > 0
      ? cartAges.reduce((a, b) => a + b, 0) / cartAges.length
      : 0;

    // Logged in vs anonymous (all carts)
    const loggedInCount = allCarts.filter((c) => c.userId).length;
    const anonymousCount = allCarts.filter((c) => !c.userId).length;

    return successResponse({
      totalCarts,
      totalActiveCarts: recentCarts.length,
      carts24h: carts24h.length,
      avgCartValue: Math.round(avgCartValue * 100) / 100,
      totalPotentialRevenue: Math.round(totalPotentialRevenue * 100) / 100,
      mostPopularProduct,
      popularProducts: mostAddedProducts.slice(0, 10),
      mostAddedProducts,
      avgCartAgeHours: Math.round(avgCartAge * 10) / 10,
      loggedInCount,
      anonymousCount,
    });
  } catch (error) {
    console.error('GET /api/admin/cart-spy analytics error:', error);
    return serverErrorResponse();
  }
}
