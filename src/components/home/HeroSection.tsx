'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';

export default function HeroSection() {
  const { language } = useStore();
  const t = translations[language];
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const logoScale = Math.max(0.3, 1 - scrollY / 800);
  const opacity = Math.max(0, 1 - scrollY / 500);

  return (
    <section
      ref={heroRef}
      className="relative h-screen bg-black overflow-hidden"
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 noise pointer-events-none z-10" />

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none z-10" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-[5]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#5B2D8E]/10 via-transparent to-[#5B2D8E]/10 z-[5]" />

      {/* Starfield with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
      >
        <Starfield />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        <div
          className="absolute top-1/4 left-10 w-32 h-32 border border-[#5B2D8E]/30 rotate-45 animate-float"
          style={{
            transform: `translateY(${parallaxOffset * 0.2}px) rotate(${45 + scrollY * 0.05}deg)`,
          }}
        />
        <div
          className="absolute top-1/3 right-20 w-20 h-20 border border-white/10 animate-float"
          style={{
            transform: `translateY(${parallaxOffset * 0.4}px) rotate(${scrollY * 0.1}deg)`,
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-[#5B2D8E]/10 animate-float"
          style={{
            transform: `translateY(${parallaxOffset * 0.15}px)`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Main content */}
      <div
        className="relative z-20 h-full flex flex-col items-center justify-center"
        style={{ opacity }}
      >
        {/* Glitch title */}
        <div
          className={`mb-8 overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: `translateY(${-parallaxOffset * 0.2}px)` }}
        >
          <h2 className="text-white/60 text-sm md:text-base tracking-[0.5em] uppercase animate-glitch-text">
            {t.welcome}
          </h2>
        </div>

        {/* Logo container */}
        <div
          className={`relative transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          style={{
            transform: `scale(${logoScale}) translateY(${-parallaxOffset * 0.1}px)`,
          }}
        >
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 blur-3xl bg-[#5B2D8E]/30 scale-150 animate-pulse-slow" />

          {/* Logo */}
          <TemporalLogo size={350} animate className="relative z-10" />

          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-rotate" style={{ animationDuration: '20s' }}>
            <Sparkles className="absolute -top-4 left-1/2 text-[#5B2D8E] w-4 h-4" />
          </div>
          <div className="absolute inset-0 animate-rotate" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
            <Sparkles className="absolute top-1/2 -right-4 text-white/50 w-3 h-3" />
          </div>
        </div>

        {/* Subtitle */}
        <div
          className={`mt-12 text-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transform: `translateY(${parallaxOffset * 0.1}px)` }}
        >
          <p className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase">
            Streetwear • Premium • Unique
          </p>
        </div>
      </div>

      {/* Bottom section with December drop */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pb-8"
        style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
      >
        {/* Decorative line */}
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#5B2D8E] to-white mx-auto mb-4" />

        {/* December drop CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 glass rounded-full">
            <ChevronDown size={20} className="text-white animate-bounce" />
            <span className="text-white font-bold tracking-widest text-sm md:text-base">
              {t.decemberDrop}
            </span>
            <ChevronDown size={20} className="text-white animate-bounce" />
          </div>
        </div>
      </div>

      {/* Side text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <p
          className="text-white/20 text-xs tracking-[0.5em] uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Temporal Collection 2024
        </p>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <p
          className="text-white/20 text-xs tracking-[0.5em] uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Limited Edition
        </p>
      </div>
    </section>
  );
}
