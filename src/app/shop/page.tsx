'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import PackCard from '@/components/product/PackCard';
import { Shirt, Tag, Grid3X3, Loader2, Package } from 'lucide-react';
import Link from 'next/link';

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

// Custom Set/Ensemble icon (shirt + pants combined)
const SetIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L9 4H6v4l2 1v4h8V9l2-1V4h-3l-3-2z" />
    <path d="M8 13h8l1 4-1 5h-3l-.5-4h-1l-.5 4H8l-1-5 1-4z" />
  </svg>
);

const getCategoryLabel = (id: string, language: string) => {
  const t = translations[language as keyof typeof translations];
  const labels: Record<string, string> = {
    all: t.viewAll,
    packs: 'Packs',
    ensembles: language === 'fr' ? 'Ensembles' : 'Sets',
    vestes: language === 'fr' ? 'Vestes' : 'Jackets',
    tshirts: 'T-Shirts',
    pantalons: language === 'fr' ? 'Pantalons' : 'Pants',
    accessoires: language === 'fr' ? 'Accessoires' : 'Accessories',
    offres: language === 'fr' ? 'Offres Spéciales' : 'Special Deals',
  };
  return labels[id] || id;
};

const categories = [
  { id: 'all', Icon: Grid3X3 },
  { id: 'packs', Icon: Package },
  { id: 'ensembles', Icon: SetIcon },
  { id: 'vestes', Icon: JacketIcon },
  { id: 'tshirts', Icon: Shirt },
  { id: 'pantalons', Icon: PantsIcon },
  { id: 'accessoires', Icon: BeanieIcon },
  { id: 'offres', Icon: Tag },
];

// Category header content
const categoryHeaders: Record<string, {
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  emptyFr?: string;
  emptyEn?: string;
}> = {
  all: {
    titleFr: 'COLLECTION',
    titleEn: 'COLLECTION',
    subtitleFr: 'Toutes nos pièces. Un seul objectif : te démarquer.',
    subtitleEn: 'All our pieces. One goal: stand out.',
  },
  packs: {
    titleFr: 'PACKS',
    titleEn: 'PACKS',
    subtitleFr: 'Nos lots exclusifs. Plusieurs pièces, un prix canon.',
    subtitleEn: 'Our exclusive bundles. Multiple pieces, one amazing price.',
    emptyFr: 'Aucun pack disponible pour le moment. Reviens bientôt.',
    emptyEn: 'No packs available right now. Check back soon.',
  },
  ensembles: {
    titleFr: 'ENSEMBLES',
    titleEn: 'SETS',
    subtitleFr: 'Look complet. Style assumé. Zéro compromis.',
    subtitleEn: 'Complete look. Bold style. No compromise.',
    emptyFr: 'Les ensembles débarquent bientôt. Active les notifications.',
    emptyEn: 'Sets dropping soon. Turn on notifications.',
  },
  vestes: {
    titleFr: 'VESTES',
    titleEn: 'JACKETS',
    subtitleFr: 'La pièce maîtresse de ton dressing.',
    subtitleEn: 'The statement piece of your wardrobe.',
  },
  tshirts: {
    titleFr: 'T-SHIRTS',
    titleEn: 'T-SHIRTS',
    subtitleFr: 'Coton premium. Coupe parfaite. Logo brodé.',
    subtitleEn: 'Premium cotton. Perfect fit. Embroidered logo.',
  },
  pantalons: {
    titleFr: 'PANTALONS',
    titleEn: 'PANTS',
    subtitleFr: 'Du confort sans sacrifier le style.',
    subtitleEn: 'Comfort without sacrificing style.',
  },
  accessoires: {
    titleFr: 'ACCESSOIRES',
    titleEn: 'ACCESSORIES',
    subtitleFr: 'Bonnets, stickers. Les petits détails qui font tout.',
    subtitleEn: 'Beanies, stickers. The little details that make all the difference.',
  },
  offres: {
    titleFr: 'OFFRES SPÉCIALES',
    titleEn: 'SPECIAL DEALS',
    subtitleFr: 'Drops exclusifs. Quantités limitées. Agis vite.',
    subtitleEn: 'Exclusive drops. Limited quantities. Act fast.',
    emptyFr: 'Pas d\'offre en cours. Reviens vite, ça ne va pas durer.',
    emptyEn: 'No current deals. Come back soon, they won\'t last.',
  },
};

// Wrapper component for Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}

// Loading component
function ShopLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );
}

