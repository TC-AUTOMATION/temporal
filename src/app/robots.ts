import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://temporal-clothes.com';

  return {
    rules: [
      // Règles pour Googlebot (prioritaire)
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/shop',
          '/products/',
          '/about',
          '/community',
          '/contact',
          '/size-guide',
          '/shipping',
          '/returns',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/reset-password/',
          '/wishlist/',
          '/login',
          '/register',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      // Règles pour Googlebot-Image (important pour les produits)
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/clothes/',
          '/logo.png',
          '/og-image.jpg',
        ],
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      // Règles pour Bingbot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/reset-password/',
          '/wishlist/',
          '/login',
          '/register',
        ],
      },
      // Règles générales pour tous les autres bots
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/checkout/',
          '/reset-password/',
          '/wishlist/',
          '/login',
          '/register',
          '/_next/',
          '/static/',
        ],
        // Délai de crawl pour protéger le serveur
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
