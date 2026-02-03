'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Ruler, Shirt, MessageCircle, MoveHorizontal, CircleDot, Target, Maximize2, ArrowUpDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';

// Jacket icon component
const JacketIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 2H9L7 7L2 9v10l3 1v-8l2 1v10h10V13l2-1v8l3-1V9l-5-2-2-5z" />
  </svg>
);

// Pants icon component
const PantsIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2h12l1 7-2 13h-4l-1-11-1 11H7L5 9l1-7z" />
  </svg>
);

// Beanie icon component
const BeanieIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="7" rx="8" ry="5" />
    <path d="M4 7c0 5 3.5 9 8 9s8-4 8-9" />
    <path d="M12 2v2" />
    <circle cx="12" cy="2" r="1" />
  </svg>
);

const sizeGuides = [
  {
    id: 'veste',
    name: { fr: 'Vestes', en: 'Jackets' },
    image: '/size-guides/size-veste.jpg',
    Icon: JacketIcon,
    tips: {
      fr: 'Nos vestes ont une coupe regular. Si vous êtes entre deux tailles, prenez la taille supérieure pour un style oversized.',
      en: 'Our jackets have a regular fit. If you\'re between sizes, size up for an oversized look.'
    }
  },
  {
    id: 'tshirt',
    name: { fr: 'T-shirts', en: 'T-shirts' },
    image: '/size-guides/size-tshirt.jpg',
    Icon: Shirt,
    tips: {
      fr: 'Coupe regular avec une légère ampleur. Le modèle mesure 1m80 et porte une taille M.',
      en: 'Regular fit with a slight roominess. Model is 5\'11" and wears size M.'
    }
  },
  {
    id: 'jogging',
    name: { fr: 'Joggings', en: 'Joggers' },
    image: '/size-guides/size-jogging.jpg',
    Icon: PantsIcon,
    tips: {
      fr: 'Coupe ajustée aux chevilles avec taille élastique. Prenez votre taille habituelle.',
      en: 'Tapered fit with elastic waistband. Take your usual size.'
    }
  },
  {
    id: 'bonnet',
    name: { fr: 'Bonnets', en: 'Beanies' },
    image: '/size-guides/size-bonnet.jpg',
    Icon: BeanieIcon,
    tips: {
      fr: 'Taille unique élastique, s\'adapte à toutes les têtes.',
      en: 'One size fits all with elastic fit.'
    }
  },
];

export default function SizeGuidePage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [activeGuide, setActiveGuide] = useState('veste');

  const currentGuide = sizeGuides.find(g => g.id === activeGuide) || sizeGuides[0];

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
              <Ruler size={32} className="text-primary" />
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl uppercase mb-4"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {language === 'fr' ? 'GUIDE DES TAILLES' : 'SIZE GUIDE'}
            </h1>
            <p className={`max-w-xl mx-auto ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {language === 'fr'
                ? 'Trouvez votre taille parfaite pour chaque pièce Temporal.'
                : 'Find your perfect fit for every Temporal piece.'}
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {sizeGuides.map((guide) => {
              const IconComponent = guide.Icon;
              return (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuide(guide.id)}
                  className={`px-6 py-3 flex items-center gap-3 transition-all ${
                    activeGuide === guide.id
                      ? 'bg-primary text-white'
                      : darkMode
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                        : 'bg-black/5 hover:bg-black/10 border border-black/10'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <IconComponent size={22} />
                  {guide.name[language]}
                </button>
              );
            })}
          </div>

          {/* Active guide content */}
          <div className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            {/* Guide header */}
            <div className={`p-6 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <currentGuide.Icon size={32} className="text-primary" />
                </div>
                <div>
                  <h2
                    className="text-2xl md:text-3xl uppercase"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {currentGuide.name[language]}
                  </h2>
                  <p className={`mt-1 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {currentGuide.tips[language]}
                  </p>
                </div>
              </div>
            </div>

            {/* Size chart image */}
            <div className="p-4 md:p-8">
              <div className="relative aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={currentGuide.image}
                  alt={`${currentGuide.name[language]} size guide`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* How to measure section */}
          <div className="mt-16">
            <h3
              className="text-2xl mb-8 text-center"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'COMMENT PRENDRE VOS MESURES' : 'HOW TO MEASURE'}
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: { fr: 'POITRINE', en: 'CHEST' },
                  desc: { fr: 'Mesurez le tour de poitrine au niveau le plus large.', en: 'Measure around the fullest part of your chest.' },
                  Icon: Maximize2
                },
                {
                  title: { fr: 'TAILLE', en: 'WAIST' },
                  desc: { fr: 'Mesurez votre tour de taille naturel.', en: 'Measure around your natural waistline.' },
                  Icon: MoveHorizontal
                },
                {
                  title: { fr: 'HANCHES', en: 'HIPS' },
                  desc: { fr: 'Mesurez le tour de hanches au niveau le plus large.', en: 'Measure around the fullest part of your hips.' },
                  Icon: CircleDot
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

          {/* Help section */}
          <div className={`mt-16 p-8 text-center ${darkMode ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/10'}`}>
            <Shirt size={40} className="mx-auto mb-4 text-primary" />
            <h3
              className="text-xl mb-3"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'BESOIN D\'AIDE ?' : 'NEED HELP?'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {language === 'fr'
                ? 'Notre équipe est là pour vous aider à trouver la taille parfaite.'
                : 'Our team is here to help you find the perfect size.'}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary/90 transition-all"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
            >
              {language === 'fr' ? 'CONTACTEZ-NOUS' : 'CONTACT US'}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
