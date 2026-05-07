'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalStar from '@/components/ui/TemporalStar';
import { Package } from 'lucide-react';

interface PackProduct {
  id: string;
  name: string;
  images: string[];
}

interface PackItem {
  id: string;
  productId: string;
  quantity: number;
  product: PackProduct;
}

interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  images: string[];
  isActive: boolean;
  items: PackItem[];
  originalPrice: number;
  discount: number;
  discountPercent: number;
}

interface PackGridProps {
  limit?: number;
}

export default function PackGrid({ limit = 2 }: PackGridProps) {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await fetch('/api/packs');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const allPacks: Pack[] = data.data?.packs || [];
        setPacks(allPacks.filter((p) => p.isActive).slice(0, limit));
      } catch (err) {
        console.error('Error fetching packs:', err);
        setPacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, [limit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Don't render anything if no active packs
  if (!loading && packs.length === 0) return null;
  if (loading) return null;

  return (
    <section ref={sectionRef} className="pt-6 md:pt-10 pb-8 md:pb-12 bg-background relative overflow-hidden">
      {/* Section header */}
      <div
        className={`text-center mb-8 md:mb-12 px-4 relative z-10 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 md:px-6 py-2 mb-6">
          <Package size={14} className="text-primary" />
          <span
            className="text-primary text-xs md:text-sm"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
          >
            {language === 'fr' ? 'OFFRES PACK' : 'PACK DEALS'}
          </span>
        </div>

        {/* Decorative line with star */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
          <div className="h-[2px] w-16 md:w-40 bg-gradient-to-r from-transparent to-primary" />
          <TemporalStar size={16} strokeWidth={8} className="md:w-5 md:h-5" />
          <div className="h-[2px] w-16 md:w-40 bg-gradient-to-l from-transparent to-primary" />
        </div>

        <h2
          className="text-3xl md:text-5xl lg:text-6xl text-foreground uppercase leading-none mb-3 md:mb-4"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
        >
          {language === 'fr' ? 'NOS PACKS EXCLUSIFS' : 'OUR EXCLUSIVE PACKS'}
        </h2>

        <p
          className="text-muted-foreground tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          {language === 'fr' ? 'ÉCONOMISEZ EN ACHETANT EN LOT' : 'SAVE BY BUYING IN BULK'}
        </p>
      </div>

      {/* Packs grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {packs.map((pack, index) => {
            const heroImage =
              (pack.images && pack.images.length > 0 && pack.images[0]) ||
              pack.image ||
              pack.items[0]?.product.images[0] ||
              '';
            const hasDiscount = pack.discount > 0;

            return (
              <Link
                key={pack.id}
                href={`/packs/${pack.slug}`}
                className={`group block relative overflow-hidden border transition-all duration-700 hover:scale-[1.01] ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
                } ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                  {heroImage && (
                    <Image
                      src={heroImage}
                      alt={pack.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {/* Discount badge */}
                  {hasDiscount && (
                    <div
                      className="absolute top-3 right-3 bg-primary text-white px-3 py-1 text-sm"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      -{pack.discountPercent}%
                    </div>
                  )}
                  {/* Pack badge */}
                  <div
                    className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/70 text-white px-2 py-1 text-xs"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <Package size={12} />
                    PACK
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                  <h3
                    className={`text-2xl md:text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {pack.name}
                  </h3>
                  {pack.description && (
                    <p
                      className={`text-sm mb-3 line-clamp-2 ${
                        darkMode ? 'text-white/60' : 'text-black/60'
                      }`}
                    >
                      {pack.description}
                    </p>
                  )}
                  {/* Pricing */}
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-2xl md:text-3xl text-primary"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {pack.price.toFixed(2)}€
                    </span>
                    {hasDiscount && (
                      <span
                        className={`text-base line-through ${
                          darkMode ? 'text-white/30' : 'text-black/30'
                        }`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {pack.originalPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                  {/* CTA */}
                  <div
                    className="mt-4 inline-block text-primary text-sm group-hover:translate-x-1 transition-transform"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {language === 'fr' ? 'VOIR LE PACK →' : 'VIEW PACK →'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
