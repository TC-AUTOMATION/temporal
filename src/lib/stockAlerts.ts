import { prisma } from '@/lib/db/prisma';
import { createAdminNotification } from '@/lib/notifications';

/**
 * Low stock threshold
 * Alert admins when variant stock falls below this number
 */
const LOW_STOCK_THRESHOLD = 10;

/**
 * Check variant stock and create LOW_STOCK notification if below threshold
 *
 * @param variantId - The product variant ID to check
 * @returns true if notification was created, false otherwise
 */
export async function checkAndNotifyLowStock(variantId: string): Promise<boolean> {
  try {
    // Get variant with product information
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!variant) {
      console.error(`Variant ${variantId} not found for stock check`);
      return false;
    }

    // Check if stock is below threshold
    if (variant.stock < LOW_STOCK_THRESHOLD) {
      console.log(`[STOCK ALERT] Low stock detected: ${variant.product.name} - ${variant.color} ${variant.size} (${variant.stock} remaining)`);

      // Check if we already have a recent notification for this variant
      const recentNotification = await prisma.adminNotification.findFirst({
        where: {
          type: 'LOW_STOCK',
          data: {
            path: ['variantId'],
            equals: variantId,
          },
          createdAt: {
            // Only check for notifications in the last 24 hours
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      // Don't spam notifications - only create if no recent one exists
      if (!recentNotification) {
        await createAdminNotification({
          type: 'LOW_STOCK',
          title: `⚠️ Stock faible - ${variant.product.name}`,
          message: `Le stock de "${variant.color} ${variant.size}" est bas (${variant.stock} restant${variant.stock > 1 ? 's' : ''}). Pensez à réapprovisionner.`,
          data: {
            variantId: variant.id,
            productId: variant.product.id,
            productName: variant.product.name,
            productSlug: variant.product.slug,
            variantName: `${variant.color} ${variant.size}`,
            currentStock: variant.stock,
            threshold: LOW_STOCK_THRESHOLD,
          },
        });

        console.log(`[STOCK ALERT] LOW_STOCK notification created for variant ${variantId}`);
        return true;
      } else {
        console.log(`[STOCK ALERT] Skipping notification - recent LOW_STOCK alert already exists for variant ${variantId}`);
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking stock levels:', error);
    return false;
  }
}

/**
 * Check multiple variants for low stock
 * Useful for batch operations
 *
 * @param variantIds - Array of variant IDs to check
 * @returns Array of booleans indicating which variants triggered notifications
 */
export async function checkMultipleVariantsStock(variantIds: string[]): Promise<boolean[]> {
  console.log(`[STOCK ALERT] Checking ${variantIds.length} variants for low stock...`);

  const results = await Promise.all(
    variantIds.map(id => checkAndNotifyLowStock(id))
  );

  const notificationCount = results.filter(r => r).length;
  if (notificationCount > 0) {
    console.log(`[STOCK ALERT] Created ${notificationCount} low stock notification(s)`);
  }

  return results;
}

/**
 * Get all variants currently below low stock threshold
 * Useful for admin dashboard
 *
 * @returns Array of variants with low stock
 */
export async function getLowStockVariants() {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        stock: {
          lt: LOW_STOCK_THRESHOLD,
          gte: 0, // Exclude negative stock (should not happen)
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        stock: 'asc', // Show lowest stock first
      },
    });

    console.log(`[STOCK ALERT] Found ${variants.length} variant(s) with low stock`);
    return variants;
  } catch (error) {
    console.error('Error fetching low stock variants:', error);
    return [];
  }
}

/**
 * Get out-of-stock variants
 *
 * @returns Array of variants with zero stock
 */
export async function getOutOfStockVariants() {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        stock: 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    console.log(`[STOCK ALERT] Found ${variants.length} variant(s) out of stock`);
    return variants;
  } catch (error) {
    console.error('Error fetching out of stock variants:', error);
    return [];
  }
}
