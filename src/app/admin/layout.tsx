'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import TemporalLogo from '@/components/ui/TemporalLogo';

const navItems = [
  { href: '/admin', label: 'DASHBOARD', icon: LayoutDashboard },
  { href: '/admin/products', label: 'PRODUITS', icon: Package },
  { href: '/admin/orders', label: 'COMMANDES', icon: ShoppingCart },
  { href: '/admin/promos', label: 'CODES PROMO', icon: Tags },
  { href: '/admin/packs', label: 'PACKS', icon: Gift },
  { href: '/admin/settings', label: 'PARAMÈTRES', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-black border-r border-white/10 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-3">
              <TemporalLogo size={36} />
              <span
                className="text-lg tracking-wider"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                ADMIN
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors ${!sidebarOpen && 'mx-auto'}`}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  } ${!sidebarOpen && 'justify-center px-2'}`}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link href="/">
            <div
              className={`flex items-center gap-3 px-4 py-3 border border-white/20 hover:border-primary hover:text-primary transition-all ${!sidebarOpen && 'justify-center px-2'}`}
            >
              <ExternalLink size={18} />
              {sidebarOpen && (
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
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
        <header className="h-20 bg-black border-b border-white/10 flex items-center px-8">
          <h1
            className="text-2xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {navItems.find((item) =>
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            )?.label || 'ADMIN'}
          </h1>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
