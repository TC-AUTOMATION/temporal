'use client';

import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import { Instagram, Camera } from 'lucide-react';

// Community placeholders - to be replaced with real photos when available
const communitySlots = [
  { id: 1, name: 'Lucas M.', product: 'TPL Black Jacket', likes: 42 },
  { id: 2, name: 'Emma R.', product: 'Classic T-Shirt', likes: 38 },
  { id: 3, name: 'Thomas D.', product: 'Complete Set', likes: 56 },
  { id: 4, name: 'Sarah L.', product: 'TPL White Jacket', likes: 29 },
  { id: 5, name: 'Maxime B.', product: 'Cargo Pants', likes: 33 },
  { id: 6, name: 'Léa C.', product: 'Temporal Beanie', likes: 21 },
  { id: 7, name: 'Hugo P.', product: 'Oversize T-Shirt', likes: 45 },
  { id: 8, name: 'Camille V.', product: 'TPL Black Jacket', likes: 52 },
  { id: 9, name: 'Nathan F.', product: 'Complete Set', likes: 61 },
  { id: 10, name: 'Julie M.', product: 'Classic T-Shirt', likes: 27 },
  { id: 11, name: 'Alexandre G.', product: 'Cargo Pants', likes: 39 },
  { id: 12, name: 'Chloé T.', product: 'Temporal Beanie', likes: 18 },
];

export default function CommunityPage() {
  const { language, darkMode } = useStore();
  const t = translations[language];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />

        <main>
          {/* Hero Section */}
          <div className={`relative overflow-hidden ${darkMode ? 'bg-black' : 'bg-white'}`}>
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] opacity-30 blur-3xl"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.3) 0%, transparent 70%)',
                }}
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
              <p
                className="text-primary text-sm mb-4"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.3em' }}
              >
                #TEMPORALGANG
              </p>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl mb-6"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
              >
                {language === 'fr' ? 'LA COMMUNAUTÉ' : 'THE COMMUNITY'} <span className="text-primary">TEMPORAL</span>
              </h1>
              <p className={`max-w-2xl mx-auto text-lg ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr'
                  ? 'Découvrez les looks de notre communauté. Vous aussi, partagez votre style et rejoignez le mouvement.'
                  : 'Discover looks from our community. Share your style and join the movement.'}
              </p>

              {/* CTA to submit photo */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.instagram.com/temporal_clothes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white transition-all hover:scale-105"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Camera size={20} />
                  {language === 'fr' ? 'ENVOYER MA PHOTO' : 'SUBMIT MY PHOTO'}
                </a>
                <a
                  href="https://www.instagram.com/temporal_clothes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 border transition-all hover:scale-105 ${
                    darkMode ? 'border-white/20 hover:border-primary' : 'border-black/20 hover:border-primary'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Instagram size={20} />
                  @TEMPORAL_CLOTHES
                </a>
              </div>
            </div>
          </div>

          {/* Photo Grid - Placeholders until real photos available */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {communitySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="relative aspect-square overflow-hidden group"
                >
                  {/* Placeholder card */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center ${
                      darkMode ? 'bg-white/5' : 'bg-black/5'
                    }`}
                  >
                    <Camera size={32} className={`mb-2 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
                    <span
                      className={`text-xs ${darkMode ? 'text-white/30' : 'text-black/30'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      YOUR PHOTO HERE
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <span
                      className="text-white text-sm text-center"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {language === 'fr' ? 'ENVOIE TA PHOTO' : 'SUBMIT YOUR PHOTO'}
                    </span>
                    <Instagram size={20} className="text-white mt-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state message */}
            <div className={`text-center mt-12 p-8 border-2 border-dashed ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <Camera size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
              <p
                className="text-xl mb-2"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'TA PHOTO ICI ?' : 'YOUR PHOTO HERE?'}
              </p>
              <p className={`max-w-md mx-auto mb-6 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                {language === 'fr'
                  ? 'Envoie-nous ta photo en portant Temporal sur Instagram et apparais dans notre galerie communautaire.'
                  : 'Send us your photo wearing Temporal on Instagram and appear in our community gallery.'}
              </p>
              <a
                href="https://www.instagram.com/temporal_clothes/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white transition-all hover:scale-105"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <Instagram size={18} />
                {language === 'fr' ? 'PARTICIPER' : 'JOIN IN'}
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
