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
import Link from 'next/link';
import { Trophy, ShoppingCart, Ticket, Gift, ArrowRight, Plus, Minus } from 'lucide-react';

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { count, ref };
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function ConcoursPage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [focusedContestId, setFocusedContestId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Lecture du paramètre ?focus=<contestId> pour déclencher l'animation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const focus = params.get('focus');
    if (!focus) return;
    setFocusedContestId(focus);
    // Scroll doux vers la carte ciblée après un court délai (laisser le temps au rendu)
    const timer = setTimeout(() => {
      const el = document.getElementById(`contest-${focus}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    // Retirer la mise en avant après 4s
    const clear = setTimeout(() => setFocusedContestId(null), 4500);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
  }, [contests]);

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
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="relative">
          {/* ============================================================ */}
          {/*  HERO - Clean editorial style with gradient blobs            */}
          {/* ============================================================ */}
          <div className={`relative overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
            {/* Floating gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] blur-3xl opacity-30 transition-transform duration-700"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, rgba(91, 45, 142, 0.2) 40%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.3) 0%, rgba(91, 45, 142, 0.1) 40%, transparent 70%)',
                  transform: `translateY(${scrollY * 0.15}px)`,
                }}
              />
              <div
                className="absolute -bottom-1/2 -left-1/4 w-[60%] h-[150%] blur-3xl opacity-20 transition-transform duration-700"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.5) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.25) 0%, transparent 60%)',
                  transform: `translateY(${scrollY * -0.1}px)`,
                }}
              />
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="relative max-w-4xl mx-auto px-4 pt-16 md:pt-20 pb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Trophy size={22} className="text-primary md:w-6 md:h-6" />
                </div>
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl leading-none mb-3"
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  letterSpacing: '0.02em',
                  transform: `translateY(${scrollY * 0.2}px)`,
                }}
              >
                {t.concoursTitle}
              </h1>
              <p
                className={`text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.concoursSubtitle}
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/*  CONTESTS - Compact editorial cards                          */}
          {/* ============================================================ */}
          <div className={`relative ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
            {/* Gradient blobs background continuing */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 right-0 w-[50%] h-[80%] blur-3xl opacity-15"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.4) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.2) 0%, transparent 60%)',
                }}
              />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24">
              <div className="space-y-8">
                {/* Section title */}
                <div className="pb-4 relative">
                  <div className={`absolute -left-2 top-0 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                  <div className={`absolute -left-2 top-0 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
                  <h2
                    className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                  >
                    {t.concoursActiveContests}
                  </h2>
                  <div className="h-1 w-24 bg-primary ml-6" />
                </div>

                {/* Tier rules explanation */}
                <div
                  className={`pl-6 rounded-lg border p-5 md:p-6 ${
                    darkMode
                      ? 'border-white/[0.08] bg-white/[0.03]'
                      : 'border-black/[0.08] bg-black/[0.02]'
                  }`}
                >
                  <p
                    className="text-primary text-xs tracking-[0.3em] uppercase mb-3"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {language === 'fr' ? 'RÈGLE DES PALIERS' : 'TIER RULES'}
                  </p>
                  <p
                    className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-white/75' : 'text-black/75'}`}
                    style={{ fontFamily: '"Archivo", sans-serif' }}
                  >
                    {language === 'fr'
                      ? 'Chaque commande ne peut participer qu\u2019à UN SEUL concours : le palier le plus haut atteint. Une commande à 150 € ou plus participe UNIQUEMENT au concours de la veste. Une commande entre 70 € et 149,99 € participe UNIQUEMENT au concours du bonnet.'
                      : 'Each order can only enter ONE contest: the highest tier reached. An order of €150 or more enters ONLY the jacket contest. An order between €70 and €149.99 enters ONLY the beanie contest.'}
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`rounded-md border p-3 ${
                        darkMode ? 'border-primary/30 bg-primary/10' : 'border-primary/40 bg-primary/5'
                      }`}
                    >
                      <p
                        className="text-primary text-[10px] tracking-[0.3em] uppercase mb-1"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {language === 'fr' ? 'PALIER 1' : 'TIER 1'}
                      </p>
                      <p
                        className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {language === 'fr' ? '70 € – 149,99 €' : '€70 – €149.99'}
                        <span className="text-primary"> → {language === 'fr' ? 'CONCOURS BONNET' : 'BEANIE CONTEST'}</span>
                      </p>
                    </div>
                    <div
                      className={`rounded-md border p-3 ${
                        darkMode ? 'border-primary/30 bg-primary/10' : 'border-primary/40 bg-primary/5'
                      }`}
                    >
                      <p
                        className="text-primary text-[10px] tracking-[0.3em] uppercase mb-1"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {language === 'fr' ? 'PALIER 2' : 'TIER 2'}
                      </p>
                      <p
                        className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {language === 'fr' ? '150 € ET +' : '€150 AND UP'}
                        <span className="text-primary"> → {language === 'fr' ? 'CONCOURS VESTE' : 'JACKET CONTEST'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contest cards */}
                {contests.map((contest, index) => (
                  <ContestCard
                    key={contest.id}
                    contest={contest}
                    index={index}
                    language={language}
                    darkMode={darkMode}
                    t={t}
                    scrollY={scrollY}
                    onSeeConditions={scrollToConditions}
                    isFocused={focusedContestId === contest.id}
                  />
                ))}

                {/* Empty state */}
                {contests.length === 0 && (
                  <div className="pl-6 py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy size={36} className="text-primary/40" />
                    </div>
                    <p
                      className="text-2xl md:text-3xl mb-3"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursNoActive}
                    </p>
                    <p className={`max-w-md mx-auto ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                      {t.concoursCheckBack}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/*  HOW IT WORKS - Horizontal timeline (INCHANGÉ)               */}
          {/* ============================================================ */}
          <HowItWorks darkMode={darkMode} t={t} />

          {/* ============================================================ */}
          {/*  CONDITIONS - Clean editorial style, no gradient              */}
          {/* ============================================================ */}
          <section
            id="conditions"
            className={`relative scroll-mt-20 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}
          >
            {/* Gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[100%] blur-3xl opacity-15"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.4) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.2) 0%, transparent 60%)',
                }}
              />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24">
              <div className="space-y-8">
                {/* Section title */}
                <div className="pb-4 relative">
                  <div className={`absolute -left-2 top-0 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                  <div className={`absolute -left-2 top-0 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.03}px)` }} />
                  <h2
                    className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                  >
                    {t.concoursConditionsTitle}
                  </h2>
                  <div className="h-1 w-24 bg-primary ml-6" />
                </div>

                <p
                  className={`pl-6 text-sm md:text-base ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                  style={{ fontFamily: '"Archivo", sans-serif' }}
                >
                  {t.concoursConditionsSubtitle}
                </p>

                {/* Accordion */}
                <div className="pl-6 space-y-2">
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
            </div>
          </section>

          {/* ============================================================ */}
          {/*  BOTTOM - Clean final statement (like about page)            */}
          {/* ============================================================ */}
          <section className={`relative ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 left-1/4 w-[50%] h-full blur-3xl opacity-20"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.5) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.25) 0%, transparent 60%)',
                }}
              />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24">
              <div className="space-y-8">
                <div className="pb-4 relative">
                  <div className={`absolute -left-2 top-0 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                  <div className={`absolute -left-2 top-0 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.02}px)` }} />
                  <h2
                    className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                  >
                    {t.concoursCtaTitle}
                  </h2>
                  <div className="h-1 w-24 bg-primary ml-6" />
                </div>

                <div className="pl-6 space-y-6">
                  <p
                    className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`}
                    style={{ fontFamily: '"Archivo", sans-serif' }}
                  >
                    {t.concoursCtaSubtitle}
                  </p>

                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_rgba(91,45,142,0.3)]"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {t.concoursCtaButton}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Final statement */}
              <div className="py-16 md:py-20 text-center">
                <p
                  className="text-4xl md:text-5xl lg:text-6xl text-primary leading-tight"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {language === 'fr' ? 'TENTEZ' : 'TRY'}
                  <br />
                  {language === 'fr' ? 'VOTRE CHANCE.' : 'YOUR LUCK.'}
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ContestCard - Compact editorial card                               */
/* ================================================================== */
function ContestCard({
  contest,
  index,
  language,
  darkMode,
  t,
  scrollY,
  onSeeConditions,
  isFocused,
}: {
  contest: ContestData;
  index: number;
  language: string;
  darkMode: boolean;
  t: any;
  scrollY: number;
  onSeeConditions: () => void;
  isFocused?: boolean;
}) {
  const { ref, isVisible } = useReveal(0.1);
  const { count, ref: counterRef } = useCounter(contest._count.entries);

  return (
    <div
      ref={ref}
      id={`contest-${contest.id}`}
      className={`pl-6 transition-all duration-1000 scroll-mt-24 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div
        className={`relative overflow-hidden rounded-lg border transition-all duration-500 ${
          darkMode ? 'border-white/[0.08] bg-white/[0.02]' : 'border-black/[0.08] bg-black/[0.02]'
        } ${
          isFocused
            ? 'ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse shadow-[0_0_40px_rgba(109,40,217,0.55)]'
            : ''
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          {contest.prizeImage && (
            <div className="relative w-full md:w-[240px] lg:w-[280px] flex-shrink-0 aspect-square md:aspect-auto md:min-h-[280px]">
              <img
                src={contest.prizeImage}
                alt={language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
            {/* Win label */}
            <p
              className="text-primary text-xs tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t.concoursWinLabel}
            </p>

            {/* Prize name */}
            <h3
              className="text-3xl md:text-4xl leading-[0.9] mb-3"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
            </h3>

            {/* Prize value */}
            <p
              className={`text-lg ${darkMode ? 'text-white/50' : 'text-black/50'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {t.value} {contest.prizeValue}&euro;
            </p>

            {/* Purchase requirement */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm">
                <ShoppingCart size={14} />
                <span
                  className="font-bold"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {contest.purchaseAmount}&euro; {t.purchaseSuffix}
                </span>
                <span className="text-white/70 text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  {t.oneDrawEntry}
                </span>
              </div>
            </div>

            {/* Description */}
            {contest.description && (
              <p
                className={`mt-4 text-sm leading-relaxed max-w-lg ${
                  darkMode ? 'text-white/50' : 'text-black/50'
                }`}
                style={{ fontFamily: '"Archivo", sans-serif' }}
              >
                {language === 'fr' ? contest.description : (contest.descriptionEn || contest.description)}
              </p>
            )}

            {/* Bottom row: counter + CTA */}
            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
              {/* Counter */}
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-primary" />
                <span
                  ref={counterRef}
                  className="text-2xl text-primary"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {count}
                </span>
                <span
                  className={`text-xs tracking-[0.1em] uppercase ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.concoursParticipations}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={onSeeConditions}
                className={`group inline-flex items-center gap-2 px-5 py-2.5 border text-xs tracking-[0.15em] uppercase overflow-hidden transition-all duration-500 ${
                  darkMode
                    ? 'border-white/20 text-white hover:text-white hover:border-primary hover:bg-primary'
                    : 'border-black/20 text-black hover:text-white hover:border-primary hover:bg-primary'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                <span>{t.concoursSeeConditions}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HowItWorks - Horizontal timeline (INCHANGÉ)                       */
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
/*  AccordionItem - Clean, no gradient                                 */
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
        className={`relative overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'border-l-2 border-l-primary ' + (darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]')
            : darkMode
              ? 'border-l border-l-white/[0.06] hover:border-l-white/[0.15]'
              : 'border-l border-l-black/[0.06] hover:border-l-black/[0.15]'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 px-5 md:px-6 py-4 md:py-5 text-left group transition-colors"
        >
          {/* Number badge */}
          <span
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
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
            className={`flex-1 text-sm md:text-base transition-colors ${
              isOpen ? 'text-primary' : ''
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {title}
          </span>

          {/* Toggle icon */}
          <div
            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? 'bg-primary/10 text-primary'
                : darkMode
                  ? 'bg-white/[0.05] text-white/30'
                  : 'bg-black/[0.04] text-black/30'
            }`}
          >
            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
          </div>
        </button>

        {/* Content */}
        <div
          className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ height: isOpen ? `${height}px` : '0px' }}
        >
          <div
            ref={contentRef}
            className={`px-5 md:px-6 pb-5 pl-[4rem] md:pl-[4.5rem] text-sm leading-relaxed ${
              darkMode ? 'text-white/50' : 'text-black/50'
            }`}
            style={{ fontFamily: '"Archivo", sans-serif' }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
