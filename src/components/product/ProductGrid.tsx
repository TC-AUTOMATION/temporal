'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalStar from '@/components/ui/TemporalStar';
import { Loader2, Package } from 'lucide-react';

interface ProductGridProps {
  category?: string;
}

interface PackItem {
  product: { images: string[] };
}

interface Pack {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  images: string[];
  isActive: boolean;
  items: PackItem[];
  originalPrice: number;
  discount: number;
  discountPercent: number;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch products and packs from API
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) {
          params.append('category', category);
        }

        const [productsRes, packsRes] = await Promise.all([
          fetch(`/api/products?${params.toString()}`),
          category ? Promise.resolve(null) : fetch('/api/packs'),
        ]);

        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }

        const productsData = await productsRes.json();
        setProducts(productsData.data?.products || productsData.products || []);

        if (packsRes && packsRes.ok) {
          const packsData = await packsRes.json();
          const allPacks: Pack[] = packsData.data?.packs || [];
          setPacks(allPacks.filter((p) => p.isActive));
        } else {
          setPacks([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setPacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [category]);

  // Separate stickers from other products
  const clothingProducts = products.filter(p => !p.name.toLowerCase().includes('sticker'));
  const stickerProducts = products.filter(p => p.name.toLowerCase().includes('sticker'));

  // Sort stickers by sortOrder from database
  const reorderedStickers = [...stickerProducts].sort((a: any, b: any) =>
    (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  // Sort clothing products: ensembles first, then vestes, then others (grouped by type)
  // Then alternate colors: noir, blanc, noir, blanc...
  const sortedByType = [...clothingProducts].sort((a: any, b: any) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    // Priority order: ensemble > veste > t-shirt > jogging > bonnet
    const getPriority = (name: string) => {
      if (name.includes('ensemble')) return 0;
      if (name.includes('veste')) return 1;
      if (name.includes('t-shirt')) return 2;
      if (name.includes('jogging')) return 3;
      if (name.includes('bonnet')) return 4;
      return 5;
    };

    const priorityA = getPriority(nameA);
    const priorityB = getPriority(nameB);

    if (priorityA !== priorityB) return priorityA - priorityB;

    // Within same category, sort noir first then blanc
    const isNoirA = nameA.includes('noir');
    const isNoirB = nameB.includes('noir');
    if (isNoirA && !isNoirB) return -1;
    if (!isNoirA && isNoirB) return 1;

    return nameA.localeCompare(nameB);
  });

  // Reorder to alternate noir/blanc: take all noir products and all blanc products
  // then interleave them: noir1, blanc1, noir2, blanc2, etc.
  const noirProducts = sortedByType.filter((p: any) => p.name.toLowerCase().includes('noir'));
  const blancProducts = sortedByType.filter((p: any) => p.name.toLowerCase().includes('blanc'));
  const otherProducts = sortedByType.filter((p: any) =>
    !p.name.toLowerCase().includes('noir') && !p.name.toLowerCase().includes('blanc')
  );

  const sortedClothingProducts: any[] = [];
  const maxLen = Math.max(noirProducts.length, blancProducts.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < noirProducts.length) sortedClothingProducts.push(noirProducts[i]);
    if (i < blancProducts.length) sortedClothingProducts.push(blancProducts[i]);
  }
  // Add any other products at the end
  sortedClothingProducts.push(...otherProducts);

  const filteredProducts = products;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="collection" ref={gridRef} className="pt-6 md:pt-10 pb-20 bg-background relative overflow-hidden">

      {/* Section header */}
      <div className={`text-center mb-6 md:mb-10 px-4 relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 md:px-6 py-2 mb-6 md:mb-8">
          <span
            className="text-primary text-xs md:text-sm"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
          >
            {t.firstCollectionAvailable}
          </span>
        </div>

        {/* Decorative line with star */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="h-[2px] w-16 md:w-40 bg-gradient-to-r from-transparent to-primary" />
          <TemporalStar size={16} strokeWidth={8} className="md:w-5 md:h-5" />
          <div className="h-[2px] w-16 md:w-40 bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* Main title with effect */}
        <h2
          className="text-4xl md:text-7xl lg:text-8xl text-foreground uppercase leading-none mb-4 md:mb-6"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
        >
          <span className="block">{t.decemberDrop}</span>
        </h2>

        <p
          className="text-muted-foreground tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-base"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          {t.limitedEditionPremium}
        </p>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Packs + Clothing products - 2 cols mobile, 4 cols desktop, centered */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 lg:gap-8">
              {/* Packs first (before vestes) */}
              {packs.map((pack, index) => {
                const heroImage =
                  (pack.images && pack.images.length > 0 && pack.images[0]) ||
                  pack.image ||
                  pack.items[0]?.product.images?.[0] ||
                  '';
                const secondImage = pack.images?.[1] || pack.items[1]?.product.images?.[0] || '';
                const hasDiscount = pack.discount > 0;

                return (
                  <div
                    key={`pack-${pack.id}`}
                    className={`w-[calc(50%-6px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-24px)] transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Link href={`/packs/${pack.slug}`} className="group block">
                      <div className="relative">
                        <div className={`aspect-[3/4] relative overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
                            {heroImage ? (
                              <>
                                <img
                                  src={heroImage}
                                  alt={pack.name}
                                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${secondImage ? 'group-hover:opacity-0' : ''}`}
                                />
                                {secondImage && (
                                  <img
                                    src={secondImage}
                                    alt={`${pack.name} - view 2`}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                  />
                                )}
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Package size={64} className="text-foreground/10" />
                              </div>
                            )}
                          </div>

                          {/* Pack badge */}
                          <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 text-xs"
                               style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                            <Package size={12} />
                            PACK
                          </div>

                          {/* Discount badge */}
                          {hasDiscount && (
                            <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 text-xs"
                                 style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                              -{pack.discountPercent}%
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="pt-4 space-y-2">
                          <p
                            className="text-xs text-primary uppercase tracking-widest"
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            PACK
                          </p>
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className="text-foreground text-base uppercase leading-tight group-hover:text-primary transition-colors"
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                            >
                              {pack.name}
                            </h3>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span
                                className="text-foreground text-lg"
                                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                              >
                                {pack.price.toFixed(0)}€
                              </span>
                              {hasDiscount && (
                                <span
                                  className={`text-xs line-through ${darkMode ? 'text-white/30' : 'text-black/30'}`}
                                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                >
                                  {pack.originalPrice.toFixed(0)}€
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
              {/* Clothing products */}
              {sortedClothingProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`w-[calc(50%-6px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-24px)] transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  }`}
                  style={{ transitionDelay: `${(packs.length + index) * 100}ms` }}
                >
                  <ProductCard product={product} index={packs.length + index} />
                </div>
              ))}
            </div>

            {/* Stickers section - responsive columns */}
            {reorderedStickers.length > 0 && (
              <div className="mt-12 md:mt-20">
                {/* Stickers header */}
                <div className="text-center mb-6 md:mb-10">
                  <h3
                    className="text-2xl md:text-4xl text-foreground uppercase"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.stickers}
                  </h3>
                  <p
                    className="text-muted-foreground mt-1 md:mt-2 text-xs md:text-base"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.stickerVariantsAvailable}
                  </p>
                </div>

                {/* Stickers grid - 2 cols on mobile (<800px), 3 cols on larger screens */}
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 min-[800px]:grid-cols-3 gap-3 md:gap-6">
                    {reorderedStickers.map((product: any, index: number) => (
                      <div
                        key={product.id}
                        className={`transition-all duration-700 ${
                          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                        style={{ transitionDelay: `${(sortedClothingProducts.length + index) * 100}ms` }}
                      >
                        <ProductCard product={product} index={sortedClothingProducts.length + index} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noProductsAvailable}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className={`text-center mt-10 md:mt-16 px-4 relative z-10 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <p
          className="text-muted-foreground mb-6 text-sm md:text-base"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          {t.stockLimited}
        </p>
      </div>
    </section>
  );
}

