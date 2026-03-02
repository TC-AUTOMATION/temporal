'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, WashingMachine, Shirt, Droplets, Wind, ThermometerSun, Ban, AlertTriangle } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';

// Icon mapping for wash symbols
const symbolIcons: Record<string, any> = {
  'wash-30': Droplets,
  'wash-40': Droplets,
  'hand-wash': Droplets,
  'no-bleach': Ban,
  'no-tumble-dry': Wind,
  'flat-dry': Wind,
  'air-dry': Wind,
  'iron-low': ThermometerSun,
  'no-iron': Ban,
  'iron-reverse': ThermometerSun,
  'wash-reverse': WashingMachine,
  'no-softener': Ban,
  'no-dry-clean': Ban,
};

interface CareGuide {
  id: string;
  categorySlug: string;
  nameFr: string;
  nameEn: string;
  instructionsFr: string;
  instructionsEn: string;
  iconSymbols: { symbol: string; labelFr: string; labelEn: string }[];
}

export default function CareGuidePage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [guides, setGuides] = useState<CareGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await fetch('/api/care-guides', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await res.json();
        if (data.success) setGuides(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header />
        <Sidebar />
        <CartDrawer />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <Link
            href="/"
            className={`inline-flex items-center gap-2 mb-8 transition-colors ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={18} />
            {t.back}
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <WashingMachine size={32} className="text-primary" />
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl uppercase mb-4"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {language === 'fr' ? 'GUIDE DE LAVAGE' : 'CARE GUIDE'}
            </h1>
            <p className={`max-w-xl mx-auto ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {language === 'fr'
                ? 'Prenez soin de vos pièces Temporal pour les garder comme neuves.'
                : 'Take care of your Temporal pieces to keep them looking new.'}
            </p>
          </div>

          {/* Important notice */}
          <div className={`mb-12 p-6 border-l-4 border-primary ${darkMode ? 'bg-primary/10' : 'bg-primary/5'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {language === 'fr' ? 'IMPORTANT' : 'IMPORTANT'}
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                  {language === 'fr'
                    ? 'Temporal ne peut être tenu responsable des dégradations causées par un entretien inadapté ou le non-respect des instructions de lavage ci-dessous. Veuillez suivre attentivement ces consignes pour préserver la qualité de vos vêtements. En cas de demande de remboursement, les articles doivent être retournés dans le même état qu\'à l\'envoi.'
                    : 'Temporal cannot be held responsible for damage caused by improper care or failure to follow the washing instructions below. Please follow these instructions carefully to preserve the quality of your garments. For refund requests, items must be returned in the same condition as sent.'}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {t.loading}
              </p>
            </div>
          ) : guides.length === 0 ? (
            /* Fallback static content when no guides in DB yet */
            <div className="space-y-8">
              {[
                {
                  titleFr: 'VESTES & T-SHIRTS', titleEn: 'JACKETS & T-SHIRTS',
                  instructionsFr: 'Lavage en machine à 30°C maximum • Retourner le vêtement avant lavage • Ne pas utiliser de javel • Ne pas sécher au sèche-linge • Repassage à l\'envers à température basse • Ne pas repasser sur les impressions',
                  instructionsEn: 'Machine wash at 30°C maximum • Turn garment inside out before washing • Do not bleach • Do not tumble dry • Iron inside out at low temperature • Do not iron on prints',
                },
                {
                  titleFr: 'JOGGINGS', titleEn: 'JOGGERS',
                  instructionsFr: 'Lavage en machine à 30°C maximum • Ne pas utiliser d\'adoucissant • Séchage à l\'air libre recommandé • Repassage à basse température si nécessaire',
                  instructionsEn: 'Machine wash at 30°C maximum • Do not use fabric softener • Air drying recommended • Iron at low temperature if needed',
                },
                {
                  titleFr: 'BONNETS & ACCESSOIRES', titleEn: 'BEANIES & ACCESSORIES',
                  instructionsFr: 'Lavage à la main recommandé • Séchage à plat • Ne pas repasser • Ne pas passer au sèche-linge',
                  instructionsEn: 'Hand wash recommended • Flat drying • Do not iron • Do not tumble dry',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}
                >
                  <div className={`p-6 border-b flex items-center gap-4 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className={`w-14 h-14 flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <WashingMachine size={28} className="text-primary" />
                    </div>
                    <h2
                      className="text-2xl uppercase"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {language === 'fr' ? item.titleFr : item.titleEn}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {(language === 'fr' ? item.instructionsFr : item.instructionsEn).split(' • ').map((instruction, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 bg-primary flex-shrink-0" />
                          <p className={`${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Dynamic content from back office */
            <div className="space-y-8">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}
                >
                  <div className={`p-6 border-b flex items-center gap-4 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className={`w-14 h-14 flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <WashingMachine size={28} className="text-primary" />
                    </div>
                    <h2
                      className="text-2xl uppercase"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {language === 'fr' ? guide.nameFr : guide.nameEn}
                    </h2>
                  </div>
                  <div className="p-6">
                    {/* Care symbols */}
                    {guide.iconSymbols && guide.iconSymbols.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {guide.iconSymbols.map((sym, i) => {
                          const SymIcon = symbolIcons[sym.symbol] || WashingMachine;
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}
                            >
                              <SymIcon size={16} className="text-primary" />
                              <span className="text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                                {language === 'fr' ? sym.labelFr : sym.labelEn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="space-y-3">
                      {(language === 'fr' ? guide.instructionsFr : guide.instructionsEn).split('\n').filter(Boolean).map((instruction, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 bg-primary flex-shrink-0" />
                          <p className={`${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* General tips */}
          <div className="mt-16">
            <h3
              className="text-2xl mb-8 text-center"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'CONSEILS GÉNÉRAUX' : 'GENERAL TIPS'}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: { fr: 'PREMIER LAVAGE', en: 'FIRST WASH' },
                  desc: { fr: 'Lavez toujours vos vêtements séparément lors du premier lavage pour éviter les transferts de couleur.', en: 'Always wash your garments separately for the first wash to prevent color transfer.' },
                  Icon: Droplets
                },
                {
                  title: { fr: 'SÉCHAGE', en: 'DRYING' },
                  desc: { fr: 'Privilégiez toujours le séchage à l\'air libre. Évitez le sèche-linge qui peut endommager les fibres et les impressions.', en: 'Always prefer air drying. Avoid tumble dryers which can damage fibers and prints.' },
                  Icon: Wind
                },
                {
                  title: { fr: 'STOCKAGE', en: 'STORAGE' },
                  desc: { fr: 'Rangez vos vêtements pliés dans un endroit sec et à l\'abri de la lumière directe du soleil.', en: 'Store your garments folded in a dry place away from direct sunlight.' },
                  Icon: Shirt
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-6 text-center ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <item.Icon size={28} className="text-primary" />
                  </div>
                  <h4
                    className="text-lg mb-2"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {item.title[language]}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {item.desc[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal notice about washing */}
          <div className={`mt-16 p-8 text-center ${darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
            <AlertTriangle size={40} className="mx-auto mb-4 text-red-500" />
            <h3
              className="text-xl mb-3"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'CLAUSE DE RESPONSABILITÉ' : 'LIABILITY CLAUSE'}
            </h3>
            <p className={`text-sm leading-relaxed max-w-2xl mx-auto ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {language === 'fr'
                ? 'Temporal ne saurait être tenu responsable des dégradations survenues sur les vêtements suite à un lavage inadapté ou au non-respect des instructions d\'entretien fournies. Les remboursements et retours ne seront acceptés que pour les articles retournés dans le même état qu\'à leur réception. Tout article présentant des signes d\'usure anormale, de détérioration due à un entretien incorrect, ou de modification ne pourra faire l\'objet d\'un remboursement.'
                : 'Temporal cannot be held responsible for any damage to garments resulting from improper washing or failure to follow the care instructions provided. Refunds and returns will only be accepted for items returned in the same condition as received. Any item showing signs of abnormal wear, deterioration due to incorrect care, or modification will not be eligible for a refund.'}
            </p>
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2 text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'VOIR LES CGV COMPLÈTES' : 'SEE FULL TERMS'}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
