'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import LandingPage from '@/components/home/LandingPage';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import HeroSection, { ContestSection } from '@/components/home/HeroSection';
import ProductGrid from '@/components/product/ProductGrid';
import DynamicPopup from '@/components/ui/DynamicPopup';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const { darkMode } = useStore();

  // Check if user has already entered (stored in sessionStorage)
  useEffect(() => {
    const entered = sessionStorage.getItem('temporal-entered');
    if (entered === 'true') {
      setHasEntered(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('temporal-entered', 'true');
    setHasEntered(true);
  };

  if (!hasEntered) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="text-foreground bg-background">
        <MarqueeBanner />
        <Header />
        <Sidebar />
        <CartDrawer />
        <main>
          <HeroSection />
          <ContestSection />
          <ProductGrid />
        </main>
        <Footer />
        <DynamicPopup />
      </div>
    </div>
  );
}
