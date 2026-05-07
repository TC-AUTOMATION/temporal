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
const CONFETTI_COLORS = ['#44047C', '#5B2D8E', '#9333ea', '#a855f7', '#c084fc', '#ffffff', '#e9d5ff'];

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

function ConfettiCanvas({ active }: { active: boolean }) {
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

    // Spawn 180 particles from random x positions at the top
    for (let i = 0; i < 180; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
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
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ display: active ? 'block' : 'none' }}
    />
  );
}
// ───────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const { language, darkMode } = useStore();
  const { siteMode: localSiteMode, countdownDate: localCountdownDate, setSiteMode, setCountdownDate } = useAdminStore();
  const t = translations[language];
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dropPassed, setDropPassed] = useState(false);
  const [siteMode, setSiteModeLocal] = useState(localSiteMode);
  const [countdownDate, setCountdownDateLocal] = useState(localCountdownDate);

  // Fetch siteMode from server (source of truth) to override localStorage
  useEffect(() => {
    fetch('/api/settings/site-mode')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSiteModeLocal(json.data.siteMode);
          setCountdownDateLocal(json.data.countdownDate);
          // Also update the store so other components see it
          if (json.data.siteMode !== localSiteMode) setSiteMode(json.data.siteMode);
          if (json.data.countdownDate !== localCountdownDate) setCountdownDate(json.data.countdownDate);
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

  // Countdown timer for countdown mode
  useEffect(() => {
    if (siteMode !== 'countdown') return;

    const updateCountdown = () => {
      const targetDate = new Date(countdownDate).getTime();
      const now = Date.now();
      const diff = targetDate - now;

      if (diff > 0) {
        setDropPassed(false);
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setDropPassed(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [siteMode, countdownDate]);

  const scrollProgress = Math.min(scrollY / 300, 1);
  const logoScale = Math.max(0.16, 1 - scrollProgress);
  const contentOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Confetti on drop */}
      <ConfettiCanvas active={dropPassed} />

      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

      {/* Countdown timer - stuck to left edge, upper area */}
      {siteMode === 'countdown' && (
        <div
          className="absolute left-0 top-[30%] z-30 transition-all duration-700"
          style={{ opacity: isLoaded ? contentOpacity : 0 }}
        >
          {!dropPassed ? (
            <div className={`backdrop-blur-sm border border-l-0 rounded-r-xl px-4 py-3 md:px-5 md:py-4 ${darkMode ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
              <p
                className={`text-base md:text-xl lg:text-2xl tracking-wider whitespace-nowrap ${darkMode ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                <span className="tabular-nums">{String(countdown.days).padStart(2, '0')}</span>
                <span className="text-primary">j</span>
                <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                <span className="tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-primary">h</span>
                <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                <span className="tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-primary">m</span>
                <span className={`mx-0.5 md:mx-1 ${darkMode ? 'text-white/40' : 'text-black/30'}`}>-</span>
                <span className="tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="text-primary">s</span>
              </p>
            </div>
          ) : (
            <div className="bg-primary/25 backdrop-blur-sm border border-primary/60 border-l-0 rounded-r-xl px-5 py-3 md:px-6 md:py-4 shadow-[0_0_24px_rgba(68,4,124,0.5)]">
              <div className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <p
                  className="text-primary text-base md:text-xl lg:text-2xl tracking-wider"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  DROP DISPONIBLE
                </p>
              </div>
              <p
                className="text-primary/70 text-[10px] md:text-xs tracking-[0.2em] mt-0.5 ml-5"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                COMMANDE MAINTENANT
              </p>
            </div>
          )}
        </div>
      )}

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
