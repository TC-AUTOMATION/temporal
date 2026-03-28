import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/packs
 * Public endpoint - returns active packs with products and variants
 */
export async function GET() {
  try {
    const packs = await prisma.pack.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                isActive: true,
                variants: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    color: true,
                    colorHex: true,
                    size: true,
                    stock: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const packsWithPricing = packs.map((pack) => {
      const originalPrice = pack.items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);
      const packPrice = Number(pack.price);
      const discount = originalPrice - packPrice;
      const discountPercent =
        originalPrice > 0
          ? Math.round((discount / originalPrice) * 100)
          : 0;

      return {
        ...pack,
        price: packPrice,
        originalPrice,
        discount,
        discountPercent,
      };
    });

    return successResponse({ packs: packsWithPricing });
  } catch (error) {
    console.error('GET /api/packs error:', error);
    return serverErrorResponse();
  }
}
