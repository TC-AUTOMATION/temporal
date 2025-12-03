'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = Math.min(scrollY / 300, 1);
  const logoScale = Math.max(0.16, 1 - scrollProgress);
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
        {/* Logo with parallax */}
        <div
          className={`transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translateY(${-scrollProgress * 300}px) scale(${logoScale})`,
            transition: 'transform 0.3s ease-out, opacity 1s',
          }}
        >
          <TemporalLogo size={400} />
        </div>

        {/* Tagline */}
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
              {t.heroTagline}
            </p>
            <div className="h-[1px] w-16 md:w-32 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mt-12 grid grid-cols-3 gap-8 md:gap-16 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ opacity: contentOpacity }}
        >
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              100%
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">
              {t.premium}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              LTD
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">
              {t.edition}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-3xl md:text-5xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              24H
            </p>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-1">
              {t.shipping}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <Link
        href="#collection"
        className="absolute bottom-8 left-0 right-0 z-20 text-center group cursor-pointer"
        style={{ opacity: contentOpacity }}
      >
        <p
          className="text-foreground text-sm md:text-base uppercase tracking-[0.3em] mb-3 group-hover:text-primary transition-colors"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          DÉCOUVRIR
        </p>
        <ChevronDown size={28} className="text-primary mx-auto animate-bounce" strokeWidth={2.5} />
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent hidden lg:block" />
      <div className="absolute top-1/4 right-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent hidden lg:block" />

      {/* Corner accents */}
      <div className="absolute top-20 left-8 text-muted-foreground/30 hidden lg:block">
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
          EST. 2025
        </p>
      </div>
      <div className="absolute top-20 right-8 text-muted-foreground/30 hidden lg:block">
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
          FRANCE
        </p>
      </div>
    </section>
  );
}
