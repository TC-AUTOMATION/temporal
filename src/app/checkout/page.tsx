'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import { Truck, HandHeart, Info, Check } from 'lucide-react';

type DeliveryMethod = null | 'delivery' | 'handDelivery';

export default function CheckoutPage() {
  const { language, darkMode, cart, cartTotal, clearCart } = useStore();
  const t = translations[language];
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);
  const [step, setStep] = useState<'delivery' | 'payment' | 'confirmed'>('delivery');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  const total = cartTotal();
  const shippingCost = deliveryMethod === 'handDelivery' ? 0 : 5.9;
  const finalTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, integrate with Stripe here
    setStep('confirmed');
    clearCart();
  };

  if (step === 'confirmed') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <MarqueeBanner />
          <Header showLogo />
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">{t.orderConfirmed}</h1>
            <p className="text-center opacity-70 max-w-md mb-2">{t.preparingOrder}</p>
            {deliveryMethod === 'handDelivery' && (
              <p className="text-center text-sm opacity-60 flex items-center gap-1">
                <Info size={14} />
                Remise en main propre lors d'une prochaine rencontre
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'delivery') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <MarqueeBanner />
          <Header showLogo />
          <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-8 text-center">Mode de livraison</h1>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Standard delivery */}
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-6 border-2 rounded-lg text-left transition-all hover:border-[#5B2D8E] ${
                  deliveryMethod === 'delivery'
                    ? 'border-[#5B2D8E] bg-[#5B2D8E]/10'
                    : darkMode
                    ? 'border-white/30'
                    : 'border-black/30'
                }`}
              >
                <Truck size={32} className="mb-4" />
                <h3 className="font-bold text-lg mb-2">{t.delivery}</h3>
                <p className="text-sm opacity-70">{t.standardDelivery}</p>
                <p className="mt-2 font-medium">5,90€</p>
              </button>

              {/* Hand delivery */}
              <button
                onClick={() => setDeliveryMethod('handDelivery')}
                className={`p-6 border-2 rounded-lg text-left transition-all hover:border-[#5B2D8E] ${
                  deliveryMethod === 'handDelivery'
                    ? 'border-[#5B2D8E] bg-[#5B2D8E]/10'
                    : darkMode
                    ? 'border-white/30'
                    : 'border-black/30'
                }`}
              >
                <HandHeart size={32} className="mb-4" />
                <h3 className="font-bold text-lg mb-2">{t.handDelivery}</h3>
                <p className="text-sm opacity-70">{t.handDeliveryDesc}</p>
                <p className="mt-2 font-medium text-green-500">Gratuit</p>
              </button>
            </div>

            {/* Order summary */}
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <h3 className="font-medium mb-4">Récapitulatif</h3>
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm mb-2">
                  <span>{item.name} ({item.size}) x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
              <div className="border-t border-current/20 mt-4 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t.subtotal}</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t.shipping}</span>
                  <span>{deliveryMethod ? `${shippingCost.toFixed(2)}€` : '-'}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>{t.total}</span>
                  <span>{deliveryMethod ? `${finalTotal.toFixed(2)}€` : `${total.toFixed(2)}€`}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => deliveryMethod && setStep('payment')}
              disabled={!deliveryMethod}
              className="w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.continueToPayment}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-8 text-center">Informations de livraison</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`px-4 py-3 border rounded ${
                  darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
                }`}
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`px-4 py-3 border rounded ${
                  darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
                }`}
                required
              />
            </div>
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded ${
                darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
              }`}
              required
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded ${
                darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
              }`}
            />

            {deliveryMethod === 'delivery' && (
              <>
                <input
                  type="text"
                  placeholder="Adresse"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 border rounded ${
                    darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
                  }`}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ville"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`px-4 py-3 border rounded ${
                      darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={`px-4 py-3 border rounded ${
                      darkMode ? 'bg-black border-white/30' : 'bg-white border-black/30'
                    }`}
                    required
                  />
                </div>
              </>
            )}

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <p className="font-medium mb-2">{t.total}: {finalTotal.toFixed(2)}€</p>
              <p className="text-sm opacity-70">
                {deliveryMethod === 'handDelivery'
                  ? 'Remise en main propre - Sans frais'
                  : `Livraison standard - ${shippingCost.toFixed(2)}€`}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Payer {finalTotal.toFixed(2)}€
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
