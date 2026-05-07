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
            variants: {
              where: { isActive: true },
              select: { id: true, size: true, stock: true },
              orderBy: { id: 'asc' },
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
        case 'always':
          return true;

        case 'cart_total':
          return cartTotal >= parseFloat(upsell.triggerValue);

        case 'product_in_cart': {
          const triggerProducts = upsell.triggerValue.split(',').map((s: string) => s.trim());
          return triggerProducts.some((tp: string) => productIds.includes(tp));
        }

        case 'category_in_cart':
          return categoryIds.includes(upsell.triggerValue);

        default:
          return false;
      }
    });

    // Add computed fields: whether the item qualifies as free
    const enrichedUpsells = matchingUpsells.map((upsell) => {
      // Si l'upsell exige que certains produits soient dans le panier pour
      // devenir gratuit (ex: « ensemble blanc » ou « ensemble noir »), on
      // vérifie qu'au moins un de ces produits est présent.
      const requiredIds = (upsell as { freeRequiredProductIds?: string[] }).freeRequiredProductIds || [];
      const requiredIdsSatisfied =
        requiredIds.length === 0 || requiredIds.some((id) => productIds.includes(id));

      const thresholdReached = upsell.freeThreshold
        ? cartTotal >= Number(upsell.freeThreshold)
        : false;

      const isFreeGift = upsell.freeThreshold
        ? thresholdReached && requiredIdsSatisfied
        : upsell.discountType === 'free' && requiredIdsSatisfied;

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

    // List of ALL product IDs that are configured as upsells for this display
    // location (regardless of whether their conditions currently match). This
    // allows the client to detect upsells that were added previously but no
    // longer qualify, and auto-remove them from the cart.
    const allUpsellProductIds = upsells
      .filter((u) => u.product.isActive)
      .map((u) => u.product.id);

    return successResponse({ upsells: enrichedUpsells, allUpsellProductIds });
  } catch (error) {
    console.error('GET /api/upsells error:', error);
    return serverErrorResponse();
  }
}
