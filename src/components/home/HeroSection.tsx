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
 * ContestSection — scroll-driven reveal
 *
 * Two hero images are rendered as a SEPARATE overlay, properly centered
 * with a gap between them. As the user scrolls:
 *   0-15%  : photos visible, big, centered, dark bg
 *   15-35% : colors fade in
 *   30-55% : overlay photos fade out, final layout appears
 *   50-75% : text fades in
 *
 * Wrapper is 150vh + sticky so the animation has room to breathe.
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
    const vh = window.innerHeight;
    // Start when section top reaches 60% from viewport top (halfway visible)
    // Uses the full 150vh wrapper scroll distance for a slow, luxurious pace
    const scrollRange = el.offsetHeight - vh;
    const scrolled = -rect.top + vh * 0.4; // offset so it starts when 40% visible
    const p = clamp(scrolled / scrollRange, 0, 1);
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
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [contests, onScroll, update]);

  const c1 = contests[0];
  const c2 = contests[1];
  if (!c1 && !c2) return null;

  const p = progressRef.current;
  const bebas: React.CSSProperties = { fontFamily: '"Bebas Neue", sans-serif' };

  // --- Phases (spread over full 0→1 range for slow, luxurious pace) ---
  // Phase 1: Images stay centered (0→0.25 = no movement, just visible)

  // Phase 2: Overlay images SLIDE apart from center (25→65%)
  const slideP = clamp((p - 0.25) / 0.40, 0, 1);
  const slideEp = easeOut(slideP);
  const img1SlideX = lerp(0, -35, slideEp);
  const img2SlideX = lerp(0, 35, slideEp);
  const imgOverlayScale = lerp(1, 0.85, slideEp);

  // Phase 2b: Background colors appear while images slide (30→60%)
  const bgOpacity = easeOut(clamp((p - 0.30) / 0.30, 0, 1));

  // Phase 3: Overlay fades out, final layout fades in (55→75%)
  const overlayOpacity = 1 - easeOut(clamp((p - 0.55) / 0.20, 0, 1));
  const layoutOpacity = easeOut(clamp((p - 0.58) / 0.17, 0, 1));

  // Phase 4: Text arrives (75→100%)
  const textOpacity = clamp((p - 0.75) / 0.25, 0, 1);
  const textY = lerp(25, 0, easeOut(textOpacity));
  const sepOpacity = clamp((p - 0.72) / 0.18, 0, 1);

  // Helper to render a contest text block
  const renderText = (c: ContestData, variant: 'light' | 'dark') => {
    const isLight = variant === 'light';
    return (
      <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)`, willChange: 'opacity, transform' }}>
        <div className="flex items-center gap-4 md:gap-6">
          <span className={`${isLight ? 'text-white/30' : 'text-primary/30'} text-6xl md:text-8xl lg:text-9xl font-bold leading-none`} style={bebas}>{c.number}</span>
          <div className="flex-1">
            <p className={`text-xs md:text-sm tracking-[0.2em] uppercase ${isLight ? 'text-white/80' : 'text-primary'}`} style={bebas}>{isLight ? t.winA : t.winAFemale}</p>
            <h3 className={`text-xl md:text-3xl lg:text-4xl uppercase leading-tight font-bold ${isLight ? 'text-white' : 'text-foreground'}`} style={bebas}>
              {language === 'fr' ? c.prizeName : (c.prizeNameEn || c.prizeName)}
            </h3>
            <p className={`text-sm md:text-base ${isLight ? 'text-white/70' : darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>{t.value} {c.prizeValue}€</p>
          </div>
          <div className="text-right hidden md:block">
            <p className={`text-2xl md:text-3xl font-bold ${isLight ? 'text-white' : 'text-primary'}`} style={bebas}>{c.purchaseAmount}€ {t.purchaseSuffix}</p>
            <p className={`text-xs md:text-sm ${isLight ? 'text-white/80' : darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>{t.oneDrawEntry}</p>
          </div>
        </div>
        <div className="mt-2 md:hidden">
          <p className={`text-lg font-bold ${isLight ? 'text-white' : 'text-primary'}`} style={bebas}>{c.purchaseAmount}€ {t.purchaseSuffix}</p>
          <p className={`text-xs ${isLight ? 'text-white/80' : darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>{t.oneDrawEntry}</p>
        </div>
        <p className={`text-[10px] md:text-xs mt-3 md:mt-4 ${isLight ? 'text-white/60' : darkMode ? 'text-white/50' : 'text-black/50'}`}>
          {language === 'fr' ? c.description : (c.descriptionEn || c.description)}
        </p>
        <Link href="/concours#conditions" className={`inline-block mt-1.5 md:mt-2 text-[10px] md:text-xs transition-colors underline underline-offset-2 ${isLight ? 'text-white/50 hover:text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>
          {t.concoursSeeConditionsLink}
        </Link>
      </div>
    );
  };

  return (
    <div id="contests" ref={wrapperRef} className="relative z-30 -mt-20 scroll-mt-20" style={{ height: '150vh' }}>
      <div className="sticky top-0 w-full overflow-hidden">
        <div className="relative w-full" style={{ minHeight: '280px' }}>

          {/* === Base background (matches page, no dark strip) === */}
          <div className="absolute inset-0 bg-background z-0" style={{ opacity: 1 - bgOpacity }} />

          {/* === HERO OVERLAY: two photos that SLIDE apart === */}
          {overlayOpacity > 0.01 && c1?.prizeImage && c2?.prizeImage && (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
              style={{ opacity: overlayOpacity }}
            >
              <img
                src={c1.prizeImage}
                alt=""
                className="h-full w-auto max-w-[50%] object-cover"
                style={{
                  willChange: 'transform',
                  transform: `translateX(${img1SlideX}vw) scale(${imgOverlayScale})`,
                }}
              />
              <img
                src={c2.prizeImage}
                alt=""
                className="h-full w-auto max-w-[50%] object-cover"
                style={{
                  willChange: 'transform',
                  transform: `translateX(${img2SlideX}vw) scale(${imgOverlayScale})`,
                }}
              />
            </div>
          )}

          {/* === FINAL LAYOUT (fades in as overlay fades out) === */}
          <div style={{ opacity: layoutOpacity }}>
            {/* Desktop */}
            <div className="hidden md:flex w-full" style={{ minHeight: '280px' }}>
              {c1 && (
                <div className={`relative ${c2 ? 'w-1/2' : 'w-full'}`}>
                  <div className="absolute inset-0 bg-primary" style={{ opacity: bgOpacity }} />
                  <div className="relative flex items-stretch min-h-[280px]">
                    <div className="relative w-40 lg:w-48 flex-shrink-0 self-stretch bg-white/10 overflow-hidden">
                      {c1.prizeImage && <img src={c1.prizeImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    </div>
                    <div className="p-6 md:p-8 lg:p-10 md:pr-16 flex flex-col justify-center flex-1">
                      {renderText(c1, 'light')}
                    </div>
                  </div>
                </div>
              )}
              {c1 && c2 && (
                <div className="absolute left-1/2 top-0 bottom-0 w-[60px] -translate-x-1/2 z-10 pointer-events-none" style={{ opacity: sepOpacity }}>
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polygon points="0,0 70,0 30,100 0,100" className="fill-primary" />
                    <polygon points="70,0 100,0 100,100 30,100" className={darkMode ? 'fill-[#0a0a0a]' : 'fill-white'} />
                  </svg>
                </div>
              )}
              {c2 && (
                <div className={`relative ${c1 ? 'w-1/2' : 'w-full'}`}>
                  <div className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`} style={{ opacity: bgOpacity }} />
                  <div className="relative flex items-stretch min-h-[280px]">
                    <div className="p-6 md:p-8 lg:p-10 md:pl-16 flex flex-col justify-center flex-1">
                      {renderText(c2, 'dark')}
                    </div>
                    <div className={`relative w-40 lg:w-48 flex-shrink-0 self-stretch overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      {c2.prizeImage && <img src={c2.prizeImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="flex flex-col md:hidden">
              {c1 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary" style={{ opacity: bgOpacity }} />
                  <div className="relative flex items-stretch min-h-[200px]">
                    <div className="relative w-28 flex-shrink-0 self-stretch bg-white/10 overflow-hidden">
                      {c1.prizeImage && <img src={c1.prizeImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    </div>
                    <div className="p-5 flex flex-col justify-center flex-1">
                      {renderText(c1, 'light')}
                    </div>
                  </div>
                </div>
              )}
              {c2 && (
                <div className="relative border-t border-white/10">
                  <div className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`} style={{ opacity: bgOpacity }} />
                  <div className="relative flex items-stretch min-h-[200px]">
                    <div className={`relative w-28 flex-shrink-0 self-stretch overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      {c2.prizeImage && <img src={c2.prizeImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    </div>
                    <div className="p-5 flex flex-col justify-center flex-1">
                      {renderText(c2, 'dark')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
