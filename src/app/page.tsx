'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import { useAdminStore } from '@/stores/useAdminStore';
import LandingPage from '@/components/home/LandingPage';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import { ContestSection } from '@/components/home/HeroSection';
import ProductGrid from '@/components/product/ProductGrid';
import PackGrid from '@/components/product/PackGrid';
import DynamicPopup from '@/components/ui/DynamicPopup';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const { darkMode } = useStore();
  const { siteMode: localSiteMode, setSiteMode } = useAdminStore();
  const [siteMode, setSiteModeLocal] = useState(localSiteMode);

  // Fetch the real siteMode from server (not just localStorage)
  useEffect(() => {
    fetch('/api/settings/site-mode')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.siteMode) {
          setSiteModeLocal(json.data.siteMode);
          if (json.data.siteMode !== localSiteMode) setSiteMode(json.data.siteMode);
        }
      })
      .catch(() => {});
  }, []);

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

  // In countdown mode, skip the landing page entirely
  if (!hasEntered && siteMode === 'password') {
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
          <PackGrid limit={2} />
          <ProductGrid />
        </main>
        <Footer />
        <DynamicPopup />
      </div>
    </div>
  );
}
