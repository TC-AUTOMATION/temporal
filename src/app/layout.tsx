import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsentProvider from "@/components/providers/CookieConsentProvider";
import VisitorTracker from "@/components/providers/VisitorTracker";
import Script from "next/script";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://temporal-clothes.com";

export const metadata: Metadata = {
  // Titre optimisé SEO avec template
  title: {
    default: "Temporal | Marque Streetwear Française - Vêtements Urban & Street Style",
    template: "%s | Temporal - Streetwear Français"
  },

  // Description optimisée avec mots-clés stratégiques
  description: "Temporal, marque streetwear française premium. Découvrez notre collection de vêtements streetwear : hoodies, t-shirts, vestes et ensembles. Mode urbaine made in France, style unique et qualité exceptionnelle. Livraison rapide en France et Europe.",

  // Mots-clés ciblés (avec et sans accents pour couvrir toutes les recherches)
  keywords: [
    // Marque
    "Temporal",
    "temporal streetwear",
    "temporal clothing",
    "temporal clothes",
    // Streetwear français - avec accents
    "marque streetwear française",
    "vêtement streetwear",
    "vêtements streetwear",
    "streetwear français",
    "marque streetwear France",
    "mode urbaine française",
    "marque vêtement française",
    // Streetwear français - SANS accents (recherches fréquentes)
    "vetement streetwear",
    "vetements streetwear",
    "marque vetement francaise",
    "streetwear francais",
    "mode urbaine francaise",
    // Produits spécifiques
    "hoodie streetwear",
    "hoodie streetwear français",
    "t-shirt streetwear",
    "t-shirt streetwear français",
    "veste streetwear",
    "veste streetwear homme",
    "ensemble streetwear",
    "ensemble streetwear homme",
    "jogging streetwear",
    // Style et tendances
    "vêtements street style",
    "streetwear made in France",
    "urban wear France",
    "mode street française",
    "brand streetwear français",
    "collection streetwear",
    "boutique streetwear française",
    "boutique streetwear en ligne",
    // Recherches d'achat
    "acheter streetwear français",
    "acheter vetement streetwear",
    "streetwear pas cher",
    "streetwear qualité"
  ],

  // Auteur et créateur
  authors: [{ name: "Temporal", url: baseUrl }],
  creator: "Temporal",
  publisher: "Temporal",

  // Configuration du site
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "en-US": "/en"
    }
  },

  // Open Graph pour les réseaux sociaux
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: baseUrl,
    siteName: "Temporal",
    title: "Temporal | Marque Streetwear Française Premium",
    description: "Découvrez Temporal, la marque streetwear française qui redéfinit le style urbain. Vêtements premium, designs uniques, qualité made in France.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Temporal - Streetwear Français Premium",
        type: "image/jpeg"
      },
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Temporal"
      }
    ]
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    site: "@temporal_wear",
    creator: "@temporal_wear",
    title: "Temporal | Streetwear Français Premium",
    description: "Marque streetwear française. Hoodies, t-shirts, vestes - Style urbain made in France.",
    images: ["/og-image.jpg"]
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },

  // Catégorie et classification
  category: "E-commerce",
  classification: "Streetwear Fashion",

  // Vérification Google Search Console
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },

  // Autres métadonnées importantes
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },

  // App links
  appLinks: {
    web: {
      url: baseUrl,
      should_fallback: true
    }
  },

  // Archives et assets
  archives: [`${baseUrl}/shop`],
  assets: [`${baseUrl}/assets`],

  // Manifest pour PWA
  manifest: "/manifest.json",

  // Icônes
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/favicon.png"
  },

  // Other
  other: {
    "geo.region": "FR",
    "geo.placename": "France",
    "og:price:currency": "EUR",
    "product:brand": "Temporal",
    "product:availability": "in stock",
    "product:condition": "new"
  }
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  colorScheme: "light dark"
};

// Schema.org JSON-LD pour Google
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Temporal",
      alternateName: ["Temporal Streetwear", "Temporal France", "Temporal Wear"],
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512
      },
      image: `${baseUrl}/og-image.jpg`,
      description: "Temporal est une marque de streetwear française premium, spécialisée dans les vêtements urbains de haute qualité.",
      foundingDate: "2024",
      foundingLocation: {
        "@type": "Place",
        name: "France"
      },
      slogan: "Streetwear Français Premium",
      knowsAbout: ["Streetwear", "Mode Urbaine", "Vêtements", "Fashion", "Street Style"],
      sameAs: [
        "https://instagram.com/temporal_wear",
        "https://twitter.com/temporal_wear",
        "https://tiktok.com/@temporal_wear",
        "https://facebook.com/temporalwear"
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "contact@temporal-clothes.com",
        availableLanguage: ["French", "English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Temporal",
      alternateName: "Temporal Streetwear",
      description: "Boutique en ligne officielle Temporal - Marque streetwear française",
      publisher: {
        "@id": `${baseUrl}/#organization`
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/shop?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      inLanguage: "fr-FR"
    },
    {
      "@type": "Store",
      "@id": `${baseUrl}/#store`,
      name: "Temporal - Boutique Streetwear",
      description: "Boutique officielle de la marque Temporal. Vêtements streetwear français premium.",
      url: baseUrl,
      image: `${baseUrl}/og-image.jpg`,
      priceRange: "€€",
      currenciesAccepted: "EUR",
      paymentAccepted: ["Credit Card", "PayPal", "Apple Pay", "Google Pay"],
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 46.603354,
          longitude: 1.888334
        },
        geoRadius: "1000 km"
      },
      brand: {
        "@id": `${baseUrl}/#organization`
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Collection Temporal",
        itemListElement: [
          {
            "@type": "OfferCatalog",
            name: "Hoodies Streetwear",
            itemListOrder: "https://schema.org/ItemListOrderDescending"
          },
          {
            "@type": "OfferCatalog",
            name: "T-Shirts Streetwear",
            itemListOrder: "https://schema.org/ItemListOrderDescending"
          },
          {
            "@type": "OfferCatalog",
            name: "Vestes Streetwear",
            itemListOrder: "https://schema.org/ItemListOrderDescending"
          },
          {
            "@type": "OfferCatalog",
            name: "Ensembles Streetwear",
            itemListOrder: "https://schema.org/ItemListOrderDescending"
          }
        ]
      }
    },
    {
      "@type": "Brand",
      "@id": `${baseUrl}/#brand`,
      name: "Temporal",
      alternateName: "Temporal Streetwear",
      description: "Marque de streetwear française premium",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      slogan: "Streetwear Français Authentique"
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: baseUrl
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Boutique",
          item: `${baseUrl}/shop`
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        {/* Preconnect pour performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Schema.org JSON-LD pour SEO Google */}
        <Script
          id="json-ld-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Balises SEO supplémentaires */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Temporal" />

        {/* Geo targeting pour France */}
        <meta name="geo.region" content="FR" />
        <meta name="geo.country" content="FR" />
        <meta name="ICBM" content="46.603354, 1.888334" />

        {/* Language */}
        <meta httpEquiv="content-language" content="fr-FR" />

        {/* Revisit */}
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />

        {/* Copyright */}
        <meta name="copyright" content="Temporal" />
      </head>
      <body className="antialiased bg-background text-foreground overflow-x-hidden" itemScope itemType="https://schema.org/WebPage">
        {children}
        <CookieConsentProvider />
        <VisitorTracker />
      </body>
    </html>
  );
}
