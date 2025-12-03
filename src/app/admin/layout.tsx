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
  Bell,
  Search,
  MessageSquare,
} from 'lucide-react';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAdminStore } from '@/stores/useAdminStore';

const navItems = [
  { href: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'PRODUITS', icon: Package },
  { href: '/admin/orders', label: 'COMMANDES', icon: ShoppingCart },
  { href: '/admin/tickets', label: 'TICKETS', icon: MessageSquare },
  { href: '/admin/promos', label: 'CODES PROMO', icon: Tags },
  { href: '/admin/packs', label: 'PACKS', icon: Gift },
  { href: '/admin/settings', label: 'PARAMÈTRES', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { orders } = useAdminStore();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <TemporalLogo size={60} />
          <p className="mt-4 text-white/60">Chargement...</p>
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-black/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/5">
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3">
              <TemporalLogo size={36} />
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
              <TemporalLogo size={36} />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${!sidebarOpen && 'hidden'}`}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {sidebarOpen && (
            <p className="text-[10px] text-white/30 uppercase tracking-widest px-4 py-2">Menu</p>
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
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  } ${!sidebarOpen && 'justify-center px-3'}`}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                      {item.label}
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
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          {/* Toggle button when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex items-center justify-center py-3 mb-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}

          {/* View site link */}
          <Link href="/">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all ${!sidebarOpen && 'justify-center px-3'}`}
            >
              <ExternalLink size={18} className="text-primary" />
              {sidebarOpen && (
                <span
                  className="text-white/70"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.85rem' }}
                >
                  VOIR LE SITE
                </span>
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {currentPage?.label || 'ADMIN'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <Search size={16} className="text-white/40" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-40"
              />
            </div>

            {/* Notifications */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Bell size={18} className="text-white/70" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-white">{user?.firstName || 'Admin'}</p>
                <p className="text-xs text-white/40">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                title="Déconnexion"
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
