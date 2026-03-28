'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Gift,
  Settings,
  Menu,
  ChevronLeft,
  ExternalLink,
  LogOut,
  User,
  Search,
  MessageSquare,
  Sticker,
  Bell,
  Mail,
  Trophy,
  Gauge,
  ScrollText,
  Ruler,
  WashingMachine,
  Printer,
  Eye,
  TrendingUp,
} from 'lucide-react';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import TemporalStar from '@/components/ui/TemporalStar';
import NotificationBell from '@/components/admin/NotificationBell';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';

const navItems = [
  { href: '/admin', labelFr: 'TABLEAU DE BORD', labelEn: 'DASHBOARD', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', labelFr: 'PRODUITS', labelEn: 'PRODUCTS', icon: Package },
  { href: '/admin/stickers', labelFr: 'COMMANDE STICKERS', labelEn: 'STICKERS ORDER', icon: Sticker },
  { href: '/admin/orders', labelFr: 'COMMANDES', labelEn: 'ORDERS', icon: ShoppingCart, exact: true },
  { href: '/admin/cart-spy', labelFr: 'PANIERS', labelEn: 'CART SPY', icon: Eye },
  { href: '/admin/orders/print-station', labelFr: 'IMPRESSION', labelEn: 'PRINT STATION', icon: Printer },
  { href: '/admin/users', labelFr: 'UTILISATEURS', labelEn: 'USERS', icon: User },
  { href: '/admin/tickets', labelFr: 'TICKETS', labelEn: 'TICKETS', icon: MessageSquare },
  { href: '/admin/promos', labelFr: 'CODES PROMO', labelEn: 'PROMO CODES', icon: Tags },
  { href: '/admin/contests', labelFr: 'CONCOURS', labelEn: 'CONTESTS', icon: Trophy },
  { href: '/admin/gauge', labelFr: 'JAUGE CONCOURS', labelEn: 'CONTEST GAUGE', icon: Gauge },
  { href: '/admin/marquee', labelFr: 'BANDEAU DÉFILANT', labelEn: 'MARQUEE BANNER', icon: ScrollText },
  { href: '/admin/size-guides', labelFr: 'GUIDES TAILLES', labelEn: 'SIZE GUIDES', icon: Ruler },
  { href: '/admin/care-guides', labelFr: 'GUIDES LAVAGE', labelEn: 'CARE GUIDES', icon: WashingMachine },
  { href: '/admin/upsells', labelFr: 'UPSELLS', labelEn: 'UPSELLS', icon: TrendingUp },
  { href: '/admin/packs', labelFr: 'PACKS', labelEn: 'PACKS', icon: Gift },
  { href: '/admin/popups', labelFr: 'POPUPS', labelEn: 'POPUPS', icon: Bell },
  { href: '/admin/newsletter', labelFr: 'NEWSLETTER', labelEn: 'NEWSLETTER', icon: Mail },
  { href: '/admin/settings', labelFr: 'PARAMÈTRES', labelEn: 'SETTINGS', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { orders } = useAdminStore();
  const { darkMode, toggleDarkMode, language, setLanguage } = useStore();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Wait for Zustand persist rehydration before checking auth
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setStoreHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setStoreHydrated(true);
    });
    return () => { unsub(); };
  }, []);

  // Redirect if not admin — only after store has rehydrated
  useEffect(() => {
    if (storeHydrated && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/login');
    }
  }, [storeHydrated, isAuthenticated, user, router]);

  if (!storeHydrated || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <TemporalLogoStatic size={60} />
          <p className="mt-4 text-white/60">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const currentPage = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/admin'
  ) || navItems[0];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${darkMode ? 'bg-black/50 border-r border-white/5' : 'bg-white/80 border-r border-gray-200'}`}
      >
        {/* Logo */}
        <div className={`h-20 flex items-center justify-between px-4 border-b ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3">
              <TemporalLogoStatic size={36} />
              <div>
                <span
                  className="text-lg tracking-wider block"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                >
                  TEMPORAL
                </span>
                <span className="text-[10px] text-primary tracking-widest">ADMIN PANEL</span>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto">
              <TemporalLogoStatic size={36} />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${!sidebarOpen && 'hidden'} ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {sidebarOpen && (
            <p className={`text-[10px] uppercase tracking-widest px-4 py-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
              {language === 'fr' ? 'Menu' : 'Menu'}
            </p>
          )}
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/admin';
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : darkMode
                        ? 'text-white/50 hover:bg-white/5 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  } ${!sidebarOpen && 'justify-center px-3'}`}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                      {language === 'fr' ? item.labelFr : item.labelEn}
                    </span>
                  )}
                  {item.href === '/admin/orders' && pendingOrdersCount > 0 && sidebarOpen && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
          {/* Toggle button when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={`w-full flex items-center justify-center py-3 mb-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
          )}

          {/* View site link */}
          <Link href="/">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border hover:border-primary/50 hover:bg-primary/10 transition-all ${!sidebarOpen && 'justify-center px-3'} ${darkMode ? 'border-white/10' : 'border-gray-200'}`}
            >
              <ExternalLink size={18} className="text-primary" />
              {sidebarOpen && (
                <span
                  className={darkMode ? 'text-white/70' : 'text-gray-600'}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.85rem' }}
                >
                  {language === 'fr' ? 'VOIR LE SITE' : 'VIEW SITE'}
                </span>
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top bar */}
        <header className={`sticky top-0 z-30 h-20 backdrop-blur-xl flex items-center justify-between px-8 ${darkMode ? 'bg-[#0a0a0a]/80 border-b border-white/5' : 'bg-white/80 border-b border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {currentPage ? (language === 'fr' ? currentPage.labelFr : currentPage.labelEn) : 'ADMIN'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
              <Search size={16} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                className={`bg-transparent border-none outline-none text-sm w-40 ${darkMode ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-400'}`}
              />
            </div>

            {/* Language toggle - Streetwear style */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="group relative h-10 w-20 overflow-hidden"
              aria-label="Toggle language"
              title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
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
                <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-white/40" />
                <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-white/30" />
                <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-white/20" />
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
              <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/40 transition-colors" />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/60" />
            </button>

            {/* Theme toggle with Temporal Star */}
            <button
              onClick={toggleDarkMode}
              className={`relative w-16 h-8 rounded-full transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  darkMode
                    ? 'left-9 bg-white rotate-180'
                    : 'left-1 bg-primary rotate-0'
                }`}
              >
                <TemporalStar size={14} color={darkMode ? '#000000' : '#FFFFFF'} strokeWidth={8} />
              </div>
            </button>

            {/* Notifications */}
            <NotificationBell darkMode={darkMode} />

            {/* User menu */}
            <div className={`flex items-center gap-3 pl-4 border-l ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.firstName || 'Admin'}</p>
                <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors ${darkMode ? 'text-white/50' : 'text-gray-400'}`}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
