import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://temporal-clothes.com';
  const currentDate = new Date();

  // Pages statiques principales - Optimisées pour SEO streetwear
  const staticRoutes: MetadataRoute.Sitemap = [
    // Page d'accueil - Priorité maximale
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Boutique - Page clé pour "vêtement streetwear"
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    // À propos - Important pour "marque streetwear française"
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Communauté
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Contact
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Guide des tailles - Important pour e-commerce
    {
      url: `${baseUrl}/size-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Livraison
    {
      url: `${baseUrl}/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Retours
    {
      url: `${baseUrl}/returns`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Suivi de commande
    {
      url: `${baseUrl}/track`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    // Pages légales (priorité basse mais nécessaires)
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Routes dynamiques
  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const { prisma } = await import('@/lib/db/prisma');

    // Récupérer tous les produits actifs
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        name: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Les produits sont très importants pour le SEO
    productRoutes = products.map((product, index) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      // Les produits récemment mis à jour ont une priorité plus élevée
      priority: Math.max(0.7, 0.9 - (index * 0.02)),
    }));

    // Récupérer toutes les catégories actives
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        name: true,
      },
    });

    // Les catégories sont importantes pour "vêtement streetwear", "hoodie streetwear", etc.
    categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/shop?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

  } catch (error) {
    // Pendant le build, la DB peut ne pas être disponible
    console.log('Sitemap: Database not available, using static routes only');
  }

  // Combiner et retourner toutes les routes
  return [
    ...staticRoutes,
    ...categoryRoutes, // Catégories avant produits pour hiérarchie
    ...productRoutes,
  ];
}
