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
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemporalLogo from '@/components/ui/TemporalLogo';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/promos', label: 'Codes Promo', icon: Tags },
  { href: '/admin/packs', label: 'Packs', icon: Gift },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-3">
              <TemporalLogo size={32} />
              <span className="font-bold text-lg">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link href="/">
            <Button variant="outline" className={`w-full ${!sidebarOpen && 'px-2'}`}>
              {sidebarOpen ? 'Retour au site' : '←'}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
      >
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find((item) =>
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            )?.label || 'Admin'}
          </h1>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
