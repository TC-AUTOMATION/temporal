'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, X, Zap, ArrowRight, Gift } from 'lucide-react';
import TemporalStar from '@/components/ui/TemporalStar';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { products } from '@/lib/products';

import Link from 'next/link';

interface UpsellData {
  id: string;
  name: string;
  nameEn: string | null;
  message: string | null;
  messageEn: string | null;
  image: string | null;
  isFreeGift: boolean;
  effectivePrice: number;
  originalPrice: number;
  product: {
    id: string;
    name: string;
    nameEn: string | null;
    price: string | number;
    images: string[];
    category: {
      name: string;
      nameEn: string | null;
      slug: string;
    };
    variants?: { id: string; size: string; stock: number }[];
  };
}

export default function CartDrawer() {
  const {
    language,
    darkMode,
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    addToCart,
  } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [upsells, setUpsells] = useState<UpsellData[]>([]);
  const [upsellSizePicker, setUpsellSizePicker] = useState<string | null>(null); // upsell id with open size picker
  const [upsellSelectedSizes, setUpsellSelectedSizes] = useState<Record<string, string>>({}); // upsellId -> size

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];

  useEffect(() => {
    if (isCartOpen) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [isCartOpen]);

  // Fetch upsells based on cart state
  const fetchUpsells = useCallback(async () => {
    if (cart.length === 0) {
      setUpsells([]);
      return;
    }
    try {
      const total = cartTotal();
      const productIds = cart.map((item) => item.id).join(',');
      const res = await fetch(
        `/api/upsells?cartTotal=${total}&productIds=${productIds}&location=cart`
      );
      if (res.ok) {
        const data = await res.json();
        const matching: UpsellData[] = data.data?.upsells || [];
        const allUpsellProductIds: string[] = data.data?.allUpsellProductIds || [];
        const matchingProductIds = new Set(matching.map((u) => u.product.id));

        // Auto-remove upsell items from cart if their conditions are no
        // longer met (e.g. user removed items and dropped below the cart
        // total threshold that qualified the upsell in the first place).
        const itemsToRemove = cart.filter(
          (item) =>
            allUpsellProductIds.includes(item.id) &&
            !matchingProductIds.has(item.id)
        );
        if (itemsToRemove.length > 0) {
          itemsToRemove.forEach((item) => removeFromCart(item.id, item.size));
          // Skip rendering upsell suggestions this round; the cart change
          // will trigger another fetchUpsells via the dependency effect.
          return;
        }

        // Filter out upsells for products already in cart
        const cartProductIds = cart.map((item) => item.id);
        const filtered = matching.filter(
          (u: UpsellData) => !cartProductIds.includes(u.product.id)
        );
        setUpsells(filtered);
      }
    } catch (err) {
      console.error('Error fetching upsells:', err);
    }
  }, [cart, cartTotal, removeFromCart]);

  useEffect(() => {
    if (isCartOpen && cart.length > 0) {
      fetchUpsells();
    }
  }, [isCartOpen, cart, fetchUpsells]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCartOpen(false);
    }, 300);
  };

  const total = cartTotal();

  const cartIds = cart.map(item => item.id);
  const cartNames = cart.map(item => (item.name || '').toLowerCase());

  // Product recommendations: same color only
  const getSuggestedProducts = () => {
    if (cart.length === 0) return products.slice(0, 2);

    // Filter out products already in cart - check by ID and by name
    const availableProducts = products.filter(p => {
      const inCartById = cartIds.includes(p.id);
      const inCartByName = cartNames.some(cartName =>
        cartName === p.name.toLowerCase() ||
        cartName === (p.nameFr || '').toLowerCase() ||
        cartName === (p.nameEn || '').toLowerCase()
      );
      return !inCartById && !inCartByName;
    });

    // Determine cart color from multiple sources:
    // 1. Check cart item's color field (e.g., 'Blanc', 'Noir', 'White', 'Black')
    // 2. Check cart item's name for color keywords
    // 3. Check cart item's id for color keywords
    const hasWhite = cart.some(item => {
      const colorLower = (item.color || '').toLowerCase();
      const nameLower = (item.name || '').toLowerCase();
      const idLower = (item.id || '').toLowerCase();
      return colorLower.includes('blanc') || colorLower.includes('white') ||
             nameLower.includes('blanc') || nameLower.includes('white') ||
             idLower.includes('blanc') || idLower.includes('white');
    });

    const cartColor = hasWhite ? 'blanc' : 'noir';

    // Filter products by same color - check id and name
    const sameColorProducts = availableProducts.filter(p => {
      const idLower = p.id.toLowerCase();
      const nameLower = p.name.toLowerCase();
      if (cartColor === 'blanc') {
        return idLower.includes('blanc') || idLower.includes('white') ||
               nameLower.includes('blanc') || nameLower.includes('white');
      } else {
        return idLower.includes('noir') || idLower.includes('black') ||
               nameLower.includes('noir') || nameLower.includes('black');
      }
    });

    // If we have same color products, return those (prioritize different categories)
    if (sameColorProducts.length > 0) {
      const cartCategories = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        return p?.category;
      });

      // Sort: different categories first
      const sorted = sameColorProducts.sort((a, b) => {
        const aInCart = cartCategories.includes(a.category) ? 1 : 0;
        const bInCart = cartCategories.includes(b.category) ? 1 : 0;
        return aInCart - bInCart;
      });

      return sorted.slice(0, 2);
    }

    // Fallback if no same color available
    return availableProducts.slice(0, 2);
  };

  const suggestedProducts = getSuggestedProducts();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed right-2 top-2 bottom-2 md:right-4 md:top-4 md:bottom-4 w-[calc(100%-1rem)] max-w-md z-50  overflow-hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } ${
          darkMode
            ? 'bg-black border border-white/10'
            : 'bg-white border border-black/10'
        }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary flex items-center justify-center">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.yourCart}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {cart.length} {cart.length > 1 ? t.cartItemsCount : t.cartItemCount}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`w-10 h-10 flex items-center justify-center transition-all hover:scale-110 ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className={`w-20 h-20 flex items-center justify-center mb-4 ${
                darkMode ? 'bg-white/10' : 'bg-black/5'
              }`}>
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <p
                className="text-muted-foreground text-lg"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.cartEmpty}
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">{t.addItemsToStart}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className={`p-4 transition-all ${
                    darkMode
                      ? 'bg-white/5 border border-white/10 hover:border-primary/30'
                      : 'bg-black/5 border border-black/10 hover:border-primary/30'
                  }`}
                >
                  {/* Top row: Image + Info */}
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                          <span style={{ fontFamily: '"Bebas Neue", sans-serif' }}>TPL</span>
                        </div>
                      )}
                    </div>

                    {/* Info: name, size, quantity, price */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="truncate"
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          >
                            {item.name.toUpperCase()}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-3 py-1 text-xs ${
                              darkMode ? 'bg-white/10' : 'bg-black/10'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                          >
                            {t.sizeLabel}: {item.size}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className={`w-8 h-8 flex items-center justify-center transition-all hover:scale-110 ${
                            darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                          }`}
                        >
                          <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className={`flex items-center ${
                          darkMode ? 'bg-white/10' : 'bg-black/10'
                        }`}>
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            className="w-8 text-center"
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p
                          className="text-primary text-xl"
                          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                        >
                          {Number(item.price).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Link to product page - at bottom */}
                  <Link
                    href={`/products/${item.id}`}
                    onClick={handleClose}
                    className={`mt-3 inline-flex items-center justify-center gap-2 px-5 py-2 text-sm border transition-all ${
                      darkMode
                        ? 'border-white text-white hover:bg-white hover:text-black'
                        : 'border-black text-black hover:bg-black hover:text-white'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}
                  >
                    {t.viewProductPage}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Upsells section */}
          {upsells.length > 0 && (
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
              <p
                className="text-sm mb-3 flex items-center gap-2"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <Gift size={16} className="text-green-500" />
                <span className={darkMode ? 'text-white/80' : 'text-black/80'}>
                  {language === 'fr' ? 'RECOMMANDE POUR VOUS' : 'RECOMMENDED FOR YOU'}
                </span>
              </p>
              <div className="space-y-2">
                {upsells.map((upsell) => {
                  const upsellMessage = language === 'fr'
                    ? upsell.message
                    : (upsell.messageEn || upsell.message);
                  const upsellImage = upsell.image === '__product__' ? upsell.product.images[0] : (upsell.image || null);

                  return (
                    <div
                      key={upsell.id}
                      className={`relative flex items-center gap-3 p-2.5 transition-all group ${
                        upsell.isFreeGift
                          ? darkMode
                            ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500/50'
                            : 'bg-green-50 border border-green-200 hover:border-green-300'
                          : darkMode
                            ? 'bg-white/5 border border-white/10 hover:border-primary/30'
                            : 'bg-black/5 border border-black/10 hover:border-primary/30'
                      }`}
                    >
                      {/* Free gift badge */}
                      {upsell.isFreeGift && (
                        <div className="absolute -top-2 -right-1 z-10">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg"
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          >
                            <Gift size={10} />
                            {language === 'fr' ? 'CADEAU GRATUIT' : 'FREE GIFT'}
                          </span>
                        </div>
                      )}

                      {/* Image */}
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                        {upsellImage ? (
                          <img
                            src={upsellImage}
                            alt={upsell.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            upsell.isFreeGift
                              ? 'bg-green-500/20'
                              : darkMode ? 'bg-white/10' : 'bg-black/10'
                          }`}>
                            <Gift size={20} className={upsell.isFreeGift ? 'text-green-500' : 'text-primary'} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs truncate group-hover:text-primary transition-colors"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {(language === 'fr' ? upsell.name : (upsell.nameEn || upsell.name)).toUpperCase()}
                        </p>
                        {upsellMessage && (
                          <p className={`text-[10px] mt-0.5 truncate ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                            {upsellMessage}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {upsell.isFreeGift ? (
                            <span
                              className="text-green-500 text-sm font-bold"
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {language === 'fr' ? 'GRATUIT' : 'FREE'}
                            </span>
                          ) : upsell.effectivePrice < upsell.originalPrice ? (
                            <>
                              <span
                                className="text-primary text-sm"
                                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                              >
                                {upsell.effectivePrice.toFixed(2)}€
                              </span>
                              <span
                                className={`text-[10px] line-through ${darkMode ? 'text-white/30' : 'text-black/30'}`}
                              >
                                {upsell.originalPrice.toFixed(2)}€
                              </span>
                            </>
                          ) : (
                            <span
                              className="text-primary text-sm"
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              {upsell.originalPrice.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add button / size picker */}
                      {(() => {
                        const variants = upsell.product.variants || [];
                        const sizes = Array.from(new Map(variants.map(v => [v.size, v])).values())
                          .sort((a, b) => {
                            const ai = SIZE_ORDER.indexOf(a.size);
                            const bi = SIZE_ORDER.indexOf(b.size);
                            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                          });
                        const needsSizePicker = sizes.length > 0 && !(sizes.length === 1 && sizes[0].size === 'Unique');

                        if (needsSizePicker && upsellSizePicker === upsell.id) {
                          return (
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <div className="flex flex-wrap gap-1 justify-end">
                                {sizes.map(v => (
                                  <button
                                    key={v.size}
                                    disabled={v.stock === 0}
                                    className={`px-2 py-1 text-[10px] transition-all border ${
                                      v.stock === 0
                                        ? 'opacity-30 cursor-not-allowed border-gray-400 text-gray-400'
                                        : upsellSelectedSizes[upsell.id] === v.size
                                          ? 'bg-primary text-white border-primary'
                                          : darkMode
                                            ? 'border-white/30 text-white hover:border-primary hover:text-primary'
                                            : 'border-black/30 text-black hover:border-primary hover:text-primary'
                                    }`}
                                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                                    onClick={() => {
                                      if (v.stock === 0) return;
                                      const selectedSize = v.size;
                                      addToCart({
                                        id: upsell.product.id,
                                        name: language === 'fr' ? upsell.product.name : (upsell.product.nameEn || upsell.product.name),
                                        price: upsell.isFreeGift ? 0 : upsell.effectivePrice,
                                        size: selectedSize,
                                        color: '',
                                        quantity: 1,
                                        image: upsell.product.images[0] || '',
                                      });
                                      setUpsellSizePicker(null);
                                    }}
                                  >
                                    {v.size}
                                  </button>
                                ))}
                              </div>
                              <button
                                className={`text-[10px] text-center ${darkMode ? 'text-white/40 hover:text-white/70' : 'text-black/40 hover:text-black/70'}`}
                                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                onClick={() => setUpsellSizePicker(null)}
                              >
                                {language === 'fr' ? 'ANNULER' : 'CANCEL'}
                              </button>
                            </div>
                          );
                        }

                        return (
                          <button
                            className={`px-3 py-1.5 text-xs transition-all hover:scale-105 flex-shrink-0 ${
                              upsell.isFreeGift
                                ? 'bg-green-500 text-white'
                                : 'bg-primary text-white'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                            onClick={() => {
                              if (needsSizePicker) {
                                setUpsellSizePicker(upsell.id);
                              } else {
                                const size = sizes[0]?.size || 'Unique';
                                addToCart({
                                  id: upsell.product.id,
                                  name: language === 'fr' ? upsell.product.name : (upsell.product.nameEn || upsell.product.name),
                                  price: upsell.isFreeGift ? 0 : upsell.effectivePrice,
                                  size,
                                  color: '',
                                  quantity: 1,
                                  image: upsell.product.images[0] || '',
                                });
                              }
                            }}
                          >
                            + {language === 'fr' ? 'AJOUTER' : 'ADD'}
                          </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={`p-4 md:p-6 border-t flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            {/* Suggestions */}
            {suggestedProducts.length > 0 && (
              <div className="mb-5">
                <p
                  className="text-primary text-base mb-3 flex items-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <span
                    className="animate-twinkle"
                    style={{
                      '--twinkle-duration': '2s',
                      '--twinkle-delay': '0s',
                    } as React.CSSProperties}
                  >
                    <TemporalStar
                      size={16}
                      color={darkMode ? '#ffffff' : '#000000'}
                    />
                  </span>
                  {t.youWillLove}
                </p>
                <div className="space-y-2">
                  {suggestedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-2.5 transition-all group ${
                        darkMode
                          ? 'bg-white/5 border border-white/10 hover:border-primary/30'
                          : 'bg-black/5 border border-black/10 hover:border-primary/30'
                      }`}
                    >
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs truncate group-hover:text-primary transition-colors"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {product.name.toUpperCase()}
                        </p>
                        <p
                          className="text-primary text-sm mt-0.5"
                          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                        >
                          {Number(product.price).toFixed(2)}€
                        </p>
                      </div>
                      <button
                        className="px-3 py-1.5 bg-primary text-white text-xs transition-all hover:scale-105"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                        onClick={() => {
                          const availableSize = product.sizes.find(s => s.available);
                          if (availableSize) {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: Number(product.price),
                              size: availableSize.name,
                              color: product.colors[0]?.name || '',
                              quantity: 1,
                              image: product.images[0],
                            });
                          }
                        }}
                      >
                        + {language === 'fr' ? 'AJOUTER' : 'ADD'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className={`mb-4 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />

            {/* Total section */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p
                  className="text-primary text-xs mb-1"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.3em' }}
                >
                  {t.total.toUpperCase()}
                </p>
                <p
                  className="text-4xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {Number(total).toFixed(2)}€
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.shippingAtCheckout}
                </p>
                <p
                  className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.taxesIncluded.toUpperCase()}
                </p>
              </div>
            </div>

            <Link href="/checkout" onClick={handleClose} className="block">
              <button
                className="w-full py-4 bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem', borderRadius: '12px' }}
              >
                {t.goToPayment}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
