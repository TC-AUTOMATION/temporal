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
 * GET /api/admin/stock
 * Returns stock overview per product per size, including sold quantities from orders
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    // Get all active products with their variants
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        images: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            color: true,
            colorHex: true,
            size: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get sold quantities per product/size/color from non-cancelled orders
    const soldItems = await prisma.orderItem.groupBy({
      by: ['productId', 'size', 'color'],
      _sum: { quantity: true },
      where: {
        order: {
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
          paymentStatus: 'PAID',
        },
      },
    });

    // Build a lookup map: productId-size-color -> soldQuantity
    const soldMap = new Map<string, number>();
    for (const item of soldItems) {
      const key = `${item.productId}-${item.size || ''}-${item.color || ''}`;
      soldMap.set(key, item._sum.quantity || 0);
    }

    // Aggregate stock by product and size
    const stockData = products.map((product) => {
      // Aggregate variants by size
      const sizeMap = new Map<string, {
        size: string;
        currentStock: number;
        sold: number;
        colors: { color: string; colorHex: string | null; stock: number; sold: number }[];
      }>();

      for (const variant of product.variants) {
        const soldKey = `${product.id}-${variant.size}-${variant.color}`;
        const sold = soldMap.get(soldKey) || 0;

        const existing = sizeMap.get(variant.size);
        if (existing) {
          existing.currentStock += variant.stock;
          existing.sold += sold;
          existing.colors.push({
            color: variant.color,
            colorHex: variant.colorHex,
            stock: variant.stock,
            sold,
          });
        } else {
          sizeMap.set(variant.size, {
            size: variant.size,
            currentStock: variant.stock,
            sold,
            colors: [{
              color: variant.color,
              colorHex: variant.colorHex,
              stock: variant.stock,
              sold,
            }],
          });
        }
      }

      const sizes = Array.from(sizeMap.values());
      const totalStock = sizes.reduce((sum, s) => sum + s.currentStock, 0);
      const totalSold = sizes.reduce((sum, s) => sum + s.sold, 0);

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || null,
        category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
        totalStock,
        totalSold,
        sizes,
      };
    });

    return successResponse({ stock: stockData });
  } catch (error) {
    console.error('GET /api/admin/stock error:', error);
    return serverErrorResponse();
  }
}
