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
import { Trophy, ShoppingCart, Ticket, Gift, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

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

function RevealOnScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function ConcoursPage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [contests, setContests] = useState<ContestData[]>([]);
  const [openSection, setOpenSection] = useState<number | null>(null);

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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const conditionsSections = [
    {
      title: language === 'fr' ? '1. Eligibilit\u00e9' : '1. Eligibility',
      content: language === 'fr'
        ? 'Le concours est ouvert \u00e0 toute personne physique majeure (\u00e2g\u00e9e de 18 ans ou plus \u00e0 la date de participation), disposant d\u2019une adresse de livraison valide en France m\u00e9tropolitaine ou dans l\u2019Union Europ\u00e9enne. Les employ\u00e9s de Temporal et leurs familles ne peuvent pas participer.'
        : 'The contest is open to any individual aged 18 or over at the date of entry, with a valid shipping address in mainland France or the European Union. Employees of Temporal and their families are not eligible to enter.',
    },
    {
      title: language === 'fr' ? '2. Comment participer' : '2. How to Enter',
      content: language === 'fr'
        ? 'Pour participer, il suffit de passer une commande sur notre boutique en ligne (temporalclothes.com) atteignant le montant minimum requis indiqu\u00e9 pour chaque concours. Chaque commande \u00e9ligible donne droit \u00e0 une (1) participation au tirage au sort. Il n\u2019y a pas de limite au nombre de participations par personne : chaque commande \u00e9ligible compte comme une participation suppl\u00e9mentaire.'
        : 'To enter, simply place an order on our online store (temporalclothes.com) meeting the minimum amount required for each contest. Each qualifying order earns one (1) entry into the draw. There is no limit on the number of entries per person: each qualifying order counts as an additional entry.',
    },
    {
      title: language === 'fr' ? '3. Tirage au sort' : '3. Draw',
      content: language === 'fr'
        ? 'Le gagnant sera d\u00e9sign\u00e9 par tirage au sort al\u00e9atoire parmi l\u2019ensemble des participations valides. La date du tirage sera communiqu\u00e9e sur nos r\u00e9seaux sociaux et sur cette page. Le tirage sera effectu\u00e9 de mani\u00e8re \u00e9quitable et transparente.'
        : 'The winner will be selected by random draw from all valid entries. The draw date will be announced on our social media channels and on this page. The draw will be conducted fairly and transparently.',
    },
    {
      title: language === 'fr' ? '4. Lot' : '4. Prize',
      content: language === 'fr'
        ? 'Le lot est strictement nominatif et ne peut \u00eatre ni \u00e9chang\u00e9, ni rembours\u00e9, ni c\u00e9d\u00e9 \u00e0 un tiers. Aucune contrepartie en esp\u00e8ces ne sera propos\u00e9e. Le lot correspond exactement \u00e0 celui d\u00e9crit sur cette page (mod\u00e8le, coloris et taille selon disponibilit\u00e9).'
        : 'The prize is strictly non-transferable and cannot be exchanged, refunded, or assigned to a third party. No cash alternative will be offered. The prize corresponds exactly to the one described on this page (model, color and size subject to availability).',
    },
    {
      title: language === 'fr' ? '5. Notification du gagnant' : '5. Winner Notification',
      content: language === 'fr'
        ? 'Le gagnant sera contact\u00e9 par email (adresse utilis\u00e9e lors de la commande) dans les 48 heures suivant le tirage au sort. En l\u2019absence de r\u00e9ponse sous 7 jours, un nouveau gagnant sera tir\u00e9 au sort. Le r\u00e9sultat sera \u00e9galement publi\u00e9 sur nos r\u00e9seaux sociaux.'
        : 'The winner will be contacted by email (the address used during the order) within 48 hours of the draw. If there is no response within 7 days, a new winner will be drawn. The result will also be published on our social media channels.',
    },
    {
      title: language === 'fr' ? '6. Livraison du lot' : '6. Prize Delivery',
      content: language === 'fr'
        ? 'Le lot sera exp\u00e9di\u00e9 gratuitement \u00e0 l\u2019adresse du gagnant dans un d\u00e9lai de 7 jours ouvrables apr\u00e8s confirmation de ses coordonn\u00e9es. Les frais de livraison sont int\u00e9gralement pris en charge par Temporal.'
        : 'The prize will be shipped free of charge to the winner\'s address within 7 business days after confirmation of their details. Shipping costs are fully covered by Temporal.',
    },
    {
      title: language === 'fr' ? '7. Donn\u00e9es personnelles' : '7. Data Privacy',
      content: language === 'fr'
        ? 'Les donn\u00e9es personnelles collect\u00e9es dans le cadre du concours (nom, email, adresse) sont utilis\u00e9es exclusivement pour la gestion du concours et la livraison du lot. Elles ne seront en aucun cas communiqu\u00e9es \u00e0 des tiers. Conform\u00e9ment au RGPD, vous disposez d\u2019un droit d\u2019acc\u00e8s, de rectification et de suppression de vos donn\u00e9es en contactant temporal.clothes8@gmail.com.'
        : 'Personal data collected as part of the contest (name, email, address) is used exclusively for contest management and prize delivery. It will not be shared with third parties under any circumstances. In accordance with GDPR, you have the right to access, rectify, and delete your data by contacting temporal.clothes8@gmail.com.',
    },
    {
      title: language === 'fr' ? '8. Organisateur' : '8. Organizer',
      content: language === 'fr'
        ? 'Ce concours est organis\u00e9 par Temporal, marque de streetwear bas\u00e9e \u00e0 \u00c9vreux, France. Pour toute question relative au concours, contactez-nous \u00e0 temporal.clothes8@gmail.com.'
        : 'This contest is organized by Temporal, a streetwear brand based in \u00c9vreux, France. For any questions regarding the contest, contact us at temporal.clothes8@gmail.com.',
    },
    {
      title: language === 'fr' ? '9. Litiges' : '9. Disputes',
      content: language === 'fr'
        ? 'Toute contestation ou r\u00e9clamation doit \u00eatre adress\u00e9e par \u00e9crit \u00e0 Temporal dans un d\u00e9lai de 30 jours suivant le tirage au sort. Le pr\u00e9sent r\u00e8glement est soumis au droit fran\u00e7ais. En cas de litige, les tribunaux comp\u00e9tents seront ceux du ressort du si\u00e8ge de Temporal.'
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
          {/* Hero Banner */}
          <section className="relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-purple-900" />

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[120%] rounded-full opacity-20 blur-3xl bg-white" />
              <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[100%] rounded-full opacity-10 blur-3xl bg-purple-300" />
              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Accent line top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-white/40 via-white/20 to-transparent" />

            <div className="relative max-w-7xl mx-auto px-4 pt-28 md:pt-36 pb-16 md:pb-24 text-center">
              {/* Trophy icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Trophy size={32} className="text-white md:w-10 md:h-10" />
                </div>
              </div>

              <h1
                className="text-5xl md:text-7xl lg:text-8xl text-white leading-none"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
              >
                {t.concoursTitle}
              </h1>

              <p
                className="mt-4 text-lg md:text-xl text-white/70 tracking-[0.15em] uppercase"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {t.concoursSubtitle}
              </p>

              {/* Scroll indicator */}
              <div className="mt-12 animate-bounce">
                <ChevronDown size={28} className="text-white/50 mx-auto" />
              </div>
            </div>
          </section>

          {/* Contest Cards */}
          <section className={`py-16 md:py-24 ${darkMode ? 'bg-black' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4">
              {/* Section header */}
              <RevealOnScroll>
                <div className="text-center mb-12 md:mb-16">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-transparent to-primary" />
                    <p
                      className="text-primary text-sm md:text-base tracking-[0.3em] uppercase"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursActiveContests}
                    </p>
                    <div className="h-[1px] w-16 md:w-24 bg-gradient-to-l from-transparent to-primary" />
                  </div>
                </div>
              </RevealOnScroll>

              {/* Contest cards */}
              <div className="space-y-12 md:space-y-16">
                {contests.map((contest, index) => (
                  <RevealOnScroll key={contest.id}>
                    <div
                      className={`relative rounded-2xl overflow-hidden border ${
                        darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]'
                      }`}
                    >
                      <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                        {/* Prize Image */}
                        <div className={`relative w-full md:w-[400px] lg:w-[480px] flex-shrink-0 aspect-square md:aspect-auto min-h-[300px] md:min-h-[400px] ${
                          darkMode ? 'bg-white/5' : 'bg-black/5'
                        }`}>
                          {contest.prizeImage ? (
                            <img
                              src={contest.prizeImage}
                              alt={language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Trophy size={80} className="text-primary/20" />
                            </div>
                          )}
                          {/* Number badge */}
                          <div className="absolute top-4 left-4 md:top-6 md:left-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center">
                            <span
                              className="text-white text-2xl md:text-3xl font-bold"
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {contest.number}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 md:p-10 lg:p-14 flex flex-col justify-center">
                          {/* Win label */}
                          <p
                            className="text-primary text-xs md:text-sm tracking-[0.3em] uppercase mb-2"
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {t.concoursWinLabel}
                          </p>

                          {/* Prize name */}
                          <h2
                            className="text-3xl md:text-4xl lg:text-5xl leading-tight"
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                          </h2>

                          {/* Prize value */}
                          <div className="flex items-center gap-3 mt-3">
                            <span
                              className={`text-lg md:text-xl ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {t.value} {contest.prizeValue}&euro;
                            </span>
                          </div>

                          {/* Purchase requirement */}
                          <div className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-lg ${
                            darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/15'
                          }`}>
                            <ShoppingCart size={18} className="text-primary" />
                            <span
                              className="text-primary text-lg md:text-xl font-bold"
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {contest.purchaseAmount}&euro; {t.purchaseSuffix}
                            </span>
                            <span
                              className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {t.oneDrawEntry}
                            </span>
                          </div>

                          {/* Description */}
                          <p className={`mt-6 text-sm md:text-base leading-relaxed ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                            {language === 'fr' ? contest.description : (contest.descriptionEn || contest.description)}
                          </p>

                          {/* Entry count */}
                          <div className="mt-4 flex items-center gap-2">
                            <Ticket size={16} className="text-primary" />
                            <span
                              className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {contest._count.entries} {t.concoursParticipations}
                            </span>
                          </div>

                          {/* CTA */}
                          <div className="mt-8">
                            <button
                              onClick={scrollToConditions}
                              className={`inline-flex items-center gap-2 px-6 py-3 border text-sm tracking-[0.1em] uppercase transition-all hover:scale-105 ${
                                darkMode
                                  ? 'border-white/20 text-white/80 hover:border-primary hover:text-primary'
                                  : 'border-black/20 text-black/80 hover:border-primary hover:text-primary'
                              }`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {t.concoursSeeConditions}
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}

                {/* Empty state if no contests */}
                {contests.length === 0 && (
                  <RevealOnScroll>
                    <div className="text-center py-16">
                      <Trophy size={48} className="text-primary/30 mx-auto mb-4" />
                      <p
                        className="text-2xl md:text-3xl mb-2"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.concoursNoActive}
                      </p>
                      <p className={`${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {t.concoursCheckBack}
                      </p>
                    </div>
                  </RevealOnScroll>
                )}
              </div>
            </div>
          </section>

          {/* How it Works */}
          <section className={`py-16 md:py-24 ${darkMode ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
            <div className="max-w-5xl mx-auto px-4">
              <RevealOnScroll>
                <div className="text-center mb-12 md:mb-16">
                  <h2
                    className="text-4xl md:text-5xl lg:text-6xl"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
                  >
                    {t.concoursHowItWorks}
                  </h2>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Step 1 */}
                <RevealOnScroll>
                  <div className="text-center group">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                      darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/15'
                    }`}>
                      <ShoppingCart size={32} className="text-primary" />
                    </div>
                    <div
                      className="text-primary text-sm tracking-[0.3em] uppercase mb-2"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep1Label}
                    </div>
                    <h3
                      className="text-2xl md:text-3xl mb-3"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep1Title}
                    </h3>
                    <p className={`text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {t.concoursStep1Desc}
                    </p>
                  </div>
                </RevealOnScroll>

                {/* Step 2 */}
                <RevealOnScroll>
                  <div className="text-center group">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                      darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/15'
                    }`}>
                      <Ticket size={32} className="text-primary" />
                    </div>
                    <div
                      className="text-primary text-sm tracking-[0.3em] uppercase mb-2"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep2Label}
                    </div>
                    <h3
                      className="text-2xl md:text-3xl mb-3"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep2Title}
                    </h3>
                    <p className={`text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {t.concoursStep2Desc}
                    </p>
                  </div>
                </RevealOnScroll>

                {/* Step 3 */}
                <RevealOnScroll>
                  <div className="text-center group">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                      darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/15'
                    }`}>
                      <Gift size={32} className="text-primary" />
                    </div>
                    <div
                      className="text-primary text-sm tracking-[0.3em] uppercase mb-2"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep3Label}
                    </div>
                    <h3
                      className="text-2xl md:text-3xl mb-3"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.concoursStep3Title}
                    </h3>
                    <p className={`text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {t.concoursStep3Desc}
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          {/* Conditions Section */}
          <section id="conditions" className={`py-16 md:py-24 scroll-mt-20 ${darkMode ? 'bg-black' : 'bg-white'}`}>
            <div className="max-w-4xl mx-auto px-4">
              <RevealOnScroll>
                <div className="text-center mb-12 md:mb-16">
                  <h2
                    className="text-4xl md:text-5xl lg:text-6xl"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
                  >
                    {t.concoursConditionsTitle}
                  </h2>
                  <p className={`mt-3 text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {t.concoursConditionsSubtitle}
                  </p>
                </div>
              </RevealOnScroll>

              {/* Accordion sections */}
              <div className="space-y-3">
                {conditionsSections.map((section, index) => (
                  <RevealOnScroll key={index}>
                    <div
                      className={`border rounded-lg overflow-hidden transition-all ${
                        darkMode ? 'border-white/10' : 'border-black/10'
                      } ${openSection === index ? (darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]') : ''}`}
                    >
                      <button
                        onClick={() => toggleSection(index)}
                        className={`w-full flex items-center justify-between px-5 md:px-6 py-4 md:py-5 text-left transition-colors ${
                          darkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]'
                        }`}
                      >
                        <span
                          className="text-base md:text-lg font-medium"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {section.title}
                        </span>
                        {openSection === index ? (
                          <ChevronUp size={18} className="text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown size={18} className={`flex-shrink-0 ${darkMode ? 'text-white/40' : 'text-black/40'}`} />
                        )}
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openSection === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className={`px-5 md:px-6 pb-5 text-sm md:text-base leading-relaxed ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative overflow-hidden py-16 md:py-24">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-purple-900" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/4 w-[60%] h-[150%] rounded-full opacity-15 blur-3xl bg-white" />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 text-center">
              <RevealOnScroll>
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl text-white mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em' }}
                >
                  {t.concoursCtaTitle}
                </h2>
                <p className="text-white/60 text-sm md:text-base mb-8">
                  {t.concoursCtaSubtitle}
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary text-lg tracking-[0.1em] uppercase transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.concoursCtaButton}
                  <ArrowRight size={18} />
                </Link>
              </RevealOnScroll>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
