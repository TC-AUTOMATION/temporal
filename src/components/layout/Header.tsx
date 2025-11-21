'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, User, ShoppingBag, X, Sun, Moon } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface HeaderProps {
  showLogo?: boolean;
}

export default function Header({ showLogo = false }: HeaderProps) {
  const {
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    cart,
    setCartOpen,
    setSidebarOpen,
    setSearchOpen,
    isSearchOpen,
  } = useStore();
  const t = translations[language];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const displayLogo = showLogo || scrolled;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
      darkMode
        ? 'bg-black/90 text-white border-white/10'
        : 'bg-white/90 text-black border-black/10'
    }`}>
      <div className="relative flex items-center justify-between px-4 py-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode
                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Center - Logo ou Welcome text */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className={`transition-all duration-500 ${displayLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
            {displayLogo && (
              <Link href="/" className="inline-block hover:scale-105 transition-transform">
                <TemporalLogo size={45} className="mx-auto" />
              </Link>
            )}
          </div>
          <div className={`transition-all duration-500 ${!displayLogo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {!displayLogo && (
              <div className="flex items-center gap-3">
                <div className="hidden md:block h-[1px] w-8 bg-gradient-to-r from-transparent to-primary" />
                <h1
                  className="text-base md:text-xl tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.welcome}
                </h1>
                <div className="hidden md:block h-[1px] w-8 bg-gradient-to-l from-transparent to-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage('fr')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                language === 'fr'
                  ? 'bg-primary text-primary-foreground'
                  : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.85rem' }}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.85rem' }}
            >
              EN
            </button>
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(!isSearchOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              isSearchOpen
                ? 'bg-primary text-primary-foreground'
                : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Search"
          >
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Profile */}
          <Link
            href="/profile"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Profile"
          >
            <User size={18} />
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t.search}
              className={`w-full rounded-full pl-12 pr-4 py-3 border-2 transition-all ${
                darkMode
                  ? 'bg-white/5 border-white/20 focus:border-primary'
                  : 'bg-black/5 border-black/10 focus:border-primary'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              autoFocus
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
