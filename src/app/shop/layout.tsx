import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://temporal-clothes.com';

export const metadata: Metadata = {
  title: 'Boutique Streetwear - Hoodies, T-Shirts, Vestes',
  description: 'Découvrez la collection Temporal : vêtements streetwear français premium. Hoodies oversize, t-shirts en coton, vestes urbaines, ensembles streetwear. Livraison rapide en France.',
  keywords: [
    // Recherches principales
    'boutique streetwear',
    'boutique streetwear française',
    'boutique streetwear en ligne',
    'acheter streetwear français',
    'acheter vetement streetwear',
    // Avec accents
    'vêtement streetwear',
    'vêtements streetwear',
    // Sans accents
    'vetement streetwear',
    'vetements streetwear',
    // Produits
    'hoodie streetwear',
    't-shirt streetwear',
    'veste streetwear',
    'ensemble streetwear',
    'jogging streetwear',
    // Style
    'vêtement urbain',
    'mode street',
    'streetwear France',
    'streetwear francais',
    'Temporal shop',
    'collection streetwear',
    'streetwear premium',
    'streetwear homme',
    'streetwear qualité'
  ],
  alternates: {
    canonical: `${baseUrl}/shop`,
  },
  openGraph: {
    title: 'Boutique Temporal - Streetwear Français Premium',
    description: 'Collection complète de vêtements streetwear : hoodies, t-shirts, vestes, ensembles. Qualité premium, made in France.',
    url: `${baseUrl}/shop`,
    siteName: 'Temporal',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Temporal - Collection Streetwear'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boutique Temporal - Streetwear Français',
    description: 'Découvrez notre collection de vêtements streetwear premium.',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true
  }
};

// JSON-LD pour la page collection/boutique
const shopJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Boutique Temporal - Collection Streetwear',
  description: 'Collection complète de vêtements streetwear français premium',
  url: `${baseUrl}/shop`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Temporal',
    url: baseUrl
  },
  about: {
    '@type': 'Thing',
    name: 'Streetwear Français'
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hoodies Streetwear',
        url: `${baseUrl}/shop?category=hoodies`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'T-Shirts Streetwear',
        url: `${baseUrl}/shop?category=tshirts`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Vestes Streetwear',
        url: `${baseUrl}/shop?category=vestes`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Ensembles Streetwear',
        url: `${baseUrl}/shop?category=ensembles`
      }
    ]
  }
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
      />
      {children}
    </>
  );
}
