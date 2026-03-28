'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import { ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Starfield from '@/components/ui/Starfield';
import CartGauge from '@/components/ui/CartGauge';
import Link from 'next/link';

export default function HeroSection() {
  const { language, darkMode } = useStore();
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
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

      {/* Cart Gauge - à droite en haut */}
      <div
        className="absolute right-4 md:right-8 top-24 z-30 transition-opacity duration-500"
        style={{ opacity: contentOpacity }}
      >
        <CartGauge />
      </div>

      {/* Main content - centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 -mt-32 md:-mt-48">
        {/* Logo with parallax */}
        <div
          className={`transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translateY(${-scrollProgress * 300}px) scale(${logoScale})`,
            transition: 'transform 0.3s ease-out, opacity 1s',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="w-[450px] h-[450px] md:w-[900px] md:h-[900px] object-contain"
            style={{ background: 'transparent', backgroundColor: 'transparent' }}
          >
            {/* Safari/iOS: HEVC with alpha */}
            <source src="/hero-video.mov" type='video/mp4; codecs="hvc1"' />
            {/* Chrome/Firefox: WebM with alpha */}
            <source src="/hero-video.webm" type="video/webm" />
          </video>
        </div>

        {/* Tagline */}
        <div
          className={`-mt-24 md:-mt-48 text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
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
          className={`mt-12 flex items-center justify-center gap-6 md:gap-10 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ opacity: contentOpacity }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p
              className="text-sm md:text-base text-muted-foreground uppercase tracking-[0.2em]"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t.limitedEdition}
            </p>
          </div>
          <div className={`w-[1px] h-4 ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <p
              className="text-sm md:text-base text-muted-foreground uppercase tracking-[0.2em]"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t.shipping72h}
            </p>
          </div>
        </div>
      </div>

      {/* DISCOVER - at bottom of viewport */}
      <Link
        href="#contests"
        className="absolute bottom-28 md:bottom-32 left-0 right-0 z-20 text-center group cursor-pointer"
      >
        <p
          className="text-foreground text-sm md:text-base uppercase tracking-[0.3em] mb-2 group-hover:text-primary transition-colors"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          {t.discover}
        </p>
        <ChevronDown size={28} className="text-primary mx-auto animate-bounce" strokeWidth={2.5} />
      </Link>
    </section>
  );
}

// Contest data shape from the API
interface ContestData {
  id: string;
  number: string;
  prizeName: string;
  prizeNameEn: string | null;
  prizeValue: number;
  purchaseAmount: number;
  description: string | null;
  descriptionEn: string | null;
  prizeImage: string | null;
  isActive: boolean;
  _count: { entries: number };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/*
 * ContestSection - Apple-style scroll animation in 4 phases:
 *
 * Phase 1 (0.00→0.25): Photos BIG and CENTERED on dark background
 * Phase 2 (0.25→0.50): Colored backgrounds (violet / white) fade in
 * Phase 3 (0.45→0.75): Photos slide to their sides and shrink
 * Phase 4 (0.70→1.00): Texts fade in
 *
 * Uses a tall wrapper (200vh) + sticky content so the section stays
 * in view while the user scrolls and the animation plays out.
 */
export function ContestSection() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const [, rerender] = useState(0);

  useEffect(() => {
    fetch('/api/contests')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.contests) setContests(json.data.contests);
      })
      .catch(() => {});
  }, []);

  const update = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const wrapperH = el.offsetHeight;
    const vh = window.innerHeight;
    // How far through the wrapper: 0 = wrapper top at viewport top, 1 = wrapper bottom at viewport bottom
    const scrolled = -rect.top;
    const scrollRange = wrapperH - vh;
    const p = clamp(scrolled / Math.max(scrollRange, 1), 0, 1);
    if (Math.abs(p - progressRef.current) > 0.002) {
      progressRef.current = p;
      rerender((n) => n + 1);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          update();
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      },
      { rootMargin: '100px' }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [contests, onScroll, update]);

  const c1 = contests[0];
  const c2 = contests[1];
  if (!c1 && !c2) return null;

  const p = progressRef.current;
  const bebas: React.CSSProperties = { fontFamily: '"Bebas Neue", sans-serif' };

  // ===== PHASE 1: Photos visible, big, centered (p: 0.00 → 0.25) =====
  // Photos are always visible from the start

  // ===== PHASE 2: Colored backgrounds fade in (p: 0.25 → 0.50) =====
  const bgP = clamp((p - 0.25) / 0.25, 0, 1);
  const bgOpacity = easeOut(bgP);

  // ===== PHASE 3: Photos slide to sides (p: 0.45 → 0.75) =====
  const imgP = clamp((p - 0.45) / 0.30, 0, 1);
  const imgEp = easeOut(imgP);
  // Desktop: images translate from center to their edges
  const img1X = lerp(38, 0, imgEp);    // left image: from +38vw (toward center) to 0
  const img2X = lerp(-38, 0, imgEp);   // right image: from -38vw (toward center) to 0
  const imgScale = lerp(2.2, 1, imgEp); // big → normal
  // Mobile
  const imgMobileX = lerp(25, 0, imgEp);
  const imgMobileScale = lerp(1.6, 1, imgEp);

  // ===== PHASE 4: Text fades in (p: 0.70 → 1.00) =====
  const textP = clamp((p - 0.70) / 0.30, 0, 1);
  const textEp = easeOut(textP);
  const textOpacity = textP;
  const textY = lerp(30, 0, textEp);

  // Separator appears with text
  const sepOpacity = clamp((p - 0.65) / 0.25, 0, 1);

  // Images stay above everything during animation
  const imgZ = imgP < 0.9 ? 30 : 1;

  return (
    <div
      id="contests"
      ref={wrapperRef}
      className="relative z-30 -mt-20 scroll-mt-20"
      style={{ height: '200vh' }}
    >
      {/* Sticky content: stays in viewport while user scrolls the 200vh wrapper */}
      <div className="sticky top-0 w-full overflow-hidden">
        {/* The actual section content */}
        <div className="relative w-full">

          {/* ===== Background layers ===== */}
          {/* Dark base - always behind everything, fades out as colors appear */}
          <div
            className="absolute inset-0 bg-[#0a0a0a] z-0"
            style={{ opacity: lerp(1, 0, bgOpacity) }}
          />

          {/* ===== DESKTOP LAYOUT ===== */}
          <div className="hidden md:block">
            <div className="relative w-full flex" style={{ minHeight: '280px' }}>

              {/* === Contest 1 half === */}
              {c1 && (
                <div className={`relative ${c2 ? 'w-1/2' : 'w-full'}`}>
                  {/* Colored bg fades in (Phase 2) */}
                  <div className="absolute inset-0 bg-primary" style={{ opacity: bgOpacity }} />

                  <div className="relative flex items-stretch min-h-[280px]">
                    {/* Image */}
                    <div
                      className="relative w-40 lg:w-48 flex-shrink-0 self-stretch"
                      style={{ overflow: 'visible', zIndex: imgZ }}
                    >
                      {/* Image bg tint */}
                      <div className="absolute inset-0 bg-white/10" style={{ opacity: bgOpacity }} />
                      {c1.prizeImage && (
                        <img
                          src={c1.prizeImage}
                          alt={language === 'fr' ? c1.prizeName : (c1.prizeNameEn || c1.prizeName)}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            willChange: 'transform',
                            transformOrigin: 'center center',
                            transform: `translateX(${img1X}vw) scale(${imgScale})`,
                          }}
                        />
                      )}
                    </div>

                    {/* Text (Phase 4) */}
                    <div
                      className="p-8 lg:p-10 pr-16 flex flex-col justify-center flex-1"
                      style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-white/30 text-8xl lg:text-9xl font-bold leading-none" style={bebas}>
                          {c1.number}
                        </span>
                        <div className="flex-1">
                          <p className="text-white/80 text-sm tracking-[0.2em] uppercase" style={bebas}>{t.winA}</p>
                          <h3 className="text-white text-3xl lg:text-4xl uppercase leading-tight font-bold" style={bebas}>
                            {language === 'fr' ? c1.prizeName : (c1.prizeNameEn || c1.prizeName)}
                          </h3>
                          <p className="text-white/70 text-base" style={bebas}>{t.value} {c1.prizeValue}€</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-3xl font-bold" style={bebas}>
                            {c1.purchaseAmount}€ {t.purchaseSuffix}
                          </p>
                          <p className="text-white/80 text-sm" style={bebas}>{t.oneDrawEntry}</p>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs mt-4">
                        {language === 'fr' ? c1.description : (c1.descriptionEn || c1.description)}
                      </p>
                      <Link href="/concours#conditions" className="inline-block mt-2 text-white/50 hover:text-white text-xs transition-colors underline underline-offset-2">
                        {t.concoursSeeConditionsLink}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagonal separator */}
              {c1 && c2 && (
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-[60px] -translate-x-1/2 z-10 pointer-events-none"
                  style={{ opacity: sepOpacity }}
                >
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polygon points="0,0 70,0 30,100 0,100" className="fill-primary" />
                    <polygon points="70,0 100,0 100,100 30,100" className={darkMode ? 'fill-[#0a0a0a]' : 'fill-white'} />
                  </svg>
                </div>
              )}

              {/* === Contest 2 half === */}
              {c2 && (
                <div className={`relative ${c1 ? 'w-1/2' : 'w-full'}`}>
                  {/* Colored bg fades in (Phase 2) */}
                  <div
                    className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}
                    style={{ opacity: bgOpacity }}
                  />

                  <div className="relative flex items-stretch min-h-[280px]">
                    {/* Text (Phase 4) */}
                    <div
                      className="p-8 lg:p-10 pl-16 flex flex-col justify-center flex-1"
                      style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-primary/30 text-8xl lg:text-9xl font-bold leading-none" style={bebas}>
                          {c2.number}
                        </span>
                        <div className="flex-1">
                          <p className="text-primary text-sm tracking-[0.2em] uppercase" style={bebas}>{t.winAFemale}</p>
                          <h3 className="text-foreground text-3xl lg:text-4xl uppercase leading-tight font-bold" style={bebas}>
                            {language === 'fr' ? c2.prizeName : (c2.prizeNameEn || c2.prizeName)}
                          </h3>
                          <p className={`text-base ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                            {t.value} {c2.prizeValue}€
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary text-3xl font-bold" style={bebas}>
                            {c2.purchaseAmount}€ {t.purchaseSuffix}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                            {t.oneDrawEntry}
                          </p>
                        </div>
                      </div>
                      <p className={`text-xs mt-4 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {language === 'fr' ? c2.description : (c2.descriptionEn || c2.description)}
                      </p>
                      <Link
                        href="/concours#conditions"
                        className={`inline-block mt-2 text-xs transition-colors underline underline-offset-2 ${darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}
                      >
                        {t.concoursSeeConditionsLink}
                      </Link>
                    </div>

                    {/* Image */}
                    <div
                      className={`relative w-40 lg:w-48 flex-shrink-0 self-stretch`}
                      style={{ overflow: 'visible', zIndex: imgZ }}
                    >
                      <div className={`absolute inset-0 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} style={{ opacity: bgOpacity }} />
                      {c2.prizeImage && (
                        <img
                          src={c2.prizeImage}
                          alt={language === 'fr' ? c2.prizeName : (c2.prizeNameEn || c2.prizeName)}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            willChange: 'transform',
                            transformOrigin: 'center center',
                            transform: `translateX(${img2X}vw) scale(${imgScale})`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== MOBILE LAYOUT ===== */}
          <div className="block md:hidden">
            {/* Contest 1 mobile */}
            {c1 && (
              <div className="relative">
                <div className="absolute inset-0 bg-primary" style={{ opacity: bgOpacity }} />
                <div className="relative flex items-stretch min-h-[200px]">
                  <div className="relative w-28 flex-shrink-0 self-stretch" style={{ overflow: 'visible', zIndex: imgZ }}>
                    <div className="absolute inset-0 bg-white/10" style={{ opacity: bgOpacity }} />
                    {c1.prizeImage && (
                      <img
                        src={c1.prizeImage}
                        alt={language === 'fr' ? c1.prizeName : (c1.prizeNameEn || c1.prizeName)}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          willChange: 'transform',
                          transformOrigin: 'center center',
                          transform: `translateX(${imgMobileX}vw) scale(${imgMobileScale})`,
                        }}
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-center flex-1" style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
                    <div className="flex items-center gap-4">
                      <span className="text-white/30 text-6xl font-bold leading-none" style={bebas}>{c1.number}</span>
                      <div className="flex-1">
                        <p className="text-white/80 text-xs tracking-[0.2em] uppercase" style={bebas}>{t.winA}</p>
                        <h3 className="text-white text-xl uppercase leading-tight font-bold" style={bebas}>
                          {language === 'fr' ? c1.prizeName : (c1.prizeNameEn || c1.prizeName)}
                        </h3>
                        <p className="text-white/70 text-sm" style={bebas}>{t.value} {c1.prizeValue}€</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-white text-lg font-bold" style={bebas}>{c1.purchaseAmount}€ {t.purchaseSuffix}</p>
                      <p className="text-white/80 text-xs" style={bebas}>{t.oneDrawEntry}</p>
                    </div>
                    <p className="text-white/60 text-[10px] mt-3">
                      {language === 'fr' ? c1.description : (c1.descriptionEn || c1.description)}
                    </p>
                    <Link href="/concours#conditions" className="inline-block mt-1.5 text-white/50 hover:text-white text-[10px] transition-colors underline underline-offset-2">
                      {t.concoursSeeConditionsLink}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Contest 2 mobile */}
            {c2 && (
              <div className="relative border-t border-white/10">
                <div className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`} style={{ opacity: bgOpacity }} />
                <div className="relative flex items-stretch min-h-[200px]">
                  <div className={`relative w-28 flex-shrink-0 self-stretch`} style={{ overflow: 'visible', zIndex: imgZ }}>
                    <div className={`absolute inset-0 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} style={{ opacity: bgOpacity }} />
                    {c2.prizeImage && (
                      <img
                        src={c2.prizeImage}
                        alt={language === 'fr' ? c2.prizeName : (c2.prizeNameEn || c2.prizeName)}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          willChange: 'transform',
                          transformOrigin: 'center center',
                          transform: `translateX(${imgMobileX}vw) scale(${imgMobileScale})`,
                        }}
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-center flex-1" style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
                    <div className="flex items-center gap-4">
                      <span className="text-primary/30 text-6xl font-bold leading-none" style={bebas}>{c2.number}</span>
                      <div className="flex-1">
                        <p className="text-primary text-xs tracking-[0.2em] uppercase" style={bebas}>{t.winAFemale}</p>
                        <h3 className="text-foreground text-xl uppercase leading-tight font-bold" style={bebas}>
                          {language === 'fr' ? c2.prizeName : (c2.prizeNameEn || c2.prizeName)}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>{t.value} {c2.prizeValue}€</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-primary text-lg font-bold" style={bebas}>{c2.purchaseAmount}€ {t.purchaseSuffix}</p>
                      <p className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>{t.oneDrawEntry}</p>
                    </div>
                    <p className={`text-[10px] mt-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {language === 'fr' ? c2.description : (c2.descriptionEn || c2.description)}
                    </p>
                    <Link href="/concours#conditions" className={`inline-block mt-1.5 text-[10px] transition-colors underline underline-offset-2 ${darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>
                      {t.concoursSeeConditionsLink}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
