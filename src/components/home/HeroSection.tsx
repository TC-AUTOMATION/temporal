'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';
import Link from 'next/link';

export default function HeroSection() {
  const { language } = useStore();
  const t = translations[language];
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => {
      if (window.scrollY <= 500) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoTranslateY = Math.max(-250, -scrollY * 0.5);
  const logoScale = Math.max(0.12, 1 - scrollY / 600);
  const contentOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo avec parallax */}
        <div
          className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{
            transform: `translateY(${logoTranslateY}px) scale(${logoScale})`,
          }}
        >
          <TemporalLogo size={280} />
        </div>

        {/* Streetwear subtitle */}
        <div
          className={`mt-8 text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ opacity: contentOpacity }}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-16 md:w-32 bg-gradient-to-r from-transparent to-primary" />
            <p
              className="text-primary text-lg md:text-xl tracking-[0.3em] uppercase"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              Parce que le temps, lui, n’attend pas
            </p>
            <div className="h-[1px] w-16 md:w-32 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className={`mt-12 flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ opacity: contentOpacity }}
        >
          <Link href="#collection">
            <button
              className="group relative px-10 py-4 bg-primary text-primary-foreground rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '1.1rem' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap size={18} />
                DÉCOUVRIR LE DROP
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer" />
            </button>
          </Link>

          <Link href="/shop">
            <button
              className="px-10 py-4 border-2 border-foreground/30 text-foreground rounded-full transition-all hover:border-primary hover:text-primary hover:scale-105"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '1.1rem' }}
            >
              VOIR LA COLLECTION
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className={`mt-16 grid grid-cols-3 gap-8 md:gap-16 transition-all duration-1000 delay-[900ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ opacity: contentOpacity }}
        >
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              100%
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">Premium</p>
          </div>
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              LTD
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">Édition</p>
          </div>
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              24H
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">Shipping</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-0 right-0 z-20 text-center"
        style={{ opacity: contentOpacity }}
      >
        <p
          className="text-muted-foreground text-xs uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          Scroll
        </p>
        <ChevronDown size={24} className="text-primary mx-auto animate-bounce" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent hidden lg:block" />
      <div className="absolute top-1/4 right-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent hidden lg:block" />

      {/* Corner accents */}
      <div className="absolute top-20 left-8 text-muted-foreground/30 hidden lg:block">
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '0.7rem' }}>EST. 2024</p>
      </div>
      <div className="absolute top-20 right-8 text-muted-foreground/30 hidden lg:block">
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '0.7rem' }}>FRANCE</p>
      </div>
    </section>
  );
}
