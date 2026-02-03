'use client';

import { useState, useEffect, Suspense } from 'react';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import { stripe as stripeApi, promo as promoApi } from '@/lib/api/client';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Check, ArrowLeft, Lock, Zap, Shield, Clock, X, AlertTriangle, Package, CreditCard, Loader2, MapPin, ChevronDown, Edit3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BoxtalMapWidget, { RelayPoint } from '@/components/checkout/BoxtalMapWidget';

// Carrier type for checkout
type RelayCarrier = 'mondial_relay' | 'chronopost' | 'colissimo' | 'ups';

// Carrier display data
const carriers = [
  { id: 'mondial_relay' as RelayCarrier, name: 'Mondial Relay', logo: '/point-relais/mondial-relay.svg', delay: '3-5 jours' },
  { id: 'colissimo' as RelayCarrier, name: 'Colissimo', logo: '/point-relais/colissimo.png', delay: '2-3 jours' },
  { id: 'chronopost' as RelayCarrier, name: 'Chronopost', logo: '/point-relais/chronopost pickup.png', delay: '1-2 jours' },
  { id: 'ups' as RelayCarrier, name: 'UPS Access Point', logo: '/point-relais/ups-access-point.avif', delay: '2-3 jours' },
];

type DeliveryMethod = null | 'delivery' | 'relay' | 'handDelivery';

// Wrapper component to handle Suspense for useSearchParams
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

// Loading component
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );
}

