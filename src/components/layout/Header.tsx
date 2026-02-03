'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, User, ShoppingBag, X, Heart } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { translations } from '@/lib/translations';
import TemporalStar from '@/components/ui/TemporalStar';
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
  const { wishlist } = useWishlistStore();
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
  const wishlistCount = wishlist.length;
  const displayLogo = showLogo || scrolled;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
      darkMode
        ? 'bg-black/90 text-white border-white/10'
        : 'bg-white/90 text-black border-black/10'
    }`}>
      <div className="relative flex items-center justify-between px-4 py-5 md:py-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`w-10 h-10 flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Theme toggle with Temporal Star */}
          <button
            onClick={toggleDarkMode}
            className={`relative w-16 h-8 rounded-full transition-all ${
              darkMode ? 'bg-white/20' : 'bg-black/10'
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                darkMode
                  ? 'left-9 bg-white rotate-180'
                  : 'left-1 bg-black rotate-0'
              }`}
            >
              <TemporalStar size={14} color={darkMode ? '#000000' : '#FFFFFF'} strokeWidth={8} />
            </div>
          </button>
        </div>

        {/* Center - Logo (visible after scroll) */}
        <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500 ${displayLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster=""
              className="w-[50px] h-[50px] md:w-[120px] md:h-[120px] object-contain"
              style={{ background: 'transparent', backgroundColor: 'transparent' }}
            >
              {/* Safari/iOS: HEVC with alpha */}
              <source src="/hero-video.mov" type='video/mp4; codecs="hvc1"' />
              {/* Chrome/Firefox: WebM with alpha */}
              <source src="/hero-video.webm" type="video/webm" />
            </video>
          </Link>
        </div>

        {/* Welcome text - large screens only (≥1150px), before scroll */}
        <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden min-[1150px]:block transition-all duration-500 ${!displayLogo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary" />
            <h1
              className="text-xl tracking-[0.3em] whitespace-nowrap"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {t.welcome}
            </h1>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language switcher - Streetwear style - desktop only */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="hidden md:block group relative h-10 w-20 overflow-hidden"
            aria-label="Toggle language"
          >
            {/* Background with diagonal split */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
              style={{
                background: `linear-gradient(135deg, var(--temporal-purple) 50%, var(--temporal-purple-light) 50%)`,
                transform: language === 'fr' ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />

            {/* Glitch lines on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-white/40" style={{ transform: 'translateX(-100%)', animation: 'slideRight 0.3s ease forwards' }} />
              <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-white/30" style={{ transform: 'translateX(100%)', animation: 'slideLeft 0.3s 0.1s ease forwards' }} />
              <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-white/20" style={{ transform: 'translateX(-100%)', animation: 'slideRight 0.3s 0.2s ease forwards' }} />
            </div>

            {/* Active language - Large */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="relative text-white font-bold tracking-wider transition-all duration-300"
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '1.1rem',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                }}
              >
                {language.toUpperCase()}
              </span>
            </div>

            {/* Inactive language - Small corner indicator */}
            <div
              className="absolute text-white/50 transition-all duration-300"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '0.6rem',
                top: language === 'fr' ? 'auto' : '2px',
                bottom: language === 'fr' ? '2px' : 'auto',
                right: '4px',
              }}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </div>

            {/* Border frame */}
            <div
              className="absolute inset-0 border-2 border-white/20 group-hover:border-white/40 transition-colors"
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/60" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/60" />
          </button>

          {/* Search - desktop only */}
          <button
            onClick={() => setSearchOpen(!isSearchOpen)}
            className={`hidden md:flex w-10 h-10 items-center justify-center transition-all hover:scale-110 ${
              isSearchOpen
                ? 'bg-primary text-primary-foreground'
                : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Search"
          >
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Wishlist - desktop only */}
          <Link
            href="/wishlist"
            className={`hidden md:flex relative w-10 h-10 items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-xs"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Profile - desktop only */}
          <Link
            href="/profile"
            className={`hidden md:flex w-10 h-10 items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Profile"
          >
            <User size={18} />
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative w-10 h-10 flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground flex items-center justify-center text-xs"
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
              className={`w-full pl-12 pr-4 py-3 border-2 transition-all ${
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
