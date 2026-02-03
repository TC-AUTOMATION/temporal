import { Metadata } from 'next';
import { ReactNode } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://temporal-clothes.com';

// Générer les métadonnées dynamiques pour chaque produit
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Récupérer les données du produit
    const { prisma } = await import('@/lib/db/prisma');

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        category: true,
        variants: true
      }
    });

    if (!product) {
      return {
        title: 'Produit non trouvé',
        description: 'Ce produit n\'existe pas ou n\'est plus disponible.'
      };
    }

    const productName = product.name;
    const productPrice = Number(product.price).toFixed(2);
    const categoryName = product.category?.name || 'Streetwear';
    const productImage = product.images?.[0] || '/og-image.jpg';
    const productSlug = product.slug || product.id;

    // Description SEO optimisée
    const seoDescription = product.description
      ? `${product.description.slice(0, 150)}... Achetez ${productName} - ${categoryName} streetwear Temporal. ${productPrice}€. Livraison rapide en France.`
      : `Achetez ${productName} - ${categoryName} streetwear français premium par Temporal. Prix: ${productPrice}€. Qualité exceptionnelle, style unique. Livraison rapide en France.`;

    // Mots-clés dynamiques basés sur le produit
    const keywords = [
      productName,
      `${productName} Temporal`,
      `acheter ${productName}`,
      categoryName,
      `${categoryName} streetwear`,
      `${categoryName} français`,
      'Temporal',
      'streetwear français',
      'vêtement streetwear',
      'mode urbaine'
    ];

    return {
      title: `${productName} - ${categoryName} Streetwear`,
      description: seoDescription,
      keywords: keywords,
      alternates: {
        canonical: `${baseUrl}/products/${productSlug}`,
      },
      openGraph: {
        title: `${productName} | Temporal Streetwear`,
        description: seoDescription,
        url: `${baseUrl}/products/${productSlug}`,
        siteName: 'Temporal',
        locale: 'fr_FR',
        type: 'website',
        images: [
          {
            url: productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`,
            width: 800,
            height: 800,
            alt: `${productName} - Temporal Streetwear`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | Temporal`,
        description: `${categoryName} streetwear français - ${productPrice}€`,
        images: [productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`]
      },
      other: {
        'product:price:amount': productPrice,
        'product:price:currency': 'EUR',
        'product:availability': product.variants?.some((v: { stock: number }) => v.stock > 0) ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:brand': 'Temporal',
        'product:category': categoryName
      }
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Produit Streetwear Temporal',
      description: 'Découvrez ce produit streetwear français premium par Temporal.'
    };
  }
}

// Fonction pour générer le JSON-LD du produit
async function generateProductJsonLd(id: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        category: true,
        variants: true
      }
    });

    if (!product) return null;

    const productImage = product.images?.[0] || '/og-image.jpg';
    const inStock = product.variants?.some((v: { stock: number }) => v.stock > 0);

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`,
      brand: {
        '@type': 'Brand',
        name: 'Temporal',
        logo: `${baseUrl}/logo.png`
      },
      category: product.category?.name || 'Streetwear',
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/products/${product.slug || product.id}`,
        priceCurrency: 'EUR',
        price: Number(product.price),
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Temporal'
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'FR'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 3,
              unitCode: 'DAY'
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 5,
              unitCode: 'DAY'
            }
          }
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail'
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '50',
        bestRating: '5',
        worstRating: '1'
      }
    };
  } catch (error) {
    return null;
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jsonLd = await generateProductJsonLd(id);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
