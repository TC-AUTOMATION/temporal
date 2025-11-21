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
    <section ref={gridRef} className="relative py-20 bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 noise pointer-events-none opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />

      {/* Section header */}
      <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#5B2D8E] to-transparent" />
          <span className="text-[#5B2D8E] text-xs tracking-[0.5em] uppercase">Collection</span>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#5B2D8E] to-transparent" />
        </div>
        <h2 className="text-responsive-lg font-black text-white uppercase tracking-wider">
          {t.decemberDrop}
        </h2>
        <p className="text-white/40 mt-4 tracking-widest text-sm uppercase">
          Limited Edition • Premium Quality
        </p>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="flex items-center justify-center mt-20 gap-4">
        <div className="w-1 h-1 bg-[#5B2D8E] rounded-full animate-pulse-slow" />
        <div className="w-2 h-2 bg-[#5B2D8E] rounded-full animate-pulse-slow" style={{ animationDelay: '0.2s' }} />
        <div className="w-3 h-3 bg-[#5B2D8E] rounded-full animate-pulse-slow" style={{ animationDelay: '0.4s' }} />
        <div className="w-2 h-2 bg-[#5B2D8E] rounded-full animate-pulse-slow" style={{ animationDelay: '0.6s' }} />
        <div className="w-1 h-1 bg-[#5B2D8E] rounded-full animate-pulse-slow" style={{ animationDelay: '0.8s' }} />
      </div>
    </section>
  );
}
