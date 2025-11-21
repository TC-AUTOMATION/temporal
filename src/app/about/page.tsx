'use client';

import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBanner />
      <Header showLogo />
      <Sidebar />
      <CartDrawer />
      <SearchOverlay />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <TemporalLogo size={120} animate />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">{t.quiSommesNous}</h1>

        <Card>
          <CardContent className="p-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
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
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-primary font-medium text-lg">
            Vivez l'expérience Temporal
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
