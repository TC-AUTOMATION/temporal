'use client';

import { Instagram, Twitter, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { useStore } from '@/stores/useStore';

export default function Footer() {
  const { darkMode } = useStore();

  return (
    <footer className={`relative overflow-hidden ${darkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Main footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Big brand statement */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-6xl lg:text-7xl uppercase mb-6"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            JOIN THE <span className="text-primary">MOVEMENT</span>
          </h2>
          <p className={`max-w-xl mx-auto mb-8 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
            Streetwear premium pour ceux qui osent être différents. Éditions limitées, qualité exceptionnelle.
          </p>

          {/* Newsletter */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="TON@EMAIL.COM"
              className={`flex-1 rounded-full px-6 py-4 focus:outline-none focus:border-primary transition-all ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40' : 'bg-black/5 border border-black/20 text-black placeholder:text-black/40'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-4 flex items-center justify-center gap-2 transition-all hover:scale-105"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
            >
              <Zap size={18} />
              REJOINDRE
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <TemporalLogo size={100} />
            </div>
            <p
              className={`uppercase tracking-wider text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
            >
              EST. 2024 • FRANCE
            </p>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full hover:bg-primary flex items-center justify-center transition-all hover:scale-110 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full hover:bg-primary flex items-center justify-center transition-all hover:scale-110 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@temporal_clothes"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full hover:bg-primary flex items-center justify-center transition-all hover:scale-110 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4
              className="mb-6"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '1.1rem' }}
            >
              SHOP
            </h4>
            <ul className="space-y-4">
              {['Vestes', 'T-shirts', 'Pantalons', 'Accessoires', 'Nouveautés'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/shop?category=${item.toLowerCase()}`}
                    className={`hover:text-primary transition-all flex items-center gap-2 group ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h4
              className="mb-6"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '1.1rem' }}
            >
              AIDE
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'FAQ', href: '/faq' },
                { label: 'Livraison', href: '/shipping' },
                { label: 'Retours', href: '/returns' },
                { label: 'Guide des tailles', href: '/size-guide' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`hover:text-primary transition-all flex items-center gap-2 group ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="mb-6"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em', fontSize: '1.1rem' }}
            >
              CONTACT
            </h4>
            <div className={`space-y-4 ${darkMode ? 'text-white/60' : 'text-black/60'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              <p>CONTACT@TEMPORAL.FR</p>
              <p>PARIS, FRANCE</p>
            </div>

            {/* Payment icons placeholder */}
            <div className="mt-8">
              <p
                className={`text-xs mb-3 ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
              >
                PAIEMENT SÉCURISÉ
              </p>
              <div className="flex gap-2">
                {['VISA', 'MC', 'AMEX', 'PP'].map((payment) => (
                  <div
                    key={payment}
                    className={`w-12 h-8 rounded flex items-center justify-center text-xs ${darkMode ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {payment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-[1px] bg-gradient-to-r from-transparent to-transparent mb-8 ${darkMode ? 'via-white/20' : 'via-black/20'}`} />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Legal links */}
          <div
            className={`flex flex-wrap justify-center gap-6 ${darkMode ? 'text-white/40' : 'text-black/40'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.8rem' }}
          >
            <Link href="/privacy" className="hover:text-primary transition-colors">CONFIDENTIALITÉ</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">CGV</Link>
            <Link href="/legal" className="hover:text-primary transition-colors">MENTIONS LÉGALES</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">COOKIES</Link>
          </div>

          {/* Copyright */}
          <p
            className={darkMode ? 'text-white/40' : 'text-black/40'}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.8rem' }}
          >
            © 2024 TEMPORAL. TOUS DROITS RÉSERVÉS.
          </p>
        </div>
      </div>

      {/* Giant background text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <p
          className={`text-[15vw] leading-none whitespace-nowrap ${darkMode ? 'text-white/[0.02]' : 'text-black/[0.03]'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          TEMPORAL TEMPORAL TEMPORAL
        </p>
      </div>
    </footer>
  );
}
