'use client';

import { Search, ChevronRight, Sparkles, Instagram, User, Flame, Shirt, Layers, Footprints, Watch } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const { language, isSidebarOpen, setSidebarOpen, setSearchOpen } = useStore();
  const t = translations[language];

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

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-80 bg-card border-border p-0">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <TemporalLogo size={50} />
          </div>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigation principale</SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="p-4">
          <Button
            variant="secondary"
            className="w-full justify-start gap-3 h-12 rounded-xl"
            onClick={handleSearchClick}
          >
            <Search size={18} className="text-muted-foreground" />
            <span className="text-muted-foreground">Rechercher...</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          {/* Collections */}
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4 px-2">Collections</p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-12 rounded-xl px-4 hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={20} className="text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Button>
                </Link>
              );
            })}

            {/* Special offers */}
            <Link href="/shop?category=offres" onClick={() => setSidebarOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-between h-12 rounded-xl px-4 border-primary/30 bg-primary/10 hover:bg-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-bold text-primary">{t.offresSpeciales}</span>
                </div>
                <ChevronRight size={18} className="text-primary/50" />
              </Button>
            </Link>
          </div>

          <Separator className="my-6" />

          {/* About */}
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4 px-2">À propos</p>
          <Link href="/about" onClick={() => setSidebarOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-xl px-4 hover:bg-secondary"
            >
              <span className="text-muted-foreground font-medium">{t.quiSommesNous}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Button>
          </Link>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Link href="/login" onClick={() => setSidebarOpen(false)}>
              <Button variant="secondary" size="sm" className="rounded-full gap-2">
                <User size={16} />
                <span>Connexion</span>
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-full" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram size={18} />
                </a>
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full" asChild>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                  <span className="text-xs font-bold">TT</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