// Main shop content
function ShopContent() {
  const searchParams = useSearchParams();
  const { language, darkMode } = useStore();
  const t = translations[language];

  // Get category from URL or default to 'all'
  const urlCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [products, setProducts] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync with URL changes
  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);

  // Fetch products or packs from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeCategory === 'packs') {
          const response = await fetch('/api/packs');
          if (!response.ok) throw new Error('Failed to fetch packs');
          const data = await response.json();
          setPacks(data.data?.packs || []);
          setProducts([]);
        } else {
          const params = new URLSearchParams();
          if (activeCategory !== 'all') {
            params.append('category', activeCategory);
          }
          const response = await fetch(`/api/products?${params.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          setProducts(data.data?.products || data.products || []);
          setPacks([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load');
        setProducts([]);
        setPacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  const filteredProducts = products;
  const header = categoryHeaders[activeCategory] || categoryHeaders.all;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main>
          {/* Category Hero Header */}
          <div className={`relative overflow-hidden ${darkMode ? 'bg-black' : 'bg-white'}`}>
            {/* === MODERN GRADIENT BACKGROUND === */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Primary gradient blob - more intense for offres */}
              <div
                className={`absolute -top-1/2 -right-1/4 w-[80%] h-[200%] blur-3xl ${activeCategory === 'offres' ? 'opacity-50' : 'opacity-30'}`}
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, rgba(91, 45, 142, 0.2) 40%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.3) 0%, rgba(91, 45, 142, 0.1) 40%, transparent 70%)',
                }}
              />

              {/* Secondary accent blob */}
              <div
                className={`absolute -bottom-1/2 -left-1/4 w-[60%] h-[150%] blur-3xl ${activeCategory === 'offres' ? 'opacity-40' : 'opacity-20'}`}
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.5) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.25) 0%, transparent 60%)',
                }}
              />

              {/* Subtle noise texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Bottom fade */}
              <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-transparent via-transparent to-black' : 'bg-gradient-to-b from-transparent via-transparent to-white'}`} />
            </div>

            {/* Accent line top - animated for offres */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent ${activeCategory === 'offres' ? 'animate-pulse' : ''}`} />

            <div className="relative max-w-7xl mx-auto px-4 pt-16 md:pt-20 pb-6">
              {/* Title */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1
                    className="text-5xl md:text-6xl lg:text-7xl leading-none"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                  >
                    {language === 'fr' ? header.titleFr : header.titleEn}
                  </h1>

                  {/* Subtitle */}
                  <p
                    className={`mt-3 text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {language === 'fr' ? header.subtitleFr : header.subtitleEn}
                  </p>
                </div>

                {/* Product count */}
                {(filteredProducts.length > 0 || packs.length > 0) && (
                  <div className="hidden md:flex items-baseline gap-2">
                    <span
                      className="text-4xl text-primary"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {activeCategory === 'packs' ? packs.length : filteredProducts.length}
                    </span>
                    <span
                      className={`text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.productsLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Navigation - Inside Hero */}
            <div className="relative max-w-7xl mx-auto px-4 pb-4">
              <div className={`inline-flex rounded-lg ${darkMode ? 'bg-black/40' : 'bg-white/30'} backdrop-blur-sm border ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
                <div className="flex gap-1 py-2 px-2">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const IconComponent = cat.Icon;
                    const isOffres = cat.id === 'offres';
                    return (
                      <Link
                        key={cat.id}
                        href={cat.id === 'all' ? '/shop' : `/shop?category=${cat.id}`}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`group relative flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all rounded-md ${
                          isActive
                            ? 'text-white'
                            : darkMode
                              ? 'text-white/70 hover:text-white'
                              : 'text-black/70 hover:text-black'
                        } ${isOffres ? 'promo-btn' : ''}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.9rem' }}
                      >
                        {/* Active background */}
                        <div
                          className={`absolute inset-0 rounded-md transition-all duration-300 ${
                            isActive
                              ? 'bg-primary opacity-100'
                              : isOffres
                                ? 'bg-gradient-to-r from-primary/20 to-accent/20 opacity-100 group-hover:opacity-100'
                                : 'bg-primary opacity-0 group-hover:opacity-10'
                          }`}
                        />

                        {/* Icon */}
                        <IconComponent size={14} className={`relative z-10 ${isActive ? 'text-white' : 'text-primary'}`} />

                        {/* Label */}
                        <span className="relative z-10">
                          {getCategoryLabel(cat.id, language)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-all"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.retry}
                </button>
              </div>
            ) : activeCategory === 'packs' && packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packs.map((pack: any) => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                {/* Empty state icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  {(() => {
                    const cat = categories.find(c => c.id === activeCategory);
                    const IconComponent = cat?.Icon || Grid3X3;
                    return <IconComponent size={32} className="text-primary" />;
                  })()}
                </div>

                <p
                  className="text-3xl md:text-4xl mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {t.comingSoon}
                </p>

                <p className={`max-w-md mx-auto ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {language === 'fr'
                    ? (header.emptyFr || 'Les produits de cette catégorie arrivent bientôt.')
                    : (header.emptyEn || 'Products in this category are coming soon.')}
                </p>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Grid3X3 size={16} />
                  {t.viewFullCollection}
                </Link>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
