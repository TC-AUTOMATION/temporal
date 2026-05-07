'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalStar from '@/components/ui/TemporalStar';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  category?: string;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const { language } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) {
          params.append('category', category);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.data?.products || data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
            {/* Clothing products - 2 cols mobile, 4 cols desktop, centered */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 lg:gap-8">
              {sortedClothingProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`w-[calc(50%-6px)] md:w-[calc(50%-12px)] lg:w-[calc(25%-24px)] transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} index={index} />
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

