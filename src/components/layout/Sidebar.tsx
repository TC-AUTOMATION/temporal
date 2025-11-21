'use client';

import { X, Search } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';

export default function Sidebar() {
  const { language, darkMode, isSidebarOpen, setSidebarOpen } = useStore();
  const t = translations[language];

  if (!isSidebarOpen) return null;

  const menuItems = [
    { label: t.ensembles, href: '/products?category=ensembles' },
    { label: t.vestes, href: '/products?category=vestes' },
    { label: t.tshirts, href: '/products?category=tshirts' },
    { label: t.pantalons, href: '/products?category=pantalons' },
    { label: t.accessoires, href: '/products?category=accessoires' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform ${
          darkMode ? 'bg-black text-white' : 'bg-white text-black'
        }`}
      >
        <div className="p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="mb-6 hover:opacity-70 transition-opacity"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <span>{t.search}</span>
            <Search size={18} />
          </div>

          {/* Menu items */}
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-lg font-medium hover:opacity-70 transition-opacity"
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Special offers - purple */}
            <Link
              href="/products?category=offres"
              className="block text-lg font-medium text-[#5B2D8E] hover:opacity-70 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            >
              {t.offresSpeciales}
            </Link>
          </nav>

          {/* About us */}
          <div className="mt-8 pt-4 border-t border-current/20">
            <Link
              href="/about"
              className="block text-lg font-medium hover:opacity-70 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            >
              {t.quiSommesNous}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
