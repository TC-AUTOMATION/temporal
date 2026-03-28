'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import {
  Package,
  ChevronLeft,
  ShoppingBag,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Variant {
  id: string;
  color: string;
  colorHex: string | null;
  size: string;
  stock: number;
}

interface PackProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  variants: Variant[];
}

interface PackItem {
  id: string;
  productId: string;
  quantity: number;
  product: PackProduct;
}

interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  items: PackItem[];
  originalPrice: number;
  discount: number;
  discountPercent: number;
}

export default function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { darkMode, language, addToCart, setCartOpen } = useStore();

  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch pack data
  useEffect(() => {
    const fetchPack = async () => {
      try {
        const res = await fetch('/api/packs');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const packs: Pack[] = data.data?.packs || [];
        const found = packs.find((p) => p.slug === slug);
        if (!found) {
          setError(language === 'fr' ? 'Pack introuvable' : 'Pack not found');
        } else {
          setPack(found);
        }
      } catch {
        setError(language === 'fr' ? 'Erreur de chargement' : 'Loading error');
      } finally {
        setLoading(false);
      }
    };
    fetchPack();
  }, [slug, language]);

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    setAddedToCart(false);
  };

  const allSizesSelected = pack
    ? pack.items.every((item) => {
        const hasVariants = item.product.variants.length > 0;
        if (!hasVariants) return true;
        // Check if this product has size options
        const sizes = getAvailableSizes(item.product);
        if (sizes.length === 0) return true;
        return !!selectedSizes[item.product.id];
      })
    : false;

  const handleAddToCart = () => {
    if (!pack || !allSizesSelected) return;

    // Distribute pack price proportionally across items
    const totalOriginal = pack.originalPrice;

    pack.items.forEach((item) => {
      const itemOriginalTotal = Number(item.product.price) * item.quantity;
      const ratio = totalOriginal > 0 ? itemOriginalTotal / totalOriginal : 1 / pack.items.length;
      const itemPackPrice = Math.round(pack.price * ratio * 100) / 100;

      const selectedSize = selectedSizes[item.product.id] || '';
      const variant = item.product.variants.find(
        (v) => v.size === selectedSize
      );

      addToCart({
        id: item.product.id,
        name: item.product.name,
        price: itemPackPrice / item.quantity,
        size: selectedSize,
        color: variant?.color || '',
        quantity: item.quantity,
        image: item.product.images[0] || '',
      });
    });

    setAddedToCart(true);
    setTimeout(() => setCartOpen(true), 300);
  };

  if (loading) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <MarqueeBanner />
          <Header showLogo />
          <Sidebar />
          <CartDrawer />
          <SearchOverlay />
          <div className="flex items-center justify-center py-40">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <MarqueeBanner />
          <Header showLogo />
          <Sidebar />
          <CartDrawer />
          <SearchOverlay />
          <div className="flex flex-col items-center justify-center py-40 px-4">
            <AlertCircle size={48} className="text-primary mb-4" />
            <p className="text-xl mb-6" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
              {error || 'Pack introuvable'}
            </p>
            <Link
              href="/shop?category=packs"
              className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'RETOUR AUX PACKS' : 'BACK TO PACKS'}
            </Link>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const hasDiscount = pack.discount > 0;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="max-w-6xl mx-auto px-4 pt-8 pb-20">
          {/* Breadcrumb */}
          <Link
            href="/shop?category=packs"
            className={`inline-flex items-center gap-2 mb-8 text-sm hover:text-primary transition-colors ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <ChevronLeft size={16} />
            {language === 'fr' ? 'RETOUR AUX PACKS' : 'BACK TO PACKS'}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Pack image grid */}
              <div className="grid grid-cols-2 gap-3">
                {pack.items.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={item.product.images[0] || ''}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        {item.product.name}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pack details + size selection */}
            <div>
              {/* Pack header */}
              <div className="mb-8">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Package size={14} />
                  PACK
                </div>

                <h1
                  className="text-4xl md:text-5xl mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                >
                  {pack.name}
                </h1>

                {pack.description && (
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    {pack.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-4 mt-6">
                  <span
                    className="text-4xl text-primary"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {pack.price.toFixed(2)}€
                  </span>
                  {hasDiscount && (
                    <>
                      <span
                        className={`text-xl line-through ${darkMode ? 'text-white/30' : 'text-gray-400'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {pack.originalPrice.toFixed(2)}€
                      </span>
                      <span
                        className="bg-primary/20 text-primary px-2 py-0.5 text-sm"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        -{pack.discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Contents */}
                <div className={`mt-4 text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    {language === 'fr' ? 'CONTIENT' : 'INCLUDES'}:
                  </span>{' '}
                  {pack.items.map((item) => `${item.quantity}x ${item.product.name}`).join(' + ')}
                </div>
              </div>

              {/* Size selection for each product */}
              <div className="space-y-6 mb-8">
                {pack.items.map((item) => {
                  const sizes = getAvailableSizes(item.product);
                  if (sizes.length === 0) return null;

                  const selectedSize = selectedSizes[item.product.id];

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0] || ''}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {item.product.name}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                            {language === 'fr' ? 'Choisir une taille' : 'Select a size'}
                          </p>
                        </div>
                        {selectedSize && (
                          <Check size={18} className="text-green-500 ml-auto" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const isSelected = selectedSize === size.name;
                          const isAvailable = size.stock > 0;

                          return (
                            <button
                              key={size.name}
                              onClick={() => isAvailable && handleSizeSelect(item.product.id, size.name)}
                              disabled={!isAvailable}
                              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                isSelected
                                  ? 'bg-primary border-primary text-white'
                                  : isAvailable
                                    ? darkMode
                                      ? 'bg-white/5 border-white/20 text-white hover:border-primary/50'
                                      : 'bg-white border-gray-300 text-gray-900 hover:border-primary/50'
                                    : 'opacity-30 cursor-not-allowed line-through'
                              } ${darkMode ? 'border-white/10' : 'border-gray-200'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {size.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={!allSizesSelected || addedToCart}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : allSizesSelected
                      ? 'bg-primary hover:bg-primary/90 text-white hover:scale-[1.02]'
                      : darkMode
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {addedToCart ? (
                  <>
                    <Check size={22} />
                    {language === 'fr' ? 'AJOUTÉ AU PANIER' : 'ADDED TO CART'}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={22} />
                    {allSizesSelected
                      ? language === 'fr'
                        ? 'AJOUTER LE PACK AU PANIER'
                        : 'ADD PACK TO CART'
                      : language === 'fr'
                        ? 'SÉLECTIONNER LES TAILLES'
                        : 'SELECT SIZES'}
                  </>
                )}
              </button>

              {/* Help text */}
              {!allSizesSelected && pack.items.some((item) => getAvailableSizes(item.product).length > 0) && (
                <p className={`text-center text-xs mt-3 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  {language === 'fr'
                    ? 'Sélectionnez une taille pour chaque produit du pack'
                    : 'Select a size for each product in the pack'}
                </p>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

/** Get available sizes for a product, aggregated across colors */
function getAvailableSizes(product: PackProduct): { name: string; stock: number }[] {
  const sizeMap = new Map<string, number>();
  for (const v of product.variants) {
    const existing = sizeMap.get(v.size) || 0;
    sizeMap.set(v.size, existing + v.stock);
  }
  // Sort sizes in standard order
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'TU'];
  return Array.from(sizeMap.entries())
    .map(([name, stock]) => ({ name, stock }))
    .sort((a, b) => {
      const ai = sizeOrder.indexOf(a.name);
      const bi = sizeOrder.indexOf(b.name);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}
