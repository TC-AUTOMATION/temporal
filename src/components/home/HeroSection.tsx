'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';

export default function HeroSection() {
  const { language } = useStore();
  const t = translations[language];
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Limiter le scroll tracking à 500px max
      if (window.scrollY <= 500) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax simple - le logo monte vers le header (limité)
  const logoTranslateY = Math.max(-250, -scrollY * 0.5);
  const logoScale = Math.max(0.12, 1 - scrollY / 600);
  const contentOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section className="relative h-screen bg-background overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Welcome text */}
        <div style={{ opacity: contentOpacity }}>
          <h2 className="text-foreground/60 text-sm md:text-base tracking-[0.5em] uppercase mb-6">
            {t.welcome}
          </h2>
        </div>

        {/* Logo avec parallax - monte vers le header */}
        <div
          style={{
            transform: `translateY(${logoTranslateY}px) scale(${logoScale})`,
          }}
        >
          <TemporalLogo size={300} />
        </div>

        {/* Subtitle */}
        <div className="mt-8 text-center" style={{ opacity: contentOpacity }}>
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
            Streetwear • Premium • Unique
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-0 right-0 z-20 text-center"
        style={{ opacity: contentOpacity }}
      >
        <ChevronDown size={24} className="text-foreground/50 mx-auto animate-bounce" />
      </div>
    </section>
  );
}
