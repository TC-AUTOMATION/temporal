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

// Utility: clamp a value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Utility: linear interpolation
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Utility: ease-out cubic for smoother deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Contest Section - Full width banner split 50/50 with scroll-based animation
export function ContestSection() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    fetch('/api/contests')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.contests) {
          setContests(json.data.contests);
        }
      })
      .catch(() => {
        // Fail silently - section will simply not render
      });
  }, []);

  // Scroll-based animation progress calculation
  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Animation starts when section top enters the bottom of the viewport
    // Animation ends when section top reaches ~40% from top of viewport
    const startTrigger = viewportHeight; // section top at bottom of viewport
    const endTrigger = viewportHeight * 0.35; // section top at 35% from top

    // rect.top goes from startTrigger (entering) to endTrigger (fully visible)
    const rawProgress = 1 - (rect.top - endTrigger) / (startTrigger - endTrigger);
    const clampedProgress = clamp(rawProgress, 0, 1);

    setProgress(clampedProgress);
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // IntersectionObserver to activate/deactivate scroll listener
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        rootMargin: '200px 0px 200px 0px', // generous margin for early activation
        threshold: 0,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [contests]); // Re-observe when contests load

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Calculate initial progress immediately
      updateProgress();
    } else {
      window.removeEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isVisible, handleScroll, updateProgress]);

  const contest1 = contests[0];
  const contest2 = contests[1];

  // Don't render if no active contests
  if (!contest1 && !contest2) return null;

  // --- Animation values derived from progress ---
  const easedProgress = easeOutCubic(progress);

  // Images: start big and centered, end at normal size on sides
  // Scale: 2.2 (big, centered) -> 1 (final position)
  const imageScale = lerp(2.2, 1, easedProgress);

  // Image 1 (left side): starts from center, moves left
  // translateX: positive value (toward center) -> 0 (final left position)
  const img1TranslateX = lerp(45, 0, easedProgress); // percentage-based shift

  // Image 2 (right side): starts from center, moves right
  const img2TranslateX = lerp(-45, 0, easedProgress); // percentage-based shift

  // Mobile: images move vertically instead
  const imgMobileTranslateY = lerp(30, 0, easedProgress);

  // Image opacity: dramatic entrance
  const imageOpacity = clamp(progress * 2.5, 0, 1);

  // Text content: appears in second half of animation
  const textOpacity = clamp((progress - 0.4) / 0.5, 0, 1);
  const textEased = easeOutCubic(clamp((progress - 0.35) / 0.55, 0, 1));

  // Text slides: contest 1 text slides from right, contest 2 from left
  const text1TranslateX = lerp(40, 0, textEased);
  const text2TranslateX = lerp(-40, 0, textEased);

  // Separator opacity
  const separatorOpacity = clamp((progress - 0.5) / 0.4, 0, 1);

  return (
    <section
      id="contests"
      ref={sectionRef}
      className="relative z-30 -mt-20 scroll-mt-20"
    >
      <div className="w-full flex flex-col md:flex-row relative overflow-hidden">

        {/* Contest 1 - Violet background */}
        {contest1 && (
          <div className={`relative w-full ${contest2 ? 'md:w-1/2' : ''} bg-primary`}>
            <div className="flex items-stretch min-h-[200px]">
              {/* Left: Prize Image - animated */}
              <div
                className="relative w-32 md:w-40 lg:w-48 flex-shrink-0 bg-white/10 self-stretch overflow-visible"
                style={{
                  willChange: 'transform, opacity',
                  transform: `translateX(${img1TranslateX}vw) scale(${imageScale})`,
                  opacity: imageOpacity,
                  transition: 'none',
                  transformOrigin: 'center center',
                  zIndex: progress < 0.8 ? 20 : 1,
                }}
              >
                {contest1.prizeImage && (
                  <img
                    src={contest1.prizeImage}
                    alt={language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content - animated */}
              <div
                className="p-6 md:p-8 lg:p-10 md:pr-16 flex flex-col justify-center"
                style={{
                  willChange: 'transform, opacity',
                  opacity: textOpacity,
                  transform: `translateX(${text1TranslateX}px)`,
                  transition: 'none',
                }}
              >
                {/* Row layout */}
                <div className="flex items-center gap-6">
                  {/* Number */}
                  <span
                    className="text-white/30 text-7xl md:text-8xl lg:text-9xl font-bold leading-none"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest1.number}
                  </span>

                  {/* Prize info */}
                  <div className="flex-1">
                    <p
                      className="text-white/80 text-xs md:text-sm tracking-[0.2em] uppercase"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.winA}
                    </p>
                    <h3
                      className="text-white text-2xl md:text-3xl lg:text-4xl uppercase leading-tight font-bold"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                    </h3>
                    <p
                      className="text-white/70 text-sm md:text-base"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.value} {contest1.prizeValue}€
                    </p>
                  </div>

                  {/* Condition */}
                  <div className="text-right hidden md:block">
                    <p
                      className="text-white text-2xl md:text-3xl font-bold"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {contest1.purchaseAmount}€ {t.purchaseSuffix}
                    </p>
                    <p
                      className="text-white/80 text-xs md:text-sm"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.oneDrawEntry}
                    </p>
                  </div>
                </div>

                {/* Condition mobile */}
                <div className="mt-3 md:hidden">
                  <p
                    className="text-white text-xl font-bold"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest1.purchaseAmount}€ {t.purchaseSuffix}
                  </p>
                  <p
                    className="text-white/80 text-xs"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {t.oneDrawEntry}
                  </p>
                </div>

                {/* Description */}
                <p className="text-white/60 text-[10px] md:text-xs mt-4">
                  {language === 'fr' ? contest1.description : (contest1.descriptionEn || contest1.description)}
                </p>

                {/* See conditions link */}
                <Link
                  href="/concours#conditions"
                  className="inline-block mt-2 text-white/50 hover:text-white text-[10px] md:text-xs transition-colors underline underline-offset-2"
                >
                  {t.concoursSeeConditionsLink}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Separator - Diagonal cut using SVG - animated */}
        {contest1 && contest2 && (
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[60px] -translate-x-1/2 z-10 pointer-events-none"
            style={{
              willChange: 'opacity',
              opacity: separatorOpacity,
              transition: 'none',
            }}
          >
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polygon points="0,0 70,0 30,100 0,100" className="fill-primary" />
              <polygon points="70,0 100,0 100,100 30,100" className={darkMode ? 'fill-[#0a0a0a]' : 'fill-white'} />
            </svg>
          </div>
        )}

        {/* Contest 2 - Theme background */}
        {contest2 && (
          <div className={`relative w-full ${contest1 ? 'md:w-1/2' : ''} ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border-t md:border-t-0 border-primary`}>
            <div className="flex items-stretch min-h-[200px]">
              {/* Left on mobile: Prize Image - animated */}
              <div
                className={`relative w-32 md:hidden flex-shrink-0 self-stretch overflow-visible ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                style={{
                  willChange: 'transform, opacity',
                  transform: `translateY(${imgMobileTranslateY}px) scale(${imageScale})`,
                  opacity: imageOpacity,
                  transition: 'none',
                  transformOrigin: 'center center',
                  zIndex: progress < 0.8 ? 20 : 1,
                }}
              >
                {contest2.prizeImage && (
                  <img
                    src={contest2.prizeImage}
                    alt={language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content - animated */}
              <div
                className="p-6 md:p-8 lg:p-10 md:pl-16 flex flex-col justify-center flex-1"
                style={{
                  willChange: 'transform, opacity',
                  opacity: textOpacity,
                  transform: `translateX(${text2TranslateX}px)`,
                  transition: 'none',
                }}
              >
                {/* Row layout */}
                <div className="flex items-center gap-6">
                  {/* Number */}
                  <span
                    className="text-primary/30 text-7xl md:text-8xl lg:text-9xl font-bold leading-none"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest2.number}
                  </span>

                  {/* Prize info */}
                  <div className="flex-1">
                    <p
                      className="text-primary text-xs md:text-sm tracking-[0.2em] uppercase"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.winAFemale}
                    </p>
                    <h3
                      className="text-foreground text-2xl md:text-3xl lg:text-4xl uppercase leading-tight font-bold"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                    </h3>
                    <p
                      className={`text-sm md:text-base ${darkMode ? 'text-white/70' : 'text-black/60'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.value} {contest2.prizeValue}€
                    </p>
                  </div>

                  {/* Condition */}
                  <div className="text-right hidden md:block">
                    <p
                      className="text-primary text-2xl md:text-3xl font-bold"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {contest2.purchaseAmount}€ {t.purchaseSuffix}
                    </p>
                    <p
                      className={`text-xs md:text-sm ${darkMode ? 'text-white/70' : 'text-black/60'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.oneDrawEntry}
                    </p>
                  </div>
                </div>

                {/* Condition mobile */}
                <div className="mt-3 md:hidden">
                  <p
                    className="text-primary text-xl font-bold"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest2.purchaseAmount}€ {t.purchaseSuffix}
                  </p>
                  <p
                    className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/60'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {t.oneDrawEntry}
                  </p>
                </div>

                {/* Description */}
                <p className={`text-[10px] md:text-xs mt-4 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {language === 'fr' ? contest2.description : (contest2.descriptionEn || contest2.description)}
                </p>

                {/* See conditions link */}
                <Link
                  href="/concours#conditions"
                  className={`inline-block mt-2 text-[10px] md:text-xs transition-colors underline underline-offset-2 ${
                    darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                  }`}
                >
                  {t.concoursSeeConditionsLink}
                </Link>
              </div>

              {/* Right on desktop: Prize Image - animated */}
              <div
                className={`relative hidden md:block w-40 lg:w-48 flex-shrink-0 self-stretch overflow-visible ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                style={{
                  willChange: 'transform, opacity',
                  transform: `translateX(${img2TranslateX}vw) scale(${imageScale})`,
                  opacity: imageOpacity,
                  transition: 'none',
                  transformOrigin: 'center center',
                  zIndex: progress < 0.8 ? 20 : 1,
                }}
              >
                {contest2.prizeImage && (
                  <img
                    src={contest2.prizeImage}
                    alt={language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
