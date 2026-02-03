import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ productId: string; name: string; error: string }>;
}

/**
 * Synchronise tous les produits de la base de données vers Stripe
 * Crée les produits et prix Stripe, puis met à jour les IDs dans la DB
 */
export async function syncProductsToStripe(): Promise<SyncResult> {
  const stripe = getStripe();

  const result: SyncResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Récupérer tous les produits actifs
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  for (const product of products) {
    try {
      // Construire l'URL de l'image absolue si disponible
      const imageUrls = product.images
        .filter(img => img.startsWith('http'))
        .slice(0, 8); // Stripe limite à 8 images

      // Si le produit existe déjà sur Stripe, on le met à jour
      if (product.stripeProductId) {
        try {
          // Vérifier que le produit existe sur Stripe
          const existingProduct = await stripe.products.retrieve(product.stripeProductId);

          // Mettre à jour le produit Stripe
          await stripe.products.update(product.stripeProductId, {
            name: product.name,
            description: product.description || undefined,
            images: imageUrls.length > 0 ? imageUrls : undefined,
            metadata: {
              dbProductId: product.id,
              sku: product.sku,
              category: product.category.name,
            },
          });

          // Vérifier si le prix a changé
          if (product.stripePriceId) {
            const existingPrice = await stripe.prices.retrieve(product.stripePriceId);
            const currentPriceInCents = Math.round(Number(product.price) * 100);

            if (existingPrice.unit_amount !== currentPriceInCents) {
              // Créer un nouveau prix (on ne peut pas modifier un prix Stripe)
              const newPrice = await stripe.prices.create({
                product: product.stripeProductId,
                unit_amount: currentPriceInCents,
                currency: 'eur',
              });

              // Désactiver l'ancien prix
              await stripe.prices.update(product.stripePriceId, { active: false });

              // Mettre à jour la DB avec le nouveau prix
              await prisma.product.update({
                where: { id: product.id },
                data: { stripePriceId: newPrice.id },
              });
            }
          }

          result.updated++;
        } catch (stripeError: any) {
          // Si le produit n'existe plus sur Stripe, on le recrée
          if (stripeError?.code === 'resource_missing') {
            await createStripeProduct(stripe, product, imageUrls);
            result.created++;
          } else {
            throw stripeError;
          }
        }
      } else {
        // Créer un nouveau produit sur Stripe
        await createStripeProduct(stripe, product, imageUrls);
        result.created++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      result.errors.push({
        productId: product.id,
        name: product.name,
        error: errorMessage,
      });
    }
  }

  return result;
}

/**
 * Crée un produit et son prix sur Stripe, puis met à jour la DB
 */
async function createStripeProduct(
  stripe: Stripe,
  product: {
    id: string;
    name: string;
    description: string | null;
    sku: string;
    price: any;
    category: { name: string };
  },
  imageUrls: string[]
) {
  // Créer le produit Stripe
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: product.description || undefined,
    images: imageUrls.length > 0 ? imageUrls : undefined,
    metadata: {
      dbProductId: product.id,
      sku: product.sku,
      category: product.category.name,
    },
  });

  // Créer le prix Stripe
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(Number(product.price) * 100),
    currency: 'eur',
  });

  // Mettre à jour la DB avec les IDs Stripe
  await prisma.product.update({
    where: { id: product.id },
    data: {
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    },
  });
}

/**
 * Synchronise un seul produit vers Stripe
 */
export async function syncSingleProductToStripe(productId: string): Promise<{ success: boolean; error?: string }> {
  const stripe = getStripe();

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return { success: false, error: 'Produit non trouvé' };
    }

    const imageUrls = product.images
      .filter(img => img.startsWith('http'))
      .slice(0, 8);

    if (product.stripeProductId) {
      // Mettre à jour le produit existant
      await stripe.products.update(product.stripeProductId, {
        name: product.name,
        description: product.description || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        metadata: {
          dbProductId: product.id,
          sku: product.sku,
          category: product.category.name,
        },
      });

      // Gérer le prix
      if (product.stripePriceId) {
        const existingPrice = await stripe.prices.retrieve(product.stripePriceId);
        const currentPriceInCents = Math.round(Number(product.price) * 100);

        if (existingPrice.unit_amount !== currentPriceInCents) {
          const newPrice = await stripe.prices.create({
            product: product.stripeProductId,
            unit_amount: currentPriceInCents,
            currency: 'eur',
          });

          await stripe.prices.update(product.stripePriceId, { active: false });

          await prisma.product.update({
            where: { id: product.id },
            data: { stripePriceId: newPrice.id },
          });
        }
      }
    } else {
      await createStripeProduct(stripe, product, imageUrls);
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return { success: false, error: errorMessage };
  }
}
