'use client';

import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import TemporalLogo from '@/components/ui/TemporalLogo';

export default function AboutPage() {
  const { language, darkMode } = useStore();
  const t = translations[language];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex justify-center mb-8">
            <TemporalLogo size={120} animate />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">{t.quiSommesNous}</h1>

          <div className="space-y-6 text-lg leading-relaxed opacity-80">
            <p>
              Temporal est né d'une passion pour le streetwear et d'une vision unique
              de la mode urbaine. Notre marque représente plus qu'un simple vêtement -
              c'est une expression de style, d'individualité et d'appartenance à une
              communauté.
            </p>

            <p>
              Chaque pièce Temporal est conçue avec soin, en privilégiant la qualité
              des matériaux et l'attention aux détails. Nous croyons que le streetwear
              doit être à la fois confortable et stylé, permettant à chacun de s'exprimer
              à travers ses vêtements.
            </p>

            <p>
              Le logo Temporal, avec son T stylisé entouré d'un cercle, symbolise le
              cycle du temps et notre connexion à l'instant présent. Chaque collection
              est une capsule temporelle de créativité et d'innovation.
            </p>

            <p>
              Rejoins l'univers Temporal et fais partie de notre communauté grandissante.
              Ensemble, créons le streetwear de demain.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#5B2D8E] font-medium">
              Vivez l'expérience Temporal
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
