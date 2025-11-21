'use client';

import { Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <TemporalLogo size={80} />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Streetwear premium pour ceux qui osent être différents.
              Éditions limitées, qualité exceptionnelle.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="icon" className="rounded-full" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram size={18} />
                </a>
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter size={18} />
                </a>
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full" asChild>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                  <span className="font-bold text-sm">TT</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6 text-sm">Shop</h4>
            <ul className="space-y-3">
              {['Vestes', 'T-shirts', 'Pantalons', 'Accessoires', 'Nouveautés'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/shop?category=${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6 text-sm">Aide</h4>
            <ul className="space-y-3">
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
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-foreground font-bold uppercase tracking-wider mb-6 text-sm">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Inscris-toi pour recevoir les dernières news et accéder aux drops en avant-première.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="ton@email.com"
                className="rounded-full"
              />
              <Button type="submit" className="rounded-full px-6">
                GO
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">CGV</Link>
            <Link href="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2024 TEMPORAL. Tous droits réservés.
          </p>
        </div>
      </div>

    </footer>
  );
}
