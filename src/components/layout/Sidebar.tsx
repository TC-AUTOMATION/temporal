'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Sparkles, Instagram, User, Flame, Shirt, Layers, Footprints, Watch, X, Zap, Shield, LogOut } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';

export default function Sidebar() {
  const { language, darkMode, isSidebarOpen, setSidebarOpen, setSearchOpen } = useStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const t = translations[language];
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [isSidebarOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const menuItems = [
    { label: t.ensembles, href: '/shop?category=ensembles', icon: Flame },
    { label: t.vestes, href: '/shop?category=vestes', icon: Layers },
    { label: t.tshirts, href: '/shop?category=tshirts', icon: Shirt },
    { label: t.pantalons, href: '/shop?category=pantalons', icon: Footprints },
    { label: t.accessoires, href: '/shop?category=accessoires', icon: Watch },
  ];

  const handleSearchClick = () => {
    setSidebarOpen(false);
    setSearchOpen(true);
  };

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-2 top-2 bottom-2 md:left-4 md:top-4 md:bottom-4 w-72 md:w-80 z-50  overflow-hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        } ${
          darkMode
            ? 'bg-black border border-white/10'
            : 'bg-white border border-black/10'
        }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center justify-between">
            <TemporalLogo size={45} />
            <button
              onClick={handleClose}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all hover:scale-110 ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 md:p-4 flex-shrink-0">
          <button
            onClick={handleSearchClick}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
              darkMode
                ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                : 'bg-black/5 hover:bg-black/10 border border-black/10'
            }`}
          >
            <Search size={16} className="text-primary" />
            <span
              className="text-muted-foreground text-sm"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              RECHERCHER...
            </span>
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4">
          {/* Collections title */}
          <p
            className="text-primary text-xs mb-4 px-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.3em' }}
          >
            COLLECTIONS
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 transition-all group ${
                    darkMode
                      ? 'hover:bg-white/10'
                      : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${
                      darkMode ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <IconComponent size={14} className="text-primary" />
                    </div>
                    <span
                      className="group-hover:text-primary transition-colors text-sm"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {item.label.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}

            {/* Special offers */}
            <Link
              href="/shop?category=offres"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span
                  className="text-primary text-sm"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.offresSpeciales.toUpperCase()}
                </span>
              </div>
              <ChevronRight size={16} className="text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Divider */}
          <div className={`my-4 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />

          {/* About */}
          <p
            className="text-primary text-xs mb-2 px-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.3em' }}
          >
            À PROPOS
          </p>

          <Link
            href="/about"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <span
              className="text-muted-foreground group-hover:text-primary transition-colors text-sm"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.quiSommesNous.toUpperCase()}
            </span>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Admin link for admin users */}
        {isAuthenticated && user?.isAdmin && (
          <div className={`px-3 md:px-4 pb-2 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <Shield size={14} className="text-white" />
                </div>
                <span
                  className="text-primary text-sm"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  GESTION ADMIN
                </span>
              </div>
              <ChevronRight size={16} className="text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className={`p-3 md:p-4 border-t flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm transition-all hover:scale-105"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <User size={14} />
                    MON PROFIL
                  </button>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className={`w-9 h-9 flex items-center justify-center transition-all hover:scale-110 ${
                    darkMode ? 'bg-white/10 hover:bg-red-500/20' : 'bg-black/5 hover:bg-red-500/20'
                  }`}
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setSidebarOpen(false)}>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm transition-all hover:scale-105"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <User size={14} />
                  CONNEXION
                </button>
              </Link>
            )}
            <a
              href="https://www.instagram.com/temporal_clothes/"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 flex items-center justify-center transition-all hover:scale-110 ${
                darkMode ? 'bg-white/10 hover:bg-primary' : 'bg-black/5 hover:bg-primary hover:text-white'
              }`}
              aria-label="Instagram Temporal"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
