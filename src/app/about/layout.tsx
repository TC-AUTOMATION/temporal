import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://temporal-clothes.com';

export const metadata: Metadata = {
  title: 'A Propos - Marque Streetwear Française',
  description: 'Découvrez Temporal, marque de streetwear française née de la passion pour la mode urbaine. Notre histoire, nos valeurs, notre vision du streetwear authentique made in France.',
  keywords: [
    'marque streetwear française',
    'Temporal marque',
    'histoire Temporal',
    'streetwear français',
    'marque vêtement France',
    'mode urbaine française',
    'brand streetwear',
    'créateur streetwear',
    'streetwear made in France'
  ],
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'A Propos de Temporal - Marque Streetwear Française',
    description: 'Temporal : la marque de streetwear française qui redéfinit la mode urbaine. Découvrez notre histoire et nos valeurs.',
    url: `${baseUrl}/about`,
    siteName: 'Temporal',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Temporal - Marque Streetwear Française'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Propos de Temporal',
    description: 'Marque de streetwear française premium.',
    images: ['/og-image.jpg']
  }
};

// JSON-LD pour la page About
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'A Propos de Temporal',
  description: 'Découvrez Temporal, marque de streetwear française',
  url: `${baseUrl}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Temporal',
    alternateName: 'Temporal Streetwear',
    description: 'Temporal est une marque de streetwear française premium, spécialisée dans les vêtements urbains de haute qualité.',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'France'
    },
    knowsAbout: ['Streetwear', 'Mode Urbaine', 'Fashion', 'Street Style'],
    slogan: 'Streetwear Français Premium'
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      {children}
    </>
  );
}
