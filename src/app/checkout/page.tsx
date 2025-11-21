'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Truck, Package, Check, ArrowLeft, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type DeliveryMethod = null | 'delivery' | 'handDelivery';

export default function CheckoutPage() {
  const { language, cart, cartTotal, clearCart, darkMode } = useStore();
  const t = translations[language];
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);
  const [step, setStep] = useState<'delivery' | 'payment' | 'confirmed'>('delivery');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(true);
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
    setStep('confirmed');
    clearCart();
  };

  // Confirmed step
  if (step === 'confirmed') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-20 h-20 bg-primary flex items-center justify-center mb-8">
            <Check size={40} className="text-white" />
          </div>
          <h1
            className="text-3xl mb-4"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            COMMANDE CONFIRMÉE
          </h1>
          <p className={`text-center max-w-md mb-8 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
            Merci pour votre commande. Vous recevrez un email de confirmation avec les détails de suivi.
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            RETOUR À LA BOUTIQUE
          </Link>
        </div>
      </div>
    );
  }

  // Order summary component
  const OrderSummary = () => (
    <div className={`p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
      <h3
        className="text-lg mb-6"
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
      >
        RÉCAPITULATIF
      </h3>

      {/* Cart items */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex gap-4">
            <div className={`w-20 h-20 relative flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className={`text-2xl ${darkMode ? 'text-white/20' : 'text-black/20'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    TPL
                  </span>
                </div>
              )}
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <h4
                className="uppercase text-sm"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {item.name}
              </h4>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                Taille: {item.size}
              </p>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {item.price}€
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo code */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="CODE PROMO"
          className={`flex-1 px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
            darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
        />
        <button
          className={`px-4 py-3 border transition-colors ${
            darkMode ? 'border-white/20 hover:border-primary hover:text-primary' : 'border-black/20 hover:border-primary hover:text-primary'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
        >
          OK
        </button>
      </div>

      {/* Totals */}
      <div className={`space-y-3 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-white/60' : 'text-black/60'}>Sous-total</span>
          <span style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{total.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-white/60' : 'text-black/60'}>Livraison</span>
          <span style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {deliveryMethod ? (shippingCost === 0 ? 'GRATUIT' : `${shippingCost.toFixed(2)}€`) : '—'}
          </span>
        </div>
        <div className={`flex justify-between pt-3 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <span
            className="text-lg"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            TOTAL
          </span>
          <span
            className="text-xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {finalTotal.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );

  // Delivery step
  if (step === 'delivery') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {/* Header */}
        <div className={`border-b py-6 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <Link
              href="/"
              className={`flex items-center gap-2 transition-colors ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              <ArrowLeft size={18} />
              RETOUR
            </Link>
            <Link href="/">
              <TemporalLogo size={40} />
            </Link>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className="text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              1. LIVRAISON
            </span>
            <div className={`w-12 h-[1px] ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
            <span
              className={darkMode ? 'text-white/30' : 'text-black/30'}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              2. PAIEMENT
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Delivery options */}
            <div>
              <h2
                className="text-2xl mb-8"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                MODE DE LIVRAISON
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`w-full p-6 border text-left transition-all flex items-center gap-4 ${
                    deliveryMethod === 'delivery'
                      ? 'border-primary bg-primary/10'
                      : darkMode ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                  }`}
                >
                  <Truck size={32} className={deliveryMethod === 'delivery' ? 'text-primary' : ''} />
                  <div>
                    <h3
                      className="text-lg"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      LIVRAISON À DOMICILE
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      Recevez votre commande sous 48-72h
                    </p>
                  </div>
                  <span
                    className="ml-auto"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    5.90€
                  </span>
                </button>

                <div className={`text-center text-sm ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                  OU
                </div>

                <button
                  onClick={() => setDeliveryMethod('handDelivery')}
                  className={`w-full p-6 border text-left transition-all flex items-center gap-4 ${
                    deliveryMethod === 'handDelivery'
                      ? 'border-primary bg-primary/10'
                      : darkMode ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                  }`}
                >
                  <Package size={32} className={deliveryMethod === 'handDelivery' ? 'text-primary' : ''} />
                  <div>
                    <h3
                      className="text-lg"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      EN MAIN PROPRE
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      Récupérez votre commande sur place
                    </p>
                  </div>
                  <span
                    className="ml-auto text-primary"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    GRATUIT
                  </span>
                </button>
              </div>

              <button
                onClick={() => deliveryMethod && setStep('payment')}
                disabled={!deliveryMethod}
                className="w-full mt-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                CONTINUER
              </button>

              {/* Footer links */}
              <div className={`mt-12 pt-8 border-t flex flex-wrap gap-6 text-xs ${darkMode ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
                <Link href="/refund" className="hover:text-primary transition-colors">Remboursement</Link>
                <Link href="/shipping" className="hover:text-primary transition-colors">Expédition</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">CGV</Link>
              </div>
            </div>

            {/* Right - Order summary */}
            <OrderSummary />
          </div>
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className={`border-b py-6 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => setStep('delivery')}
            className={`flex items-center gap-2 transition-colors ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={18} />
            RETOUR
          </button>
          <Link href="/">
            <TemporalLogo size={40} />
          </Link>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={darkMode ? 'text-white/30' : 'text-black/30'}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            1. LIVRAISON
          </span>
          <div className={`w-12 h-[1px] ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
          <span
            className="text-primary"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            2. PAIEMENT
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    CONTACT
                  </h3>
                  <Link
                    href="/profile"
                    className="text-xs text-primary hover:underline"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    SE CONNECTER
                  </Link>
                </div>
                <input
                  type="email"
                  placeholder="ADRESSE E-MAIL"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
                <label className={`flex items-center gap-3 mt-3 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  Recevoir les offres et nouveautés par email
                </label>
              </div>

              {/* Delivery info */}
              <div>
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  INFORMATIONS DE LIVRAISON
                </h3>
                <div className="space-y-3">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <option value="France" className={darkMode ? 'bg-black' : 'bg-white'}>FRANCE</option>
                    <option value="Belgique" className={darkMode ? 'bg-black' : 'bg-white'}>BELGIQUE</option>
                    <option value="Suisse" className={darkMode ? 'bg-black' : 'bg-white'}>SUISSE</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="PRÉNOM"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                        darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    />
                    <input
                      type="text"
                      placeholder="NOM"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                        darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    />
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <>
                      <input
                        type="text"
                        placeholder="ADRESSE"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                          darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                        }`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="VILLE"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                            darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                          }`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        />
                        <input
                          type="text"
                          placeholder="CODE POSTAL"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                          className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                            darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                          }`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <Lock size={18} />
                PAYER {finalTotal.toFixed(2)}€
              </button>
            </form>

            {/* Footer links */}
            <div className={`mt-12 pt-8 border-t flex flex-wrap gap-6 text-xs ${darkMode ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'}`}>
              <Link href="/refund" className="hover:text-primary transition-colors">Remboursement</Link>
              <Link href="/shipping" className="hover:text-primary transition-colors">Expédition</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">CGV</Link>
            </div>
          </div>

          {/* Right - Order summary */}
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
