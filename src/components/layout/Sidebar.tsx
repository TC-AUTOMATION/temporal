'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Sparkles, Instagram, User, Shirt, Watch, X, Tag, Shield, LogOut, Globe, Camera, Info, Package } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';

// Custom Jacket icon
const JacketIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 2H9L7 7L2 9v10l3 1v-8l2 1v10h10V13l2-1v8l3-1V9l-5-2-2-5z" />
  </svg>
);

// Custom Pants icon
const PantsIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2h12l1 7-2 13h-4l-1-11-1 11H7L5 9l1-7z" />
  </svg>
);

// Custom Beanie icon
const BeanieIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="7" rx="8" ry="5" />
    <path d="M4 7c0 5 3.5 9 8 9s8-4 8-9" />
    <path d="M12 2v2" />
    <circle cx="12" cy="2" r="1" />
  </svg>
);

export default function Sidebar() {
  const { language, setLanguage, darkMode, isSidebarOpen, setSidebarOpen, setSearchOpen } = useStore();
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
    { label: t.packs, href: '/shop?category=packs', icon: Package },
    { label: t.vestes, href: '/shop?category=vestes', icon: JacketIcon },
    { label: t.tshirts, href: '/shop?category=tshirts', icon: Shirt },
    { label: t.pantalons, href: '/shop?category=pantalons', icon: PantsIcon },
    { label: t.accessoires, href: '/shop?category=accessoires', icon: BeanieIcon },
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
            <TemporalLogoStatic size={45} />
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
              {t.searchPlaceholder.toUpperCase()}
            </span>
          </button>

          {/* Language & Profile - Mobile only */}
          <div className="flex md:hidden gap-2 mt-3">
            {/* Language switcher */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all ${
                darkMode
                  ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 border border-black/10'
              }`}
            >
              <Globe size={16} className="text-primary" />
              <span
                className="text-sm"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language.toUpperCase()}
              </span>
            </button>

            {/* Profile link */}
            <Link
              href="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all ${
                darkMode
                  ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 border border-black/10'
              }`}
            >
              <User size={16} className="text-primary" />
              <span
                className="text-sm"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.profile}
              </span>
            </Link>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4">
          {/* Categories title */}
          <p
            className="text-primary text-xs mb-4 px-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.3em' }}
          >
            {t.categories}
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
                      className={`group-hover:text-primary transition-colors text-sm ${darkMode ? 'text-white' : 'text-black'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {item.label.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight size={16} className={`group-hover:text-primary group-hover:translate-x-1 transition-all ${darkMode ? 'text-white/50' : 'text-muted-foreground'}`} />
                </Link>
              );
            })}

            {/* Special offers */}
            <Link
              href="/shop?category=offres"
              onClick={() => setSidebarOpen(false)}
              className="promo-btn flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <Tag size={14} className="text-white" />
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
            {t.about}
          </p>

          <Link
            href="/about"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${
                darkMode ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <Info size={14} className="text-primary" />
              </div>
              <span
                className={`group-hover:text-primary transition-colors text-sm ${darkMode ? 'text-white/70' : 'text-muted-foreground'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.quiSommesNous.toUpperCase()}
              </span>
            </div>
            <ChevronRight size={16} className={`group-hover:text-primary group-hover:translate-x-1 transition-all ${darkMode ? 'text-white/50' : 'text-muted-foreground'}`} />
          </Link>

          <Link
            href="/concours"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${
                darkMode ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <Sparkles size={14} className="text-primary" />
              </div>
              <span
                className={`group-hover:text-primary transition-colors text-sm ${darkMode ? 'text-white/70' : 'text-muted-foreground'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.concoursTitle}
              </span>
            </div>
            <ChevronRight size={16} className={`group-hover:text-primary group-hover:translate-x-1 transition-all ${darkMode ? 'text-white/50' : 'text-muted-foreground'}`} />
          </Link>

          <Link
            href="/community"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${
                darkMode ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <Camera size={14} className="text-primary" />
              </div>
              <span
                className={`group-hover:text-primary transition-colors text-sm ${darkMode ? 'text-white/70' : 'text-muted-foreground'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.yourLooks}
              </span>
            </div>
            <ChevronRight size={16} className={`group-hover:text-primary group-hover:translate-x-1 transition-all ${darkMode ? 'text-white/50' : 'text-muted-foreground'}`} />
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
                  {t.adminManagement}
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
                    {t.myProfile}
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
                  title={t.logout}
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
                  {t.signIn}
                </button>
              </Link>
            )}
            {/* Social icons grouped together */}
            <div className="flex items-center gap-2">
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
              <a
                href="https://www.tiktok.com/@temporal_clothes"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 flex items-center justify-center transition-all hover:scale-110 ${
                  darkMode ? 'bg-white/10 hover:bg-primary' : 'bg-black/5 hover:bg-primary hover:text-white'
                }`}
                aria-label="TikTok Temporal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
