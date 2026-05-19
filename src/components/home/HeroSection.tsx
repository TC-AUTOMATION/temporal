'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { translations } from '@/lib/translations';
import Starfield from '@/components/ui/Starfield';
import CartGauge from '@/components/ui/CartGauge';
import Link from 'next/link';

// ── Confetti canvas ────────────────────────────────────────────────
const DEFAULT_CONFETTI_COLORS = ['#44047C', '#5B2D8E', '#9333ea', '#a855f7', '#c084fc', '#ffffff', '#e9d5ff'];

// Build a palette of related shades from a single base hex color
function buildPalette(hex: string): string[] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return DEFAULT_CONFETTI_COLORS;
  const num = parseInt(m[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (c1: number, c2: number, t: number) => Math.round(c1 + (c2 - c1) * t);
  const toHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  // Mix the base color toward white & black to produce 5 tones + white
  return [
    toHex(r, g, b),
    toHex(mix(r, 255, 0.3), mix(g, 255, 0.3), mix(b, 255, 0.3)),
    toHex(mix(r, 255, 0.55), mix(g, 255, 0.55), mix(b, 255, 0.55)),
    toHex(mix(r, 0, 0.25), mix(g, 0, 0.25), mix(b, 0, 0.25)),
    toHex(mix(r, 0, 0.5), mix(g, 0, 0.5), mix(b, 0, 0.5)),
    '#ffffff',
    toHex(mix(r, 255, 0.75), mix(g, 255, 0.75), mix(b, 255, 0.75)),
  ];
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

function ConfettiCanvas({ active, baseColor }: { active: boolean; baseColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const launched = useRef(false);

  useEffect(() => {
    if (!active || launched.current) return;
    launched.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    const palette = baseColor ? buildPalette(baseColor) : DEFAULT_CONFETTI_COLORS;

    // Spawn 180 particles from random x positions at the top
    for (let i = 0; i < 180; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        shape: Math.random() > 0.6 ? 'circle' : 'rect',
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.012;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (alive) rafRef.current = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, baseColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ display: active ? 'block' : 'none' }}
    />
  );
}
// ───────────────────────────────────────────────────────────────────

const CONFETTI_STORAGE_KEY = 'temporal-contest-confetti-fired';
const CONFETTI_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export default function HeroSection() {
  const { language, darkMode } = useStore();
  const {
    siteMode: localSiteMode,
    countdownDate: localCountdownDate,
    contestResultsDate: localContestResultsDate,
    contestResultsLabel: localContestResultsLabel,
    contestResultsMessage: localContestResultsMessage,
    contestResultsColor: localContestResultsColor,
    setSiteMode, setCountdownDate, setContestResultsDate,
    setContestResultsLabel, setContestResultsMessage, setContestResultsColor,
  } = useAdminStore();
  const t = translations[language];
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [resultsPassed, setResultsPassed] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [siteMode, setSiteModeLocal] = useState(localSiteMode);
  const [countdownDate, setCountdownDateLocal] = useState(localCountdownDate);
  const [contestResultsDate, setContestResultsDateLocal] = useState(localContestResultsDate);
  const [contestResultsLabel, setContestResultsLabelLocal] = useState(localContestResultsLabel);
  const [contestResultsMessage, setContestResultsMessageLocal] = useState(localContestResultsMessage);
  const [contestResultsColor, setContestResultsColorLocal] = useState(localContestResultsColor);

  // Fetch siteMode from server (source of truth) to override localStorage
  useEffect(() => {
    fetch('/api/settings/site-mode')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSiteModeLocal(json.data.siteMode);
          setCountdownDateLocal(json.data.countdownDate);
          setContestResultsDateLocal(json.data.contestResultsDate || '');
          setContestResultsLabelLocal(json.data.contestResultsLabel || '');
          setContestResultsMessageLocal(json.data.contestResultsMessage || '');
          setContestResultsColorLocal(json.data.contestResultsColor || '');
          // Also update the store so other components see it
          if (json.data.siteMode !== localSiteMode) setSiteMode(json.data.siteMode);
          if (json.data.countdownDate !== localCountdownDate) setCountdownDate(json.data.countdownDate);
          if ((json.data.contestResultsDate || '') !== localContestResultsDate) setContestResultsDate(json.data.contestResultsDate || '');
          if ((json.data.contestResultsLabel || '') !== localContestResultsLabel) setContestResultsLabel(json.data.contestResultsLabel || '');
          if ((json.data.contestResultsMessage || '') !== localContestResultsMessage) setContestResultsMessage(json.data.contestResultsMessage || '');
          if ((json.data.contestResultsColor || '') !== localContestResultsColor) setContestResultsColor(json.data.contestResultsColor || '');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Contest results countdown - replaces the drop countdown on the hero
  useEffect(() => {
    if (!contestResultsDate) {
      setShouldShowWidget(false);
      setConfettiActive(false);
      return;
    }

    const targetDate = new Date(contestResultsDate).getTime();
    if (isNaN(targetDate)) {
      setShouldShowWidget(false);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetDate - now;
      const passedMs = -diff; // ms since deadline (negative if not reached)

      if (diff > 0) {
        // Before deadline → show countdown
        setResultsPassed(false);
        setShouldShowWidget(true);
        setConfettiActive(false);
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else if (passedMs <= CONFETTI_TTL_MS) {
        // Within 24h after deadline → show "RÉSULTATS DISPONIBLES" + confetti (once)
        setResultsPassed(true);
        setShouldShowWidget(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        // Check localStorage: fire confetti once and only within 24h window
        try {
          const stored = localStorage.getItem(CONFETTI_STORAGE_KEY);
          const storedKey = stored ? JSON.parse(stored) : null;
          // Bind to the specific deadline date so a new contest can re-fire
          if (!storedKey || storedKey.date !== contestResultsDate) {
            localStorage.setItem(
              CONFETTI_STORAGE_KEY,
              JSON.stringify({ date: contestResultsDate, firedAt: now })
            );
            setConfettiActive(true);
          } else {
            // Already fired for this contest → no more confetti
            setConfettiActive(false);
          }
        } catch {
          setConfettiActive(true);
        }
      } else {
        // 24h+ after deadline → hide widget completely
        setShouldShowWidget(false);
        setConfettiActive(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [contestResultsDate]);

  const scrollProgress = Math.min(scrollY / 300, 1);
  const logoScale = Math.max(0.16, 1 - scrollProgress);
  const contentOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Confetti when contest results drop (fired once, max 24h) */}
      <ConfettiCanvas active={confettiActive} baseColor={contestResultsColor || undefined} />

      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

      {/* Contest results countdown - stuck to left edge, upper area */}
      {shouldShowWidget && (() => {
        const accentColor = contestResultsColor || '#44047C';
        const labelText = contestResultsLabel || (language === 'fr' ? 'RÉSULTATS CONCOURS DANS' : 'CONTEST RESULTS IN');
        const messageText = contestResultsMessage || (language === 'fr' ? 'RÉSULTATS DISPONIBLES' : 'RESULTS AVAILABLE');
        return (
          <div
            className="absolute left-0 top-[30%] z-30 transition-all duration-700"
            style={{ opacity: isLoaded ? contentOpacity : 0 }}
          >
            {!resultsPassed ? (
              <div className={`backdrop-blur-sm border border-l-0 rounded-r-xl px-4 py-3 md:px-5 md:py-4 ${darkMode ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
                <p
                  className={`text-[10px] md:text-xs tracking-[0.2em] uppercase mb-1 ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {labelText}
                </p>
                <p
                  className={`text-base md:text-xl lg:text-2xl tracking-wider whitespace-nowrap ${darkMode ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  <span className="tabular-nums">{String(countdown.days).padStart(2, '0')}</span>
                  <span style={{ color: accentColor }}>j</span>
                  <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                  <span className="tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                  <span style={{ color: accentColor }}>h</span>
                  <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                  <span className="tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span style={{ color: accentColor }}>m</span>
                  <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                  <span className="tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span style={{ color: accentColor }}>s</span>
                </p>
              </div>
            ) : (
              <div
                className="backdrop-blur-sm border border-l-0 rounded-r-xl px-5 py-3 md:px-6 md:py-4"
                style={{
                  backgroundColor: `${accentColor}40`,
                  borderColor: `${accentColor}99`,
                  boxShadow: `0 0 24px ${accentColor}80`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full animate-ping absolute"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <p
                    className="text-base md:text-xl lg:text-2xl tracking-wider"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', color: accentColor }}
                  >
                    {messageText}
                  </p>
                </div>
                <Link
                  href="/concours"
                  className="block text-[10px] md:text-xs tracking-[0.2em] mt-0.5 ml-5 transition-opacity hover:opacity-100"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', color: accentColor, opacity: 0.7 }}
                >
                  {language === 'fr' ? 'VOIR LES GAGNANTS →' : 'VIEW WINNERS →'}
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Cart Gauge - right side */}
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

/*
 * ContestSection — static display, no scroll animation
 */
export function ContestSection() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);

  useEffect(() => {
    fetch('/api/contests')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.contests) setContests(json.data.contests);
      })
      .catch(() => {});
  }, []);

  const c1 = contests[0];
  const c2 = contests[1];
  if (!c1 && !c2) return null;

  const bebas: React.CSSProperties = { fontFamily: '"Bebas Neue", sans-serif' };

  const renderText = (c: ContestData, variant: 'light' | 'dark') => {
    const isLight = variant === 'light';
    return (
      <div>
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
    <div id="contests" className="relative z-30">
      {/* Title above both contests */}
      <div className={`${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'} px-4 pt-10 md:pt-14 pb-4 md:pb-6 text-center`}>
        <h2
          className={`text-4xl md:text-5xl lg:text-6xl ${darkMode ? 'text-white' : 'text-black'}`}
          style={{ ...bebas, letterSpacing: '0.04em' }}
        >
          {t.concoursActiveContests}
        </h2>
        <div className="h-1 w-16 md:w-20 bg-primary mx-auto mt-3" />
        <p
          className={`mt-4 text-xs md:text-sm tracking-[0.15em] uppercase ${darkMode ? 'text-white/50' : 'text-black/50'}`}
          style={bebas}
        >
          {language === 'fr'
            ? 'UNE SEULE PARTICIPATION PAR COMMANDE — LE PALIER LE PLUS HAUT ATTEINT'
            : 'ONE ENTRY PER ORDER — HIGHEST TIER REACHED ONLY'}
        </p>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex w-full relative" style={{ minHeight: '280px' }}>
        {c1 && (
          <div className={`relative ${c2 ? 'w-1/2' : 'w-full'}`}>
            <div className="absolute inset-0 bg-primary" />
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
          <div className="absolute left-1/2 top-0 bottom-0 w-[60px] -translate-x-1/2 z-10 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polygon points="0,0 70,0 30,100 0,100" className="fill-primary" />
              <polygon points="70,0 100,0 100,100 30,100" className={darkMode ? 'fill-[#0a0a0a]' : 'fill-white'} />
            </svg>
          </div>
        )}
        {c2 && (
          <div className={`relative ${c1 ? 'w-1/2' : 'w-full'}`}>
            <div className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`} />
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
            <div className="absolute inset-0 bg-primary" />
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
            <div className={`absolute inset-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`} />
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
  );
}
