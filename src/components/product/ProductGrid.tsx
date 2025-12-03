'use client';

import { useEffect, useRef, useState } from 'react';
import { products } from '@/lib/products';
import ProductCard from './ProductCard';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { Flame } from 'lucide-react';
import TemporalStar from '@/components/ui/TemporalStar';

interface ProductGridProps {
  category?: string;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const { language } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products;

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
    <section id="collection" ref={gridRef} className="pt-0 pb-20 bg-background relative overflow-hidden -mt-32">

      {/* Section header */}
      <div className={`text-center mb-20 relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-6 py-2 mb-4">
          <Flame size={16} className="text-primary" />
          <span
            className="text-primary text-sm"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
          >
            PREMIÈRE COLLECTION DISPONIBLE
          </span>
        </div>

        {/* Decorative line with star - moved up */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="h-[2px] w-24 md:w-40 bg-gradient-to-r from-transparent to-primary" />
          <TemporalStar size={20} strokeWidth={8} />
          <div className="h-[2px] w-24 md:w-40 bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* Main title with effect */}
        <h2
          className="text-5xl md:text-7xl lg:text-8xl text-foreground uppercase leading-none mb-6"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
        >
          <span className="block">{t.decemberDrop}</span>
        </h2>

        <p
          className="text-muted-foreground tracking-[0.3em] uppercase"
          style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem' }}
        >
          Édition Limitée • Qualité Premium • Made in France
        </p>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={`text-center mt-16 relative z-10 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <p
          className="text-muted-foreground mb-6"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          STOCK LIMITÉ — NE RATE PAS LE DROP
        </p>
      </div>
    </section>
  );
}
