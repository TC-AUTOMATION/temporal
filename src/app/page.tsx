'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import LandingPage from '@/components/home/LandingPage';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import HeroSection from '@/components/home/HeroSection';
import ProductGrid from '@/components/product/ProductGrid';

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
      <div className={darkMode ? 'bg-black text-white' : 'bg-white text-black'}>
        <MarqueeBanner />
        <Header />
        <Sidebar />
        <CartDrawer />
        <main>
          <HeroSection />
          <ProductGrid />
        </main>
      </div>
    </div>
  );
}
