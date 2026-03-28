'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import Starfield from '@/components/ui/Starfield';
import Link from 'next/link';
import { Trophy, ShoppingCart, Ticket, Gift, ChevronDown, ChevronUp, ArrowRight, Plus, Minus } from 'lucide-react';

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
  drawDate: string | null;
  _count: { entries: number };
}

/* ------------------------------------------------------------------ */
/*  Hook: IntersectionObserver with staggered children reveal          */
/* ------------------------------------------------------------------ */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/* ------------------------------------------------------------------ */
/*  Hook: Animated counter (counts up from 0 when visible)            */
/* ------------------------------------------------------------------ */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || target === 0) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Hook: Simple parallax offset on scroll                            */
/* ------------------------------------------------------------------ */
function useParallax(factor = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        setOffset((center - viewCenter) * factor);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [factor]);

  return { ref, offset };
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function ConcoursPage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  useEffect(() => {
    fetch('/api/contests')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.contests) {
          setContests(json.data.contests);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToConditions = useCallback(() => {
    const el = document.getElementById('conditions');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  /* ---------------------------------------------------------------- */
  /*  Conditions content (all 9 sections)                              */
  /* ---------------------------------------------------------------- */
  const conditionsSections = [
    {
      title: language === 'fr' ? '1. Eligibilité' : '1. Eligibility',
      content: language === 'fr'
        ? 'Le concours est ouvert à toute personne physique majeure (âgée de 18 ans ou plus à la date de participation), disposant d\u2019une adresse de livraison valide en France métropolitaine ou dans l\u2019Union Européenne. Les employés de Temporal et leurs familles ne peuvent pas participer.'
        : 'The contest is open to any individual aged 18 or over at the date of entry, with a valid shipping address in mainland France or the European Union. Employees of Temporal and their families are not eligible to enter.',
    },
    {
      title: language === 'fr' ? '2. Comment participer' : '2. How to Enter',
      content: language === 'fr'
        ? 'Pour participer, il suffit de passer une commande sur notre boutique en ligne (temporalclothes.com) atteignant le montant minimum requis indiqué pour chaque concours. Chaque commande éligible donne droit à une (1) participation au tirage au sort. Il n\u2019y a pas de limite au nombre de participations par personne : chaque commande éligible compte comme une participation supplémentaire.'
        : 'To enter, simply place an order on our online store (temporalclothes.com) meeting the minimum amount required for each contest. Each qualifying order earns one (1) entry into the draw. There is no limit on the number of entries per person: each qualifying order counts as an additional entry.',
    },
    {
      title: language === 'fr' ? '3. Tirage au sort' : '3. Draw',
      content: language === 'fr'
        ? 'Le gagnant sera désigné par tirage au sort aléatoire parmi l\u2019ensemble des participations valides. La date du tirage sera communiquée sur nos réseaux sociaux et sur cette page. Le tirage sera effectué de manière équitable et transparente.'
        : 'The winner will be selected by random draw from all valid entries. The draw date will be announced on our social media channels and on this page. The draw will be conducted fairly and transparently.',
    },
    {
      title: language === 'fr' ? '4. Lot' : '4. Prize',
      content: language === 'fr'
        ? 'Le lot est strictement nominatif et ne peut être ni échangé, ni remboursé, ni cédé à un tiers. Aucune contrepartie en espèces ne sera proposée. Le lot correspond exactement à celui décrit sur cette page (modèle, coloris et taille selon disponibilité).'
        : 'The prize is strictly non-transferable and cannot be exchanged, refunded, or assigned to a third party. No cash alternative will be offered. The prize corresponds exactly to the one described on this page (model, color and size subject to availability).',
    },
    {
      title: language === 'fr' ? '5. Notification du gagnant' : '5. Winner Notification',
      content: language === 'fr'
        ? 'Le gagnant sera contacté par email (adresse utilisée lors de la commande) dans les 48 heures suivant le tirage au sort. En l\u2019absence de réponse sous 7 jours, un nouveau gagnant sera tiré au sort. Le résultat sera également publié sur nos réseaux sociaux.'
        : 'The winner will be contacted by email (the address used during the order) within 48 hours of the draw. If there is no response within 7 days, a new winner will be drawn. The result will also be published on our social media channels.',
    },
    {
      title: language === 'fr' ? '6. Livraison du lot' : '6. Prize Delivery',
      content: language === 'fr'
        ? 'Le lot sera expédié gratuitement à l\u2019adresse du gagnant dans un délai de 7 jours ouvrables après confirmation de ses coordonnées. Les frais de livraison sont intégralement pris en charge par Temporal.'
        : 'The prize will be shipped free of charge to the winner\'s address within 7 business days after confirmation of their details. Shipping costs are fully covered by Temporal.',
    },
    {
      title: language === 'fr' ? '7. Données personnelles' : '7. Data Privacy',
      content: language === 'fr'
        ? 'Les données personnelles collectées dans le cadre du concours (nom, email, adresse) sont utilisées exclusivement pour la gestion du concours et la livraison du lot. Elles ne seront en aucun cas communiquées à des tiers. Conformément au RGPD, vous disposez d\u2019un droit d\u2019accès, de rectification et de suppression de vos données en contactant temporal.clothes8@gmail.com.'
        : 'Personal data collected as part of the contest (name, email, address) is used exclusively for contest management and prize delivery. It will not be shared with third parties under any circumstances. In accordance with GDPR, you have the right to access, rectify, and delete your data by contacting temporal.clothes8@gmail.com.',
    },
    {
      title: language === 'fr' ? '8. Organisateur' : '8. Organizer',
      content: language === 'fr'
        ? 'Ce concours est organisé par Temporal, marque de streetwear basée à Évreux, France. Pour toute question relative au concours, contactez-nous à temporal.clothes8@gmail.com.'
        : 'This contest is organized by Temporal, a streetwear brand based in Évreux, France. For any questions regarding the contest, contact us at temporal.clothes8@gmail.com.',
    },
    {
      title: language === 'fr' ? '9. Litiges' : '9. Disputes',
      content: language === 'fr'
        ? 'Toute contestation ou réclamation doit être adressée par écrit à Temporal dans un délai de 30 jours suivant le tirage au sort. Le présent règlement est soumis au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège de Temporal.'
        : 'Any dispute or claim must be addressed in writing to Temporal within 30 days of the draw. These rules are governed by French law. In case of dispute, the competent courts shall be those of the jurisdiction of Temporal\'s headquarters.',
    },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main>
          {/* ============================================================ */}
          {/*  HERO - Full viewport, Starfield background                  */}
          {/* ============================================================ */}
          <section className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center">
            {/* Starfield */}
            <div className="absolute inset-0 z-0">
              <Starfield />
            </div>

            {/* Gradient to page bg */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-[1]" />

            {/* Glow behind title */}
            <div
              className="absolute z-[2] w-[600px] h-[600px] rounded-full blur-[160px] opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(91,45,142,0.6) 0%, transparent 70%)' }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-4">
              {/* Trophy icon */}
              <div
                className={`flex justify-center mb-8 transition-all duration-1000 delay-200 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/30 shadow-[0_0_60px_rgba(91,45,142,0.3)]">
                  <Trophy size={36} className="text-primary md:w-11 md:h-11" />
                </div>
              </div>

              {/* Title */}
              <h1
                className={`text-7xl md:text-8xl lg:text-9xl leading-none transition-all duration-1000 delay-400 ${
                  heroLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  letterSpacing: '0.06em',
                  textShadow: '0 0 80px rgba(91,45,142,0.5), 0 0 160px rgba(91,45,142,0.2)',
                }}
              >
                {t.concoursTitle}
              </h1>

              {/* Subtitle */}
              <div
                className={`mt-6 flex items-center justify-center gap-4 transition-all duration-1000 delay-600 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-primary" />
                <p
                  className="text-primary text-base md:text-lg tracking-[0.25em] uppercase"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.concoursSubtitle}
                </p>
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-primary" />
              </div>
            </div>

            {/* Scroll indicator */}
            <div
              className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-center transition-all duration-1000 delay-1000 ${
                heroLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p
                className={`text-sm tracking-[0.3em] uppercase mb-2 ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {language === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER'}
              </p>
              <ChevronDown size={28} className="text-primary mx-auto animate-bounce" strokeWidth={2.5} />
            </div>
          </section>

          {/* ============================================================ */}
          {/*  CONTEST SHOWCASE - Full-bleed immersive sections             */}
          {/* ============================================================ */}
          <section className={`relative ${darkMode ? 'bg-black' : 'bg-white'}`}>
            {/* Section header */}
            <SectionHeader>
              <div className="flex items-center justify-center gap-4 py-20 md:py-28">
                <div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-transparent to-primary" />
                <p
                  className="text-primary text-sm md:text-base tracking-[0.3em] uppercase"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.concoursActiveContests}
                </p>
                <div className="h-[1px] w-16 md:w-24 bg-gradient-to-l from-transparent to-primary" />
              </div>
            </SectionHeader>

            {/* Contest entries */}
            {contests.map((contest, index) => (
              <ContestShowcase
                key={contest.id}
                contest={contest}
                index={index}
                language={language}
                darkMode={darkMode}
                t={t}
                onSeeConditions={scrollToConditions}
              />
            ))}

            {/* Empty state */}
            {contests.length === 0 && (
              <EmptyState darkMode={darkMode} t={t} />
            )}
          </section>

          {/* ============================================================ */}
          {/*  HOW IT WORKS - Horizontal timeline                          */}
          {/* ============================================================ */}
          <HowItWorks darkMode={darkMode} t={t} />

          {/* ============================================================ */}
          {/*  CONDITIONS - Modern accordion                                */}
          {/* ============================================================ */}
          <section
            id="conditions"
            className={`relative py-20 md:py-32 scroll-mt-20 ${darkMode ? 'bg-black' : 'bg-white'}`}
          >
            <div className="max-w-4xl mx-auto px-4">
              <SectionHeader>
                <div className="text-center mb-16 md:mb-20">
                  <h2
                    className="text-5xl md:text-6xl lg:text-7xl"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
                  >
                    {t.concoursConditionsTitle}
                  </h2>
                  <p className={`mt-4 text-sm md:text-base ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    {t.concoursConditionsSubtitle}
                  </p>
                </div>
              </SectionHeader>

              {/* Accordion */}
              <div className="space-y-2">
                {conditionsSections.map((section, index) => (
                  <AccordionItem
                    key={index}
                    index={index}
                    title={section.title}
                    content={section.content}
                    isOpen={openSection === index}
                    onToggle={() => toggleSection(index)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/*  BOTTOM CTA - Dramatic full-width                            */}
          {/* ============================================================ */}
          <BottomCTA darkMode={darkMode} t={t} />
        </main>

        <Footer />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SectionHeader - Reveal wrapper                                     */
/* ================================================================== */
function SectionHeader({ children }: { children: React.ReactNode }) {
  const { ref, isVisible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  ContestShowcase - Full-bleed alternating layout                    */
/* ================================================================== */
function ContestShowcase({
  contest,
  index,
  language,
  darkMode,
  t,
  onSeeConditions,
}: {
  contest: ContestData;
  index: number;
  language: string;
  darkMode: boolean;
  t: any;
  onSeeConditions: () => void;
}) {
  const { ref, isVisible } = useReveal(0.1);
  const { ref: parallaxRef, offset } = useParallax(0.12);
  const { count, ref: counterRef } = useCounter(contest._count.entries);
  const isEven = index % 2 === 0;
  const numberStr = String(contest.number).padStart(2, '0');

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${darkMode ? 'border-b border-white/[0.04]' : 'border-b border-black/[0.04]'}`}
    >
      {/* Giant number watermark */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 ${
          isEven ? 'right-[5%]' : 'left-[5%]'
        }`}
        style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(200px, 30vw, 500px)',
          lineHeight: 1,
          opacity: darkMode ? 0.03 : 0.04,
        }}
      >
        {numberStr}
      </div>

      <div
        className={`relative z-10 max-w-[1600px] mx-auto flex flex-col ${
          isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
        } items-center min-h-[500px] md:min-h-[600px]`}
      >
        {/* Image side */}
        <div
          ref={parallaxRef}
          className={`relative w-full lg:w-[45%] flex-shrink-0 aspect-square lg:aspect-auto lg:self-stretch overflow-hidden ${
            darkMode ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
          }`}
        >
          {contest.prizeImage ? (
            <div
              className={`absolute inset-0 transition-all duration-[1.2s] ease-out ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{ transform: isVisible ? `translateY(${offset}px) scale(1)` : undefined }}
            >
              <img
                src={contest.prizeImage}
                alt={language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay on image */}
              <div
                className={`absolute inset-0 ${
                  isEven
                    ? `bg-gradient-to-r ${darkMode ? 'from-transparent to-black/40' : 'from-transparent to-white/40'}`
                    : `bg-gradient-to-l ${darkMode ? 'from-transparent to-black/40' : 'from-transparent to-white/40'}`
                }`}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy size={120} className="text-primary/10" />
            </div>
          )}
        </div>

        {/* Content side */}
        <div className={`flex-1 px-6 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16 lg:py-20 flex flex-col justify-center ${
          isEven ? 'lg:pl-16 xl:pl-24' : 'lg:pr-16 xl:pr-24'
        }`}>
          {/* Win label */}
          <p
            className={`text-primary text-xs tracking-[0.4em] uppercase mb-3 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {t.concoursWinLabel}
          </p>

          {/* Prize name - massive */}
          <h2
            className={`text-5xl md:text-6xl lg:text-7xl leading-[0.9] transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
          >
            {language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
          </h2>

          {/* Prize value */}
          <div
            className={`flex items-center gap-3 mt-4 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span
              className={`text-xl md:text-2xl ${darkMode ? 'text-white/50' : 'text-black/50'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {t.value} {contest.prizeValue}&euro;
            </span>
          </div>

          {/* Purchase requirement pill */}
          <div
            className={`mt-8 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full">
              <ShoppingCart size={18} />
              <span
                className="text-lg md:text-xl font-bold"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {contest.purchaseAmount}&euro; {t.purchaseSuffix}
              </span>
              <span className="text-white/70 text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                = {t.oneDrawEntry}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className={`mt-6 text-sm md:text-base leading-relaxed max-w-lg transition-all duration-700 delay-[600ms] ${
              darkMode ? 'text-white/50' : 'text-black/50'
            } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {language === 'fr' ? contest.description : (contest.descriptionEn || contest.description)}
          </p>

          {/* Entry count - animated counter */}
          <div
            className={`mt-6 flex items-center gap-3 transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-primary" />
              <span
                ref={counterRef}
                className="text-3xl md:text-4xl text-primary"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {count}
              </span>
            </div>
            <span
              className={`text-sm tracking-[0.1em] uppercase ${darkMode ? 'text-white/40' : 'text-black/40'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t.concoursParticipations}
            </span>
          </div>

          {/* CTA button */}
          <div
            className={`mt-10 transition-all duration-700 delay-[800ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={onSeeConditions}
              className={`group relative inline-flex items-center gap-3 px-8 py-4 border-2 text-sm tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 ${
                darkMode
                  ? 'border-white/20 text-white hover:text-white hover:border-primary'
                  : 'border-black/20 text-black hover:text-white hover:border-primary'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {/* Hover fill */}
              <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="relative z-10">{t.concoursSeeConditions}</span>
              <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  EmptyState                                                         */
/* ================================================================== */
function EmptyState({ darkMode, t }: { darkMode: boolean; t: any }) {
  const { ref, isVisible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`text-center py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Trophy size={48} className="text-primary/40" />
      </div>
      <p
        className="text-3xl md:text-4xl mb-3"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        {t.concoursNoActive}
      </p>
      <p className={`max-w-md mx-auto ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
        {t.concoursCheckBack}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  HowItWorks - Horizontal timeline                                   */
/* ================================================================== */
function HowItWorks({ darkMode, t }: { darkMode: boolean; t: any }) {
  const { ref, isVisible } = useReveal(0.1);

  const steps = [
    { label: t.concoursStep1Label, title: t.concoursStep1Title, desc: t.concoursStep1Desc, icon: ShoppingCart, num: '01' },
    { label: t.concoursStep2Label, title: t.concoursStep2Title, desc: t.concoursStep2Desc, icon: Ticket, num: '02' },
    { label: t.concoursStep3Label, title: t.concoursStep3Title, desc: t.concoursStep3Desc, icon: Gift, num: '03' },
  ];

  return (
    <section
      className={`relative py-24 md:py-36 overflow-hidden ${darkMode ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: darkMode
            ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div ref={ref} className="relative max-w-6xl mx-auto px-4">
        {/* Title */}
        <div
          className={`text-center mb-20 md:mb-28 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2
            className="text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
          >
            {t.concoursHowItWorks}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {/* Connecting line (desktop) */}
          <div
            className={`hidden md:block absolute top-[60px] left-[16.66%] right-[16.66%] h-[2px] transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{
              background: `linear-gradient(90deg, transparent, ${darkMode ? 'rgba(91,45,142,0.4)' : 'rgba(91,45,142,0.3)'}, transparent)`,
            }}
          />

          {/* Connecting line (mobile) */}
          <div
            className={`md:hidden absolute left-[60px] top-[120px] bottom-[120px] w-[2px] transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            }`}
            style={{
              background: `linear-gradient(180deg, transparent, ${darkMode ? 'rgba(91,45,142,0.4)' : 'rgba(91,45,142,0.3)'}, transparent)`,
            }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const delay = 300 + i * 200;
            return (
              <div
                key={i}
                className={`relative text-center md:text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${delay}ms` }}
              >
                {/* Circle with number */}
                <div className="flex justify-center md:justify-center mb-6">
                  <div className={`relative w-[120px] h-[120px] rounded-full border-2 border-primary/30 flex items-center justify-center ${
                    darkMode ? 'bg-black' : 'bg-white'
                  }`}>
                    {/* Inner glow */}
                    <div className="absolute inset-2 rounded-full bg-primary/5" />
                    <Icon size={36} className="text-primary relative z-10" />
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <span
                        className="text-white text-sm font-bold"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {step.num}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Label */}
                <p
                  className="text-primary text-xs tracking-[0.3em] uppercase mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {step.label}
                </p>

                {/* Title */}
                <h3
                  className="text-3xl md:text-4xl mb-3"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className={`text-sm md:text-base max-w-xs mx-auto ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  AccordionItem - Modern with number badge + left border highlight   */
/* ================================================================== */
function AccordionItem({
  index,
  title,
  content,
  isOpen,
  onToggle,
  darkMode,
}: {
  index: number;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  darkMode: boolean;
}) {
  const { ref, isVisible } = useReveal(0.05);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, content]);

  const numberStr = String(index + 1).padStart(2, '0');
  const delay = 100 + index * 60;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
          isOpen
            ? 'border-l-2 border-l-primary ' + (darkMode ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-black/[0.02] border border-black/[0.06]')
            : darkMode
              ? 'border border-white/[0.06] hover:border-white/[0.1]'
              : 'border border-black/[0.06] hover:border-black/[0.1]'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 px-5 md:px-6 py-5 md:py-6 text-left group transition-colors"
        >
          {/* Number badge */}
          <span
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
              isOpen
                ? 'bg-primary text-white'
                : darkMode
                  ? 'bg-white/[0.05] text-white/40 group-hover:bg-primary/10 group-hover:text-primary'
                  : 'bg-black/[0.04] text-black/30 group-hover:bg-primary/10 group-hover:text-primary'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {numberStr}
          </span>

          {/* Title */}
          <span
            className={`flex-1 text-base md:text-lg transition-colors ${
              isOpen ? 'text-primary' : ''
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {title}
          </span>

          {/* Toggle icon */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? 'bg-primary/10 text-primary rotate-0'
                : darkMode
                  ? 'bg-white/[0.05] text-white/30'
                  : 'bg-black/[0.04] text-black/30'
            }`}
          >
            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
          </div>
        </button>

        {/* Content with proper height animation */}
        <div
          className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ height: isOpen ? `${height}px` : '0px' }}
        >
          <div
            ref={contentRef}
            className={`px-5 md:px-6 pb-6 pl-[4.25rem] md:pl-[4.75rem] text-sm md:text-base leading-relaxed ${
              darkMode ? 'text-white/50' : 'text-black/50'
            }`}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  BottomCTA - Dramatic full-width                                    */
/* ================================================================== */
function BottomCTA({ darkMode, t }: { darkMode: boolean; t: any }) {
  const { ref, isVisible } = useReveal(0.1);

  return (
    <section className="relative overflow-hidden py-24 md:py-36" ref={ref}>
      {/* Diagonal gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #5B2D8E 0%, #7B3FBE 30%, #4A1D7A 60%, #2D0E4F 100%)',
        }}
      />

      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blurred circle top-right */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)' }}
        />
        {/* Medium circle bottom-left */}
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)' }}
        />
        {/* Small accent circle */}
        <div
          className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full opacity-10 blur-[60px]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)' }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h2
          className={`text-5xl md:text-6xl lg:text-7xl text-white mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
        >
          {t.concoursCtaTitle}
        </h2>

        <p
          className={`text-white/50 text-base md:text-lg max-w-xl mx-auto mb-10 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {t.concoursCtaSubtitle}
        </p>

        <div
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary text-lg tracking-[0.12em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {t.concoursCtaButton}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
