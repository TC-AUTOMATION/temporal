'use client';

import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
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
  } = useStore();
  const t = translations[language];

  if (!isCartOpen) return null;

  const total = cartTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col ${
          darkMode ? 'bg-black text-white' : 'bg-white text-black'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-current/20">
          <h2 className="text-xl font-medium">{t.cart}</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-center opacity-60">Panier vide</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 pb-4 border-b border-current/10"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded relative overflow-hidden flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm opacity-60">
                      {t.size}: {item.size}
                    </p>
                    <p className="text-sm text-[#5B2D8E] font-medium">
                      {item.price}€
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-1 hover:opacity-70"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="p-1 hover:opacity-70"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="p-2 hover:opacity-70 self-start"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* You might also like */}
          {cart.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">{t.youMightLike}</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0" />
                <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-current/20">
            <div className="flex justify-between mb-2">
              <span>{t.subtotal}</span>
              <span>{total.toFixed(2)}€</span>
            </div>
            <p className="text-sm opacity-60 mb-2">{t.taxesIncluded}</p>
            <p className="text-sm opacity-60 mb-4">{t.shippingCalculated}</p>

            <textarea
              placeholder={t.addNote}
              className={`w-full p-2 text-sm border rounded mb-4 resize-none ${
                darkMode
                  ? 'bg-black border-white/30 text-white'
                  : 'bg-white border-black/30 text-black'
              }`}
              rows={2}
            />

            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full py-3 text-center bg-[#5B2D8E] text-white rounded font-medium hover:opacity-90 transition-opacity"
            >
              {t.checkout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