// Main checkout content
function CheckoutContent() {
  const { language, cart, cartTotal, clearCart, darkMode } = useStore();
  const { user, isAuthenticated } = useAuthStore();
  const t = translations[language];
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);
  const [relayCarrier, setRelayCarrier] = useState<RelayCarrier | null>(null);
  const [selectedRelayPoint, setSelectedRelayPoint] = useState<RelayPoint | null>(null);
  const [showRelaySelector, setShowRelaySelector] = useState(false);
  const [step, setStep] = useState<'delivery' | 'payment' | 'confirmed'>('delivery');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [showHandDeliveryConfirm, setShowHandDeliveryConfirm] = useState(false);
  const [showHandDeliveryModal, setShowHandDeliveryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    notes: '',
  });

  // Fix hydration error - wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const response = await fetch('/api/shipping-methods');
        if (response.ok) {
          const data = await response.json();
          setShippingMethods(data.shippingMethods || []);
        }
      } catch (err) {
        console.error('Error fetching shipping methods:', err);
      }
    };

    if (mounted) {
      fetchShippingMethods();
    }
  }, [mounted]);

  // Check for success/cancelled from Stripe redirect
  useEffect(() => {
    if (mounted) {
      const success = searchParams.get('success');
      const canceled = searchParams.get('canceled');
      const order = searchParams.get('order');

      if (success === 'true' && order) {
        setOrderNumber(order);
        setStep('confirmed');
        clearCart();
      } else if (canceled === 'true') {
        // User cancelled payment - stay on payment step
        setStep('payment');
      }
    }
  }, [mounted, searchParams, clearCart]);

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (user && mounted) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user, mounted]);

  const total = mounted ? cartTotal() : 0;
  const cartItems = mounted ? cart : [];

  // Shipping costs based on delivery method - using API data
  const getShippingCost = () => {
    if (!deliveryMethod || shippingMethods.length === 0) return 0;

    let methodId = '';
    if (deliveryMethod === 'handDelivery') methodId = 'handDelivery';
    if (deliveryMethod === 'relay') methodId = 'relay';
    if (deliveryMethod === 'delivery') methodId = 'delivery';

    const method = shippingMethods.find(m => m.id === methodId);
    return method ? method.price : 0;
  };
  const shippingCost = getShippingCost();
  const finalTotal = Math.max(0, total + shippingCost - promoDiscount);

  // Get carrier info helper
  const getCarrierInfo = (carrierId: RelayCarrier) => {
    return carriers.find(c => c.id === carrierId);
  };

  // Handle relay point selection
  const handleRelayPointSelect = (point: RelayPoint, carrier: RelayCarrier) => {
    setSelectedRelayPoint(point);
    setRelayCarrier(carrier);
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoMessage('');

    try {
      const result = await promoApi.validate(promoCode, total);
      if (result.valid) {
        setPromoDiscount(result.discount);
        setPromoMessage(`${result.discountLabel} applied!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid promo code';
      setPromoMessage(message);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Map delivery method to API format
      let apiDeliveryMethod: 'DELIVERY' | 'RELAY' | 'HAND_DELIVERY';
      if (deliveryMethod === 'handDelivery') {
        apiDeliveryMethod = 'HAND_DELIVERY';
      } else if (deliveryMethod === 'relay') {
        apiDeliveryMethod = 'RELAY';
      } else {
        apiDeliveryMethod = 'DELIVERY';
      }

      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        deliveryMethod: apiDeliveryMethod,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Home delivery address
        address: deliveryMethod === 'delivery' ? formData.address : undefined,
        city: deliveryMethod === 'delivery' ? formData.city : undefined,
        postalCode: deliveryMethod === 'delivery' ? formData.postalCode : undefined,
        country: formData.country,
        // Relay point info
        relayPointId: deliveryMethod === 'relay' && selectedRelayPoint ? selectedRelayPoint.id : undefined,
        relayPointCode: deliveryMethod === 'relay' && selectedRelayPoint ? (selectedRelayPoint.code || selectedRelayPoint.id.split('-').slice(1).join('-')) : undefined,
        relayPointName: deliveryMethod === 'relay' && selectedRelayPoint ? selectedRelayPoint.name : undefined,
        relayPointAddress: deliveryMethod === 'relay' && selectedRelayPoint ? selectedRelayPoint.address : undefined,
        relayPointCity: deliveryMethod === 'relay' && selectedRelayPoint ? selectedRelayPoint.city : undefined,
        relayPointPostalCode: deliveryMethod === 'relay' && selectedRelayPoint ? selectedRelayPoint.postalCode : undefined,
        relayCarrier: deliveryMethod === 'relay' && relayCarrier ? relayCarrier : undefined,
        // Other
        promoCode: promoDiscount > 0 ? promoCode : undefined,
        notes: formData.notes || undefined,
      };

      const result = await stripeApi.createCheckout(checkoutData);

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Payment error';
      alert(message);
      setIsSubmitting(false);
    }
  };

  // Confirmed step
  if (step === 'confirmed') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {/* Background pattern */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: darkMode
                ? `repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(91, 45, 142, 0.1) 30px, rgba(91, 45, 142, 0.1) 32px)`
                : `repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(91, 45, 142, 0.05) 30px, rgba(91, 45, 142, 0.05) 32px)`,
            }}
          />
        </div>

        <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-24 h-24 bg-primary flex items-center justify-center mb-8 rotate-45">
            <Check size={48} className="text-white -rotate-45" />
          </div>
          <h1
            className="text-4xl md:text-5xl mb-4 text-center"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {t.orderConfirmedTitle}
          </h1>
          {orderNumber && (
            <p className="text-primary text-xl mb-4" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
              N° {orderNumber}
            </p>
          )}
          <p className={`text-center max-w-md mb-8 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
            {t.thankYouOrder}
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-10 py-4 bg-primary text-white hover:scale-105 transition-transform"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
            >
              {t.backToShop}
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className={`px-10 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
              >
                {t.myOrders}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Order summary component
  const OrderSummary = () => (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/10' : 'bg-gradient-to-b from-black/[0.03] to-black/[0.01] border border-black/10'}`}>
      {/* Header */}
      <div className={`px-4 sm:px-6 py-4 ${darkMode ? 'bg-white/[0.03] border-b border-white/10' : 'bg-black/[0.02] border-b border-black/10'}`}>
        <h3
          className="text-base sm:text-lg flex items-center gap-2"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
        >
          <Package size={18} className="text-primary" />
          {t.summary}
        </h3>
      </div>

      <div className="p-4 sm:p-6">
        {/* Cart items */}
        {cartItems.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className={`flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl ${darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 rounded-lg overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-sm sm:text-lg ${darkMode ? 'text-white/20' : 'text-black/20'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        TPL
                      </span>
                    </div>
                  )}
                  {/* Quantity badge */}
                  <div className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] sm:min-w-[26px] sm:h-[26px] bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white dark:border-black">
                    <span className="text-[10px] sm:text-xs font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
                  <h4 className="text-xs sm:text-sm font-medium truncate" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}>
                    {item.name}
                  </h4>
                  <p className={`text-[10px] sm:text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {t.size}: <span className="font-medium">{item.size}</span>
                    {item.color && <> • {t.color}: <span className="font-medium">{item.color}</span></>}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm sm:text-base text-primary font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {item.price}€
                    </p>
                    {item.quantity > 1 && (
                      <p className={`text-[10px] sm:text-xs font-medium ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                        = {(Number(item.price) * item.quantity).toFixed(2)}€
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-6 sm:py-8 mb-4 sm:mb-6 rounded-xl ${darkMode ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
            <Package size={28} className={`mx-auto mb-2 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.cartEmptyShort}</p>
          </div>
        )}

        {/* Promo code */}
        <div className={`p-3 rounded-xl mb-4 sm:mb-6 ${darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
          <label className={`text-[10px] sm:text-xs font-medium mb-2 block ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
            {t.promoCode}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder={t.enterCode}
              className={`flex-1 min-w-0 px-3 sm:px-4 py-2.5 bg-transparent border-2 rounded-lg focus:outline-none focus:border-primary transition-colors text-xs sm:text-sm ${
                darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
              }`}
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="px-3 sm:px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {promoLoading ? <Loader2 size={14} className="animate-spin" /> : t.apply}
            </button>
          </div>
          {promoMessage && (
            <p className={`text-[10px] sm:text-xs mt-2 ${promoDiscount > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {promoMessage}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className={`space-y-2.5 sm:space-y-3 pt-4 sm:pt-5 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={darkMode ? 'text-white/50' : 'text-black/50'}>{t.subtotal}</span>
            <span className="font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{Number(total).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={darkMode ? 'text-white/50' : 'text-black/50'}>{t.shipping}</span>
            <span className={`font-medium ${shippingCost === 0 ? 'text-primary' : ''}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
              {deliveryMethod ? (shippingCost === 0 ? t.free.toUpperCase() : `${Number(shippingCost).toFixed(2)}€`) : '—'}
            </span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-green-500">{t.discount}</span>
              <span className="text-green-500 font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                -{Number(promoDiscount).toFixed(2)}€
              </span>
            </div>
          )}
          <div className={`flex justify-between items-center pt-3 sm:pt-4 mt-1 sm:mt-2 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <span className="text-sm sm:text-lg font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {t.total.toUpperCase()}
            </span>
            <span className="text-xl sm:text-2xl text-primary font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
              {Number(finalTotal).toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className={`px-4 sm:px-6 py-4 ${darkMode ? 'bg-white/[0.02] border-t border-white/10' : 'bg-black/[0.01] border-t border-black/10'}`}>
        <div className="flex justify-around items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
            </div>
            <p className={`text-[9px] sm:text-[10px] text-center leading-tight whitespace-nowrap ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {t.securePayment.split(' ')[0]}<br/>{t.securePayment.split(' ')[1] || ''}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
            </div>
            <p className={`text-[9px] sm:text-[10px] text-center leading-tight whitespace-nowrap ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {t.shippingTime.split(' ')[0]}<br/>{t.shippingTime.split(' ')[1] || '72h'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
            </div>
            <p className={`text-[9px] sm:text-[10px] text-center leading-tight whitespace-nowrap ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              {t.freeReturns.split(' ')[0]}<br/>{t.freeReturns.split(' ')[1] || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Delivery step
  if (step === 'delivery') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>

        {/* Modal - Boxtal Map Widget for Relay Point Selection */}
        {showRelaySelector && (
          <BoxtalMapWidget
            darkMode={darkMode}
            onSelect={(point, carrier) => handleRelayPointSelect(point, carrier as RelayCarrier)}
            selectedPoint={selectedRelayPoint}
            onClose={() => setShowRelaySelector(false)}
          />
        )}

        {/* Modal - Main propre info */}
        {showHandDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHandDeliveryModal(false)}
            />
            {/* Modal content */}
            <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-black/10'}`}>
              {/* Close button */}
              <button
                onClick={() => setShowHandDeliveryModal(false)}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
              >
                <X size={18} />
              </button>

              {/* Warning icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-amber-500" />
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-2xl text-center mb-2"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.reservedOption}
              </h3>

              {/* Content */}
              <div className={`space-y-4 text-sm ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                <p className="text-center">
                  {t.handDeliveryReserved}
                </p>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <p className="font-medium mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.whatThisMeans}</p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{t.inPersonPickup}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{t.pickupAddressSent}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{t.orderCancelledIfNotClose}</span>
                    </li>
                  </ul>
                </div>

                <p className={`text-center text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {t.ifInDoubtHomeDelivery}
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => setShowHandDeliveryModal(false)}
                className="w-full mt-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.iUnderstand}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm transition-all hover:text-primary group ${darkMode ? 'text-white/60' : 'text-black/60'}`}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>{t.back}</span>
            </Link>
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <TemporalLogo size={45} />
            </Link>
            <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
              <span className="flex items-center gap-1.5">
                <Lock size={12} />
                <span>{t.securePayment}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full text-base font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  1
                </div>
                <div className="hidden sm:block">
                  <p className="text-primary text-sm font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.deliveryStep}
                  </p>
                  <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.chooseMethod}</p>
                </div>
              </div>
              {/* Connector */}
              <div className={`w-16 sm:w-24 h-0.5 mx-4 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <div className="h-full w-0 bg-primary" />
              </div>
              {/* Step 2 - Inactive */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-base border-2 ${darkMode ? 'border-white/20 text-white/30' : 'border-black/20 text-black/30'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  2
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm ${darkMode ? 'text-white/30' : 'text-black/30'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.paymentStep}
                  </p>
                  <p className={`text-[10px] ${darkMode ? 'text-white/20' : 'text-black/20'}`}>{t.finalize}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Left - Delivery options */}
            <div className="lg:col-span-2">
              <h2
                className="text-2xl md:text-3xl mb-8"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.deliveryMethod}
              </h2>

              {/* Delivery cards */}
              <div className="space-y-4">
                {/* Livraison à domicile */}
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className="w-full text-left transition-all duration-300 group"
                >
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : darkMode
                        ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        : 'border-black/10 hover:border-black/20 bg-black/[0.02]'
                  }`}>
                    <div className="flex items-center gap-5">
                      {/* Image */}
                      <div className={`relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden ${
                        darkMode ? 'bg-white/5' : 'bg-black/5'
                      }`}>
                        <Image
                          src="/livraison/camion-de-livraison.PNG"
                          alt="Livraison à domicile"
                          fill
                          className="object-contain p-2 transition-transform group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3
                              className="text-lg md:text-xl mb-1"
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {t.homeDelivery}
                            </h3>
                            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                              {t.homeDeliverySubtitle}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span
                                className={`text-lg md:text-xl ${deliveryMethod === 'delivery' ? 'text-primary' : ''}`}
                                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                              >
                                5.90€
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'}`}>
                                {t.trackingIncluded}
                              </span>
                            </div>
                          </div>
                          {/* Radio */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            deliveryMethod === 'delivery'
                              ? 'border-primary bg-primary'
                              : darkMode ? 'border-white/30' : 'border-black/30'
                          }`}>
                            {deliveryMethod === 'delivery' && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Point Relais */}
                <div className="w-full text-left transition-all duration-300">
                  <button
                    onClick={() => {
                      setDeliveryMethod('relay');
                      if (!selectedRelayPoint) {
                        setShowRelaySelector(true);
                      }
                    }}
                    className="w-full text-left transition-all duration-300 group"
                  >
                    <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                      deliveryMethod === 'relay'
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : darkMode
                          ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                          : 'border-black/10 hover:border-black/20 bg-black/[0.02]'
                    }`}>
                      <div className="flex items-center gap-5">
                        {/* Icon ou logo transporteur si sélectionné */}
                        <div className={`relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${
                          darkMode ? 'bg-white/5' : 'bg-black/5'
                        }`}>
                          {selectedRelayPoint && relayCarrier ? (
                            <Image
                              src={getCarrierInfo(relayCarrier)?.logo || ''}
                              alt={getCarrierInfo(relayCarrier)?.name || ''}
                              width={80}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <MapPin size={48} className={`transition-transform group-hover:scale-110 ${deliveryMethod === 'relay' ? 'text-primary' : darkMode ? 'text-white/30' : 'text-black/30'}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3
                                className="text-lg md:text-xl mb-1"
                                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                              >
                                {t.relayPoint}
                              </h3>
                              <p className={`text-xs md:text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                {selectedRelayPoint
                                  ? t.pickUpSubtitle
                                  : t.pickUpSubtitle
                                }
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <span
                                  className={`text-lg md:text-xl ${deliveryMethod === 'relay' ? 'text-primary' : ''}`}
                                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                >
                                  3.90€
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                                  {t.economic}
                                </span>
                              </div>
                            </div>
                            {/* Radio */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              deliveryMethod === 'relay'
                                ? 'border-primary bg-primary'
                                : darkMode ? 'border-white/30' : 'border-black/30'
                            }`}>
                              {deliveryMethod === 'relay' && <Check size={14} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Affichage du point relais sélectionné - intégré dans la carte */}
                      {deliveryMethod === 'relay' && selectedRelayPoint && (
                        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-primary flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-sm">{selectedRelayPoint.name}</p>
                                <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                  {selectedRelayPoint.address}, {selectedRelayPoint.postalCode} {selectedRelayPoint.city}
                                </p>
                                {selectedRelayPoint.distance && (
                                  <p className="text-xs text-primary mt-0.5">à {selectedRelayPoint.distance}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRelaySelector(true);
                              }}
                              className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {t.change}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Sélection du point relais si pas encore choisi */}
                  {deliveryMethod === 'relay' && !selectedRelayPoint && (
                    <div className={`mt-3 p-4 rounded-xl ${darkMode ? 'bg-white/[0.02] border border-white/10' : 'bg-black/[0.02] border border-black/10'}`}>
                      {(
                        <>
                          {/* Carriers preview */}
                          <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-white/60' : 'text-black/60'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {t.availableCarriers}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {carriers.map((carrier) => (
                              <div
                                key={carrier.id}
                                className={`h-8 px-3 rounded-lg flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}
                              >
                                <Image
                                  src={carrier.logo}
                                  alt={carrier.name}
                                  width={60}
                                  height={24}
                                  className="object-contain h-5"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Selection button */}
                          <button
                            onClick={() => setShowRelaySelector(true)}
                            className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          >
                            <MapPin size={18} />
                            {t.chooseRelayPoint}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Main propre */}
                <button
                  onClick={() => setDeliveryMethod('handDelivery')}
                  className="w-full text-left transition-all duration-300 group"
                >
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                    deliveryMethod === 'handDelivery'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : darkMode
                        ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                        : 'border-black/10 hover:border-black/20 bg-black/[0.02]'
                  }`}>
                    <div className="flex items-center gap-5">
                      {/* Image */}
                      <div className={`relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden ${
                        darkMode ? 'bg-white/5' : 'bg-black/5'
                      }`}>
                        <Image
                          src="/livraison/livraison-main-propre.PNG"
                          alt="Livraison main propre"
                          fill
                          className="object-contain p-2 transition-transform group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3
                              className="text-lg md:text-xl mb-1"
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {t.handDeliveryTitle}
                            </h3>
                            <p className={`text-xs md:text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                              {t.handDeliverySubtitle}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span
                                className="text-lg md:text-xl text-primary font-bold"
                                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                              >
                                {t.free.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {/* Radio */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            deliveryMethod === 'handDelivery'
                              ? 'border-primary bg-primary'
                              : darkMode ? 'border-white/30' : 'border-black/30'
                          }`}>
                            {deliveryMethod === 'handDelivery' && <Check size={14} className="text-white" />}
                          </div>
                        </div>

                        {/* Warning */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHandDeliveryModal(true);
                          }}
                          className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                            <p className="text-amber-600 dark:text-amber-400 text-[10px] md:text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                              {t.readConditions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Confirmation checkbox for hand delivery */}
              {deliveryMethod === 'handDelivery' && (
                <div className="mt-4">
                  <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                    showHandDeliveryConfirm
                      ? 'bg-primary/10 border-2 border-primary'
                      : darkMode ? 'bg-white/[0.02] border-2 border-white/10 hover:border-white/20' : 'bg-black/[0.02] border-2 border-black/10 hover:border-black/20'
                  }`}>
                    <div className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      showHandDeliveryConfirm
                        ? 'bg-primary border-primary'
                        : darkMode ? 'border-white/30' : 'border-black/30'
                    }`}>
                      {showHandDeliveryConfirm && <Check size={12} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={showHandDeliveryConfirm}
                      onChange={(e) => setShowHandDeliveryConfirm(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`text-sm ${darkMode ? 'text-white/80' : 'text-black/80'}`}>
                      {t.iConfirmCloseContact}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowHandDeliveryModal(true);
                        }}
                        className="text-primary underline hover:no-underline font-medium"
                      >
                        {t.conditions}
                      </button>.
                    </span>
                  </label>
                </div>
              )}

              <button
                onClick={() => {
                  if (deliveryMethod) setStep('payment');
                }}
                disabled={
                  !deliveryMethod ||
                  (deliveryMethod === 'handDelivery' && !showHandDeliveryConfirm) ||
                  (deliveryMethod === 'relay' && !selectedRelayPoint)
                }
                className="w-full mt-6 py-4 bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 group"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.continueButton}
                <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Footer links */}
              <div className={`mt-10 pt-6 border-t flex flex-wrap gap-4 text-[11px] ${darkMode ? 'border-white/10 text-white/30' : 'border-black/10 text-black/30'}`}>
                <Link href="/refund" className="hover:text-primary transition-colors">{t.refund}</Link>
                <Link href="/shipping" className="hover:text-primary transition-colors">{t.shipping}</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">{t.privacy}</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">{t.terms}</Link>
              </div>
            </div>

            {/* Right - Order summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>

      {/* Header */}
      <div className={`border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep('delivery')}
            className={`flex items-center gap-2 text-sm transition-all hover:text-primary group ${darkMode ? 'text-white/60' : 'text-black/60'}`}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>{t.back}</span>
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <TemporalLogo size={45} />
          </Link>
          <div className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
            <span className="flex items-center gap-1.5">
              <Lock size={12} />
              <span>{t.securePayment}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center">
            {/* Step 1 - Done */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <Check size={18} className="text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.deliveryStep}
                </p>
              </div>
            </div>
            {/* Connector */}
            <div className={`w-16 sm:w-24 h-0.5 mx-4 bg-primary`} />
            {/* Step 2 - Active */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full text-base font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                2
              </div>
              <div className="hidden sm:block">
                <p className="text-primary text-sm font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.paymentStep}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.finalize}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact */}
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-white/[0.02] border border-white/10' : 'bg-black/[0.02] border border-black/10'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg flex items-center gap-2"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <CreditCard size={18} className="text-primary" />
                    {t.contactSection}
                  </h3>
                  {!isAuthenticated && (
                    <Link
                      href="/profile"
                      className="text-xs text-primary hover:underline"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.logIn}
                    </Link>
                  )}
                </div>
                <input
                  type="email"
                  placeholder={t.emailAddress}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                    darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                  }`}
                />
                <label className={`flex items-center gap-2.5 mt-4 text-xs cursor-pointer ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    newsletter
                      ? 'bg-primary border-primary'
                      : darkMode ? 'border-white/30' : 'border-black/30'
                  }`}>
                    {newsletter && <Check size={10} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="sr-only"
                  />
                  {t.receiveOffersEmail}
                </label>
              </div>

              {/* Delivery info */}
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-white/[0.02] border border-white/10' : 'bg-black/[0.02] border border-black/10'}`}>
                <h3
                  className="text-lg mb-4 flex items-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <Package size={18} className="text-primary" />
                  {t.deliveryInformation}
                </h3>
                <div className="space-y-3">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                      darkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'
                    }`}
                  >
                    <option value="France" className={darkMode ? 'bg-black' : 'bg-white'}>France</option>
                    <option value="Belgique" className={darkMode ? 'bg-black' : 'bg-white'}>Belgique</option>
                    <option value="Suisse" className={darkMode ? 'bg-black' : 'bg-white'}>Suisse</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t.firstName}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                        darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder={t.lastName}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                        darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                      }`}
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder={t.phone}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                      darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                    }`}
                  />
                  {deliveryMethod === 'delivery' && (
                    <>
                      <input
                        type="text"
                        placeholder={t.address}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                          darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                        }`}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={t.postalCode}
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                          className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                            darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder={t.city}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm ${
                            darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                          }`}
                        />
                      </div>
                    </>
                  )}
                  <textarea
                    placeholder={t.notes}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-3.5 bg-transparent border-2 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm resize-none ${
                      darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-all rounded-xl flex items-center justify-center gap-3 group shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {t.pay} {Number(finalTotal).toFixed(2)}€
                  </>
                )}
              </button>

              <p className={`text-center text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                {t.stripeRedirect}
              </p>
            </form>

            {/* Footer links */}
            <div className={`mt-10 pt-6 border-t flex flex-wrap gap-4 text-[11px] ${darkMode ? 'border-white/10 text-white/30' : 'border-black/10 text-black/30'}`}>
              <Link href="/refund" className="hover:text-primary transition-colors">{t.refund}</Link>
              <Link href="/shipping" className="hover:text-primary transition-colors">{t.shipping}</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">{t.privacy}</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">{t.terms}</Link>
            </div>
          </div>

          {/* Right - Order summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
