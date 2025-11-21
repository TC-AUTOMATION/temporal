'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, X, Zap } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { products } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';

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

  useEffect(() => {
    if (isCartOpen) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [isCartOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCartOpen(false);
    }, 300);
  };

  const total = cartTotal();

  const cartIds = cart.map(item => item.id);
  const suggestedProducts = products.filter(p => !cartIds.includes(p.id)).slice(0, 2);

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
                  TON PANIER
                </h2>
                <p className="text-muted-foreground text-sm">
                  {cart.length} article{cart.length > 1 ? 's' : ''}
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
                TON PANIER EST VIDE
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">Ajoute des pièces pour commencer</p>
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
                  <div className="flex gap-4">
                    <div className="w-20 h-20 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                          <span style={{ fontFamily: '"Bebas Neue", sans-serif' }}>TPL</span>
                        </div>
                      )}
                    </div>

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
                            TAILLE: {item.size}
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
                          {item.price.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && suggestedProducts.length > 0 && (
            <>
              <div className={`my-6 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-primary" />
                  <h3
                    className="text-primary text-sm"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    TU VAS KIFFER
                  </h3>
                </div>
                <div className="space-y-2">
                  {suggestedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-3 ${
                        darkMode
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-black/5 border border-black/10'
                      }`}
                    >
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {product.name.toUpperCase()}
                        </p>
                        <p
                          className="text-primary text-sm"
                          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                        >
                          {product.price.toFixed(2)}€
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 bg-primary text-white text-xs transition-all hover:scale-105"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                        onClick={() => {
                          const availableSize = product.sizes.find(s => s.available);
                          if (availableSize) {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              size: availableSize.name,
                              color: product.colors[0]?.name || '',
                              quantity: 1,
                              image: product.images[0],
                            });
                          }
                        }}
                      >
                        + ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={`p-4 md:p-6 border-t flex-shrink-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-muted-foreground text-sm">Total</span>
                <p
                  className="text-3xl text-primary"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {total.toFixed(2)}€
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Livraison calculée au checkout</p>
                <p>Taxes incluses</p>
              </div>
            </div>

            <Link href="/checkout" onClick={handleClose}>
              <button
                className="w-full py-4 bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem' }}
              >
                <Zap size={18} />
                CHECKOUT
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
