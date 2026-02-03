import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

interface SyncResult {
  created: number;
  updated: number;
  errors: Array<{ productId: string; name: string; error: string }>;
}

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

  return { stripeProduct, stripePrice };
}

async function syncProductsToStripe(): Promise<SyncResult> {
  const stripe = getStripe();

  const result: SyncResult = {
    created: 0,
    updated: 0,
    errors: [],
  };

  // Récupérer tous les produits actifs
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  console.log(`\n📦 ${products.length} produits trouvés dans la base de données\n`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://temporal.fr';

  for (const product of products) {
    try {
      // Construire les URLs d'images absolues
      const imageUrls = product.images
        .map(img => {
          if (img.startsWith('http')) return img;
          return `${appUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        })
        .slice(0, 8); // Stripe limite à 8 images

      console.log(`🔄 ${product.name} (${product.sku})...`);

      // Si le produit existe déjà sur Stripe, on le met à jour
      if (product.stripeProductId) {
        try {
          // Vérifier que le produit existe sur Stripe
          await stripe.products.retrieve(product.stripeProductId);

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
              // Créer un nouveau prix
              const newPrice = await stripe.prices.create({
                product: product.stripeProductId,
                unit_amount: currentPriceInCents,
                currency: 'eur',
              });

              // Désactiver l'ancien prix
              await stripe.prices.update(product.stripePriceId, { active: false });

              // Mettre à jour la DB
              await prisma.product.update({
                where: { id: product.id },
                data: { stripePriceId: newPrice.id },
              });

              console.log(`   ✅ Mis à jour (nouveau prix: ${currentPriceInCents / 100}€)`);
            } else {
              console.log(`   ✅ Mis à jour`);
            }
          }

          result.updated++;
        } catch (stripeError: any) {
          if (stripeError?.code === 'resource_missing') {
            // Recréer le produit s'il n'existe plus
            await createStripeProduct(stripe, product, imageUrls);
            console.log(`   ✅ Recréé sur Stripe`);
            result.created++;
          } else {
            throw stripeError;
          }
        }
      } else {
        // Créer un nouveau produit sur Stripe
        const { stripeProduct, stripePrice } = await createStripeProduct(stripe, product, imageUrls);
        console.log(`   ✅ Créé (${stripeProduct.id}, prix: ${Number(product.price)}€)`);
        result.created++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.log(`   ❌ Erreur: ${errorMessage}`);
      result.errors.push({
        productId: product.id,
        name: product.name,
        error: errorMessage,
      });
    }
  }

  return result;
}

async function main() {
  console.log('🚀 Synchronisation des produits vers Stripe...\n');

  try {
    const result = await syncProductsToStripe();

    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DE LA SYNCHRONISATION');
    console.log('='.repeat(50));
    console.log(`✅ Créés:     ${result.created}`);
    console.log(`🔄 Mis à jour: ${result.updated}`);
    console.log(`❌ Erreurs:    ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Erreurs détaillées:');
      result.errors.forEach(err => {
        console.log(`   - ${err.name}: ${err.error}`);
      });
    }

    console.log('\n✨ Synchronisation terminée!\n');
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
