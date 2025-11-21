'use client';

import { Menu, Search, User, ShoppingBag, X, Sun, Moon } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className={`sticky top-0 z-40 ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full border-2 flex items-center gap-1 ${
              darkMode ? 'border-white' : 'border-black'
            }`}
            aria-label="Toggle theme"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-white' : 'bg-black'
            }`}>
              {darkMode ? (
                <Sun size={14} className="text-black" />
              ) : (
                <Moon size={14} className="text-white" />
              )}
            </div>
          </button>
        </div>

        {/* Center - Welcome text or Logo */}
        <div className="flex-1 text-center">
          {showLogo ? (
            <TemporalLogo size={40} className="mx-auto" />
          ) : (
            <h1 className="text-lg font-medium">{t.welcome}</h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
          >
            <span className={language === 'fr' ? 'underline' : ''}>FR</span>
            <span className="mx-1">/</span>
            <span className={language === 'en' ? 'underline' : ''}>EN</span>
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(!isSearchOpen)}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Profile */}
          <a
            href="/profile"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Profile"
          >
            <User size={20} />
          </a>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 hover:opacity-70 transition-opacity relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-temporal-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div className={`px-4 pb-3 ${darkMode ? 'bg-black' : 'bg-white'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder={t.search}
              className={`w-full px-4 py-2 pr-10 border rounded ${
                darkMode
                  ? 'bg-black border-white text-white placeholder-gray-400'
                  : 'bg-white border-black text-black placeholder-gray-600'
              }`}
              autoFocus
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
            />
          </div>
        </div>
      )}
    </header>
  );
}
