import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api/response';

/**
 * GET /api/upsells
 * Fetch active upsells matching current cart state
 * Query params: cartTotal, productIds (comma-separated), categoryIds (comma-separated), location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartTotal = parseFloat(searchParams.get('cartTotal') || '0');
    const productIds = searchParams.get('productIds')?.split(',').filter(Boolean) || [];
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean) || [];
    const location = searchParams.get('location') || 'cart';

    // Fetch all active upsells for the requested display location
    const upsells = await prisma.upsell.findMany({
      where: {
        isActive: true,
        displayLocation: location,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            price: true,
            images: true,
            isActive: true,
            category: {
              select: {
                name: true,
                nameEn: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Filter upsells based on trigger conditions
    const matchingUpsells = upsells.filter((upsell) => {
      // Skip upsells for inactive products
      if (!upsell.product.isActive) return false;

      switch (upsell.triggerType) {
        case 'cart_total':
          return cartTotal >= parseFloat(upsell.triggerValue);

        case 'product_in_cart':
          return productIds.includes(upsell.triggerValue);

        case 'category_in_cart':
          return categoryIds.includes(upsell.triggerValue);

        default:
          return false;
      }
    });

    // Add computed fields: whether the item qualifies as free
    const enrichedUpsells = matchingUpsells.map((upsell) => {
      const isFreeGift = upsell.freeThreshold
        ? cartTotal >= Number(upsell.freeThreshold)
        : upsell.discountType === 'free';

      let effectivePrice = Number(upsell.product.price);

      if (isFreeGift) {
        effectivePrice = 0;
      } else if (upsell.discountType === 'percentage' && upsell.discountValue) {
        effectivePrice = effectivePrice * (1 - Number(upsell.discountValue) / 100);
      } else if (upsell.discountType === 'fixed' && upsell.discountValue) {
        effectivePrice = Math.max(0, effectivePrice - Number(upsell.discountValue));
      }

      return {
        ...upsell,
        isFreeGift,
        effectivePrice: Math.round(effectivePrice * 100) / 100,
        originalPrice: Number(upsell.product.price),
      };
    });

    return successResponse({ upsells: enrichedUpsells });
  } catch (error) {
    console.error('GET /api/upsells error:', error);
    return serverErrorResponse();
  }
}
