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

// --- Utility functions ---

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Luxury easeOutExpo: aggressive deceleration
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Contest Section - Cinematic reveal with scroll-driven split animation
export function ContestSection() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const [, forceRender] = useState(0);

  // Fetch contest data
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

  // Scroll-driven animation using rAF for buttery smooth updates
  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // Animation window: from when top of section enters bottom of viewport
    // to when top of section reaches 30% from top of viewport
    const startY = vh;
    const endY = vh * 0.3;
    const raw = 1 - (rect.top - endY) / (startY - endY);
    const clamped = clamp(raw, 0, 1);

    if (Math.abs(clamped - progressRef.current) > 0.001) {
      progressRef.current = clamped;
      forceRender((n) => n + 1);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  // IntersectionObserver to toggle scroll listener
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            window.addEventListener('scroll', onScroll, { passive: true });
            updateProgress();
          } else {
            window.removeEventListener('scroll', onScroll);
          }
        });
      },
      { rootMargin: '300px 0px 300px 0px', threshold: 0 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [contests, onScroll, updateProgress]);

  const contest1 = contests[0];
  const contest2 = contests[1];

  // Don't render if no active contests
  if (!contest1 && !contest2) return null;

  const progress = progressRef.current;
  const ep = easeOutExpo(progress);

  // --- DESKTOP animation values ---
  // Images: at progress=0 both cards are centered (translated toward center),
  // at progress=1 they are at their natural DOM positions (translateX=0).
  // We compute the offset in pixels. On a 1440px screen, each half is 720px.
  // The image column is ~192px wide. To center it, we need to shift it
  // roughly half the container width minus half the image width.
  // Using calc-friendly percentages relative to their containing half:
  // Contest1 image (left half, left edge) needs to move RIGHT to center: ~110% of its width
  // Contest2 image (right half, right edge) needs to move LEFT to center: ~110% of its width
  // We use a fixed pixel value that works well across common breakpoints.

  // Image cards: start centered with scale and rotation, end at natural position
  const imgScale = lerp(1.35, 1, ep);
  const img1Rotation = lerp(-4, 0, ep);
  const img2Rotation = lerp(4, 0, ep);

  // Glow intensity behind the hero card showcase (fades out)
  const glowOpacity = lerp(0.7, 0, ep);
  const glowScale = lerp(1.2, 0.8, ep);

  // Text appears in the second half of the animation, staggered
  const textProgress1 = clamp((progress - 0.35) / 0.5, 0, 1);
  const textProgress2 = clamp((progress - 0.45) / 0.5, 0, 1);
  const textEp1 = easeOutExpo(textProgress1);
  const textEp2 = easeOutExpo(textProgress2);

  const text1Opacity = textProgress1;
  const text1TranslateY = lerp(30, 0, textEp1);

  const text2Opacity = textProgress2;
  const text2TranslateY = lerp(30, 0, textEp2);

  // Separator fades in late
  const separatorOpacity = clamp((progress - 0.55) / 0.35, 0, 1);

  // Number reveal: slightly earlier than other text
  const numberProgress1 = clamp((progress - 0.25) / 0.45, 0, 1);
  const numberProgress2 = clamp((progress - 0.35) / 0.45, 0, 1);
  const numEp1 = easeOutExpo(numberProgress1);
  const numEp2 = easeOutExpo(numberProgress2);
  const num1Opacity = numberProgress1;
  const num1Scale = lerp(0.6, 1, numEp1);
  const num2Opacity = numberProgress2;
  const num2Scale = lerp(0.6, 1, numEp2);

  // Safe window width for SSR (fallback to 1440)
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1440;

  // Helper for the font
  const bebas: React.CSSProperties = { fontFamily: '"Bebas Neue", sans-serif' };

  return (
    <section
      id="contests"
      ref={sectionRef}
      className="relative z-30 -mt-20 scroll-mt-20"
    >
      {/* ---- DESKTOP LAYOUT ---- */}
      <div className="hidden md:block relative w-full overflow-hidden">
        <div className="flex w-full relative" style={{ minHeight: '260px' }}>

          {/* ---- Contest 1: primary/violet background ---- */}
          {contest1 && (
            <div className={`relative ${contest2 ? 'w-1/2' : 'w-full'} bg-primary`}>
              <div className="flex items-stretch min-h-[260px]">

                {/* Image column */}
                <div className="relative w-40 lg:w-48 flex-shrink-0 self-stretch overflow-hidden bg-white/10">
                  {/* Glow behind image - cinematic showcase effect */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(139,92,246,0.5) 0%, transparent 70%)',
                      opacity: glowOpacity,
                      transform: `scale(${glowScale})`,
                      willChange: 'opacity, transform',
                    }}
                  />
                  {contest1.prizeImage && (
                    <img
                      src={contest1.prizeImage}
                      alt={language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                      className="absolute inset-0 w-full h-full object-cover z-[1]"
                      style={{
                        willChange: 'transform',
                        transform: `translateX(${lerp(Math.min(ww * 0.22, 320), 0, ep)}px) scale(${imgScale}) rotate(${img1Rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                    />
                  )}
                </div>

                {/* Text content */}
                <div
                  className="p-8 lg:p-10 pr-16 flex flex-col justify-center flex-1"
                  style={{
                    willChange: 'transform, opacity',
                    opacity: text1Opacity,
                    transform: `translateY(${text1TranslateY}px)`,
                  }}
                >
                  <div className="flex items-center gap-6">
                    {/* Number */}
                    <span
                      className="text-white/30 text-8xl lg:text-9xl font-bold leading-none"
                      style={{
                        ...bebas,
                        willChange: 'transform, opacity',
                        opacity: num1Opacity,
                        transform: `scale(${num1Scale})`,
                      }}
                    >
                      {contest1.number}
                    </span>

                    {/* Prize info */}
                    <div className="flex-1">
                      <p className="text-white/80 text-sm tracking-[0.2em] uppercase" style={bebas}>
                        {t.winA}
                      </p>
                      <h3 className="text-white text-3xl lg:text-4xl uppercase leading-tight font-bold" style={bebas}>
                        {language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                      </h3>
                      <p className="text-white/70 text-base" style={bebas}>
                        {t.value} {contest1.prizeValue}€
                      </p>
                    </div>

                    {/* Condition */}
                    <div className="text-right">
                      <p className="text-white text-3xl font-bold" style={bebas}>
                        {contest1.purchaseAmount}€ {t.purchaseSuffix}
                      </p>
                      <p className="text-white/80 text-sm" style={bebas}>
                        {t.oneDrawEntry}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-xs mt-4">
                    {language === 'fr' ? contest1.description : (contest1.descriptionEn || contest1.description)}
                  </p>

                  {/* See conditions link */}
                  <Link
                    href="/concours#conditions"
                    className="inline-block mt-2 text-white/50 hover:text-white text-xs transition-colors underline underline-offset-2"
                  >
                    {t.concoursSeeConditionsLink}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ---- Diagonal SVG Separator ---- */}
          {contest1 && contest2 && (
            <div
              className="absolute left-1/2 top-0 bottom-0 w-[60px] -translate-x-1/2 z-10 pointer-events-none"
              style={{
                willChange: 'opacity',
                opacity: separatorOpacity,
              }}
            >
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points="0,0 70,0 30,100 0,100" className="fill-primary" />
                <polygon points="70,0 100,0 100,100 30,100" className={darkMode ? 'fill-[#0a0a0a]' : 'fill-white'} />
              </svg>
            </div>
          )}

          {/* ---- Contest 2: dark/white background ---- */}
          {contest2 && (
            <div className={`relative ${contest1 ? 'w-1/2' : 'w-full'} ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
              <div className="flex items-stretch min-h-[260px]">

                {/* Text content */}
                <div
                  className="p-8 lg:p-10 pl-16 flex flex-col justify-center flex-1"
                  style={{
                    willChange: 'transform, opacity',
                    opacity: text2Opacity,
                    transform: `translateY(${text2TranslateY}px)`,
                  }}
                >
                  <div className="flex items-center gap-6">
                    {/* Number */}
                    <span
                      className="text-primary/30 text-8xl lg:text-9xl font-bold leading-none"
                      style={{
                        ...bebas,
                        willChange: 'transform, opacity',
                        opacity: num2Opacity,
                        transform: `scale(${num2Scale})`,
                      }}
                    >
                      {contest2.number}
                    </span>

                    {/* Prize info */}
                    <div className="flex-1">
                      <p className="text-primary text-sm tracking-[0.2em] uppercase" style={bebas}>
                        {t.winAFemale}
                      </p>
                      <h3 className="text-foreground text-3xl lg:text-4xl uppercase leading-tight font-bold" style={bebas}>
                        {language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                      </h3>
                      <p className={`text-base ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                        {t.value} {contest2.prizeValue}€
                      </p>
                    </div>

                    {/* Condition */}
                    <div className="text-right">
                      <p className="text-primary text-3xl font-bold" style={bebas}>
                        {contest2.purchaseAmount}€ {t.purchaseSuffix}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                        {t.oneDrawEntry}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs mt-4 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {language === 'fr' ? contest2.description : (contest2.descriptionEn || contest2.description)}
                  </p>

                  {/* See conditions link */}
                  <Link
                    href="/concours#conditions"
                    className={`inline-block mt-2 text-xs transition-colors underline underline-offset-2 ${
                      darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                    }`}
                  >
                    {t.concoursSeeConditionsLink}
                  </Link>
                </div>

                {/* Image column */}
                <div className={`relative w-40 lg:w-48 flex-shrink-0 self-stretch overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  {/* Glow behind image */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(139,92,246,0.4) 0%, transparent 70%)',
                      opacity: glowOpacity,
                      transform: `scale(${glowScale})`,
                      willChange: 'opacity, transform',
                    }}
                  />
                  {contest2.prizeImage && (
                    <img
                      src={contest2.prizeImage}
                      alt={language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                      className="absolute inset-0 w-full h-full object-cover z-[1]"
                      style={{
                        willChange: 'transform',
                        transform: `translateX(${lerp(-Math.min(ww * 0.22, 320), 0, ep)}px) scale(${imgScale}) rotate(${img2Rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---- Hero card showcase overlay (visible when progress < 1) ---- */}
        {/* These are the large centered "playing cards" visible before the split */}
        {progress < 0.95 && contest1 && contest2 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ opacity: lerp(1, 0, clamp((progress - 0.15) / 0.55, 0, 1)) }}
          >
            {/* Ambient glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '500px',
                height: '400px',
                background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
                filter: 'blur(40px)',
                opacity: lerp(1, 0, clamp(progress / 0.5, 0, 1)),
                transform: `scale(${lerp(1, 0.5, ep)})`,
              }}
            />

            {/* Card 1 */}
            {contest1.prizeImage && (
              <div
                className="absolute rounded-xl overflow-hidden shadow-2xl"
                style={{
                  width: '220px',
                  height: '300px',
                  transform: `translateX(${lerp(-60, -200, ep)}px) rotate(${lerp(-3, -12, ep)}deg) scale(${lerp(1, 0.6, ep)})`,
                  opacity: lerp(1, 0, clamp((progress - 0.1) / 0.5, 0, 1)),
                  boxShadow: `0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,${lerp(0.3, 0, ep)})`,
                }}
              >
                <img
                  src={contest1.prizeImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Card 2 */}
            {contest2.prizeImage && (
              <div
                className="absolute rounded-xl overflow-hidden shadow-2xl"
                style={{
                  width: '220px',
                  height: '300px',
                  transform: `translateX(${lerp(60, 200, ep)}px) rotate(${lerp(3, 12, ep)}deg) scale(${lerp(1, 0.6, ep)})`,
                  opacity: lerp(1, 0, clamp((progress - 0.1) / 0.5, 0, 1)),
                  boxShadow: `0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,${lerp(0.3, 0, ep)})`,
                }}
              >
                <img
                  src={contest2.prizeImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- MOBILE LAYOUT ---- */}
      <div className="block md:hidden relative w-full overflow-hidden">

        {/* Mobile hero card showcase overlay */}
        {progress < 0.95 && contest1 && contest2 && (
          <div
            className="absolute inset-x-0 top-0 z-20 pointer-events-none flex items-center justify-center"
            style={{
              height: '280px',
              opacity: lerp(1, 0, clamp((progress - 0.15) / 0.5, 0, 1)),
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '300px',
                height: '250px',
                background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
                filter: 'blur(30px)',
                opacity: lerp(1, 0, clamp(progress / 0.5, 0, 1)),
                transform: `scale(${lerp(1, 0.5, ep)})`,
              }}
            />

            {/* Card 1 */}
            {contest1.prizeImage && (
              <div
                className="absolute rounded-lg overflow-hidden shadow-2xl"
                style={{
                  width: '140px',
                  height: '190px',
                  transform: `translateX(${lerp(-35, -100, ep)}px) rotate(${lerp(-3, -10, ep)}deg) scale(${lerp(1, 0.5, ep)})`,
                  opacity: lerp(1, 0, clamp((progress - 0.1) / 0.45, 0, 1)),
                  boxShadow: `0 15px 40px rgba(0,0,0,0.4), 0 0 25px rgba(139,92,246,${lerp(0.3, 0, ep)})`,
                }}
              >
                <img src={contest1.prizeImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Card 2 */}
            {contest2.prizeImage && (
              <div
                className="absolute rounded-lg overflow-hidden shadow-2xl"
                style={{
                  width: '140px',
                  height: '190px',
                  transform: `translateX(${lerp(35, 100, ep)}px) rotate(${lerp(3, 10, ep)}deg) scale(${lerp(1, 0.5, ep)})`,
                  opacity: lerp(1, 0, clamp((progress - 0.1) / 0.45, 0, 1)),
                  boxShadow: `0 15px 40px rgba(0,0,0,0.4), 0 0 25px rgba(139,92,246,${lerp(0.3, 0, ep)})`,
                }}
              >
                <img src={contest2.prizeImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Contest 1 - Mobile */}
        {contest1 && (
          <div className="relative bg-primary">
            <div className="flex items-stretch min-h-[180px]">
              {/* Image */}
              <div className="relative w-28 flex-shrink-0 self-stretch overflow-hidden bg-white/10">
                {contest1.prizeImage && (
                  <img
                    src={contest1.prizeImage}
                    alt={language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      willChange: 'transform, opacity',
                      transform: `translateY(${lerp(40, 0, ep)}px) scale(${lerp(1.15, 1, ep)})`,
                      opacity: clamp(progress * 3, 0, 1),
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className="p-5 flex flex-col justify-center flex-1"
                style={{
                  willChange: 'transform, opacity',
                  opacity: text1Opacity,
                  transform: `translateY(${text1TranslateY}px)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="text-white/30 text-6xl font-bold leading-none"
                    style={{
                      ...bebas,
                      opacity: num1Opacity,
                      transform: `scale(${num1Scale})`,
                    }}
                  >
                    {contest1.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs tracking-[0.2em] uppercase" style={bebas}>{t.winA}</p>
                    <h3 className="text-white text-xl uppercase leading-tight font-bold" style={bebas}>
                      {language === 'fr' ? contest1.prizeName : (contest1.prizeNameEn || contest1.prizeName)}
                    </h3>
                    <p className="text-white/70 text-sm" style={bebas}>{t.value} {contest1.prizeValue}€</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-white text-lg font-bold" style={bebas}>
                    {contest1.purchaseAmount}€ {t.purchaseSuffix}
                  </p>
                  <p className="text-white/80 text-xs" style={bebas}>{t.oneDrawEntry}</p>
                </div>
                <p className="text-white/60 text-[10px] mt-3">
                  {language === 'fr' ? contest1.description : (contest1.descriptionEn || contest1.description)}
                </p>
                <Link
                  href="/concours#conditions"
                  className="inline-block mt-1.5 text-white/50 hover:text-white text-[10px] transition-colors underline underline-offset-2"
                >
                  {t.concoursSeeConditionsLink}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Contest 2 - Mobile */}
        {contest2 && (
          <div className={`relative ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border-t border-primary`}>
            <div className="flex items-stretch min-h-[180px]">
              {/* Image */}
              <div className={`relative w-28 flex-shrink-0 self-stretch overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                {contest2.prizeImage && (
                  <img
                    src={contest2.prizeImage}
                    alt={language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      willChange: 'transform, opacity',
                      transform: `translateY(${lerp(40, 0, ep)}px) scale(${lerp(1.15, 1, ep)})`,
                      opacity: clamp(progress * 3, 0, 1),
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className="p-5 flex flex-col justify-center flex-1"
                style={{
                  willChange: 'transform, opacity',
                  opacity: text2Opacity,
                  transform: `translateY(${text2TranslateY}px)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="text-primary/30 text-6xl font-bold leading-none"
                    style={{
                      ...bebas,
                      opacity: num2Opacity,
                      transform: `scale(${num2Scale})`,
                    }}
                  >
                    {contest2.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-primary text-xs tracking-[0.2em] uppercase" style={bebas}>{t.winAFemale}</p>
                    <h3 className="text-foreground text-xl uppercase leading-tight font-bold" style={bebas}>
                      {language === 'fr' ? contest2.prizeName : (contest2.prizeNameEn || contest2.prizeName)}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                      {t.value} {contest2.prizeValue}€
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-primary text-lg font-bold" style={bebas}>
                    {contest2.purchaseAmount}€ {t.purchaseSuffix}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/60'}`} style={bebas}>
                    {t.oneDrawEntry}
                  </p>
                </div>
                <p className={`text-[10px] mt-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {language === 'fr' ? contest2.description : (contest2.descriptionEn || contest2.description)}
                </p>
                <Link
                  href="/concours#conditions"
                  className={`inline-block mt-1.5 text-[10px] transition-colors underline underline-offset-2 ${
                    darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                  }`}
                >
                  {t.concoursSeeConditionsLink}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
