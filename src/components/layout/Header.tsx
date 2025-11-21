'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, User, ShoppingBag, X, Sun, Moon } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      // Le logo apparait dans le header après 300px de scroll
      setScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Afficher le logo si showLogo est true OU si on a scrollé
  const displayLogo = showLogo || scrolled;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm text-foreground border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        {/* Center - Logo ou Welcome text */}
        <div className="flex-1 text-center">
          <div className={`transition-all duration-300 ${displayLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {displayLogo && (
              <Link href="/">
                <TemporalLogo size={40} className="mx-auto" />
              </Link>
            )}
          </div>
          <div className={`transition-all duration-300 ${!displayLogo ? 'opacity-100' : 'opacity-0 absolute inset-0 flex items-center justify-center pointer-events-none'}`}>
            {!displayLogo && (
              <h1 className="text-lg font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{t.welcome}</h1>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-sm font-medium"
          >
            <span className={language === 'fr' ? 'underline' : ''}>FR</span>
            <span className="mx-1">/</span>
            <span className={language === 'en' ? 'underline' : ''}>EN</span>
          </Button>

          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile" aria-label="Profile">
              <User size={20} />
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div className="px-4 pb-3 bg-background">
          <div className="relative">
            <Input
              type="text"
              placeholder={t.search}
              className="pr-10"
              autoFocus
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      )}
    </header>
  );
}
