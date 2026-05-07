'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import Image from 'next/image';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import { Heart, ArrowLeft, Loader2, ShoppingBag, Trash2, X } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { language, darkMode, addToCart, setCartOpen } = useStore();
  const { isAuthenticated, user } = useAuthStore();
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const t = translations[language];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router, fetchWishlist]);

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = (item: any) => {
    // Add first available size or show size selector
    const firstAvailableVariant = item.product.variants.find((v: any) => v.stock > 0);
    if (firstAvailableVariant) {
      addToCart({
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price),
        size: firstAvailableVariant.size,
        color: firstAvailableVariant.color,
        quantity: 1,
        image: item.product.images[0],
      });
      setCartOpen(true);
    } else {
      // Navigate to product page to select size
      router.push(`/products/${item.product.id}`);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/">
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  <ArrowLeft size={20} />
                </button>
              </Link>
              <div>
                <h1
                  className="text-4xl md:text-5xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {t.wishlist}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {wishlist.length} {t.products}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && wishlist.length === 0 && (
            <div className="text-center py-20">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <Heart size={40} className="text-primary" />
              </div>
              <h2
                className="text-3xl md:text-4xl mb-4"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {t.emptyWishlist}
              </h2>
              <p className={`mb-8 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {t.emptyWishlistMessage}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <ShoppingBag size={18} />
                {t.discoverCollectionButton}
              </Link>
            </div>
          )}

          {/* Wishlist grid */}
          {!isLoading && wishlist.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] ${
                    darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                  }`}
                >
                  {/* Image */}
                  <Link href={`/products/${item.product.id}`} className="block aspect-[3/4] relative overflow-hidden">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                        <span
                          className="text-6xl text-foreground/10"
                          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                        >
                          TPL
                        </span>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item.productId);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 z-10"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Discount badge */}
                    {item.product.originalPrice && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        -{Math.round((1 - parseFloat(item.product.price as any) / parseFloat(item.product.originalPrice as any)) * 100)}%
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <Link href={`/products/${item.product.id}`}>
                      <p className={`text-xs mb-2 ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {item.product.category.name}
                      </p>
                      <h3
                        className="text-lg mb-2 group-hover:text-primary transition-colors"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {item.product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xl text-primary"
                          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                        >
                          {item.product.price}€
                        </span>
                        {item.product.originalPrice && (
                          <span className={`text-sm line-through ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {item.product.originalPrice}€
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-110"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
