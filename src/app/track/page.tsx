'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import {
  Package,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

interface OrderItem {
  id: string;
  productName: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  shippingCity: string | null;
  shippingCountry: string | null;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

const statusSteps = [
  { status: 'PENDING', label: 'Commande reçue', labelEn: 'Order Received', icon: ShoppingBag },
  { status: 'CONFIRMED', label: 'Confirmée', labelEn: 'Confirmed', icon: CheckCircle },
  { status: 'PREPARING', label: 'En préparation', labelEn: 'Preparing', icon: Package },
  { status: 'SHIPPED', label: 'Expédiée', labelEn: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Livrée', labelEn: 'Delivered', icon: MapPin },
];

export default function TrackOrderPage() {
  const { darkMode, language } = useStore();
  const t = translations[language];

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim() });
      if (email.trim()) {
        params.append('email', email.trim());
      }

      const response = await fetch(`/api/orders/track?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.orderNotFound);
      }

      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorOccurred);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') return -1;
    return statusSteps.findIndex(s => s.status === order.status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-500';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'text-blue-500';
      case 'SHIPPED':
        return 'text-purple-500';
      case 'DELIVERED':
        return 'text-green-500';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { fr: string; en: string }> = {
      PENDING: { fr: 'En attente', en: 'Pending' },
      CONFIRMED: { fr: 'Confirmée', en: 'Confirmed' },
      PREPARING: { fr: 'En préparation', en: 'Preparing' },
      SHIPPED: { fr: 'Expédiée', en: 'Shipped' },
      DELIVERED: { fr: 'Livrée', en: 'Delivered' },
      CANCELLED: { fr: 'Annulée', en: 'Cancelled' },
      REFUNDED: { fr: 'Remboursée', en: 'Refunded' },
    };
    return labels[status]?.[language] || status;
  };

  const currentStep = getCurrentStep();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Header />
        <Sidebar />

        <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
          {/* Back link */}
          <Link
            href="/"
            className={`inline-flex items-center gap-2 mb-8 transition-colors ${
              darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={18} />
            {t.back}
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-white" />
            </div>
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.trackOrder}
            </h1>
            <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
              {t.trackOrderSubtitle}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4 mb-12">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {t.enterOrderNumber} *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder={t.orderNumberPlaceholder}
                  required
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {t.emailForDetails}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !orderNumber.trim()}
              className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  {t.searchOrder}
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Order Result */}
          {order && (
            <div className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              {/* Order Header */}
              <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {t.orderLabel}
                    </p>
                    <h2
                      className="text-2xl text-primary"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {order.orderNumber}
                    </h2>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 ${
                    order.status === 'CANCELLED' || order.status === 'REFUNDED'
                      ? 'bg-red-500/10'
                      : order.status === 'DELIVERED'
                        ? 'bg-green-500/10'
                        : 'bg-primary/10'
                  }`}>
                    {order.status === 'DELIVERED' ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : order.status === 'CANCELLED' || order.status === 'REFUNDED' ? (
                      <AlertCircle size={18} className="text-red-500" />
                    ) : (
                      <Clock size={18} className="text-primary" />
                    )}
                    <span className={`font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                <div className={`mt-4 flex flex-wrap gap-6 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} />
                    {order.paymentStatus === 'PAID' ? (
                      <span className="text-green-500">{t.paymentStatusPaid}</span>
                    ) : (
                      <span className="text-yellow-500">{t.paymentStatusPending}</span>
                    )}
                  </div>
                  {order.deliveryMethod === 'HAND_DELIVERY' && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {t.handDelivery}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Steps */}
              {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                <div className={`p-6 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/[0.02]'}`}>
                  <div className="flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                          {/* Connector line */}
                          {index > 0 && (
                            <div
                              className={`absolute h-0.5 w-full -translate-y-4 ${
                                index <= currentStep ? 'bg-primary' : (darkMode ? 'bg-white/10' : 'bg-black/10')
                              }`}
                              style={{ left: '-50%' }}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                              isCurrent
                                ? 'bg-primary text-white scale-110'
                                : isActive
                                  ? 'bg-primary/20 text-primary'
                                  : darkMode
                                    ? 'bg-white/10 text-white/30'
                                    : 'bg-black/10 text-black/30'
                            }`}
                          >
                            <Icon size={18} />
                          </div>

                          {/* Label */}
                          <p
                            className={`mt-2 text-xs text-center ${
                              isActive
                                ? (darkMode ? 'text-white' : 'text-black')
                                : (darkMode ? 'text-white/40' : 'text-black/40')
                            }`}
                          >
                            {language === 'fr' ? step.label : step.labelEn}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <h3
                    className="text-lg mb-3"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {t.trackPackage}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 px-4 py-3 font-mono ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      {order.trackingNumber}
                    </div>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        <ExternalLink size={16} />
                        {t.trackPackageExternal.toUpperCase()}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {t.orderItems}
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 flex items-center justify-between ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                          {item.color && item.size
                            ? `${item.color} / ${item.size}`
                            : item.color || item.size || ''}
                          {' · '}{t.quantity}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{parseFloat(item.totalPrice).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-white/60' : 'text-black/60'}>
                      {t.subtotal}
                    </span>
                    <span>{parseFloat(order.subtotal).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-white/60' : 'text-black/60'}>
                      {t.shipping}
                    </span>
                    <span>{parseFloat(order.shippingCost).toFixed(2)}€</span>
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>{t.discount}</span>
                      <span>-{parseFloat(order.discount).toFixed(2)}€</span>
                    </div>
                  )}
                  <div className={`flex justify-between pt-3 mt-3 border-t text-lg font-bold ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                    <span>TOTAL</span>
                    <span className="text-primary">{parseFloat(order.total).toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className={`p-6 border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/[0.02]'}`}>
                <p className={`text-center text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {language === 'fr' ? 'Un problème avec votre commande ?' : 'Having an issue with your order?'}
                  {' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    {t.contact}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* No result state */}
          {hasSearched && !order && !error && !isLoading && (
            <div className={`p-12 text-center ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
              <Package size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
              <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
                {t.orderNotFound}
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
