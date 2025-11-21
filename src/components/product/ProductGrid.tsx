'use client';

import { useEffect, useRef, useState } from 'react';
import { products } from '@/lib/products';
import ProductCard from './ProductCard';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';

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
    <section ref={gridRef} className="py-20 bg-background">
      {/* Section header */}
      <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <span className="text-primary text-xs tracking-[0.5em] uppercase">Collection</span>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-wider">
          {t.decemberDrop}
        </h2>
        <p className="text-muted-foreground mt-4 tracking-widest text-sm uppercase">
          Limited Edition • Premium Quality
        </p>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
