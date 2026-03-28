'use client';

import { useState, useEffect } from 'react';
import { useAdminStore, Order } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  X,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  HandMetal,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, updateOrderStatus, fetchOrders, isLoading } = useAdminStore();
  const { darkMode, language } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Translations
  const t = {
    pending: language === 'fr' ? 'En attente' : 'Pending',
    confirmed: language === 'fr' ? 'Confirmé' : 'Confirmed',
    preparing: language === 'fr' ? 'Préparation' : 'Preparing',
    shipped: language === 'fr' ? 'Expédié' : 'Shipped',
    delivered: language === 'fr' ? 'Livré' : 'Delivered',
    cancelled: language === 'fr' ? 'Annulé' : 'Cancelled',
    refunded: language === 'fr' ? 'Remboursé' : 'Refunded',
    paid: language === 'fr' ? 'Payé' : 'Paid',
    failed: language === 'fr' ? 'Échoué' : 'Failed',
    handDelivery: language === 'fr' ? 'Remise en main propre' : 'Hand delivery',
    handDeliveryPending: language === 'fr' ? 'COMMANDE(S) REMISE EN MAIN PROPRE EN ATTENTE' : 'HAND DELIVERY ORDER(S) PENDING',
    handDeliveryWaiting: language === 'fr' ? 'Des clients attendent la validation pour récupérer leur commande.' : 'Customers are waiting for validation to pick up their order by hand.',
    view: language === 'fr' ? 'VOIR' : 'VIEW',
    inPreparation: language === 'fr' ? 'En préparation' : 'In preparation',
    searchPlaceholder: language === 'fr' ? 'Rechercher par numéro, email ou nom...' : 'Search by number, email or name...',
    allStatuses: language === 'fr' ? 'TOUS LES STATUTS' : 'ALL STATUSES',
    order: language === 'fr' ? 'Commande' : 'Order',
    customer: language === 'fr' ? 'Client' : 'Customer',
    date: language === 'fr' ? 'Date' : 'Date',
    total: language === 'fr' ? 'Total' : 'Total',
    status: language === 'fr' ? 'Statut' : 'Status',
    payment: language === 'fr' ? 'Paiement' : 'Payment',
    actions: language === 'fr' ? 'Actions' : 'Actions',
    details: language === 'fr' ? 'DÉTAILS' : 'DETAILS',
    noOrders: language === 'fr' ? 'AUCUNE COMMANDE TROUVÉE' : 'NO ORDERS FOUND',
    item: language === 'fr' ? 'article' : 'item',
    items: language === 'fr' ? 'articles' : 'items',
    orderStatus: language === 'fr' ? 'STATUT COMMANDE' : 'ORDER STATUS',
    paymentStatus: language === 'fr' ? 'STATUT PAIEMENT' : 'PAYMENT STATUS',
    managedByStripe: language === 'fr' ? '(Géré par Stripe)' : '(Managed by Stripe)',
    trackingNumber: language === 'fr' ? 'NUMÉRO DE SUIVI' : 'TRACKING NUMBER',
    enterTracking: language === 'fr' ? 'Entrez le numéro de suivi' : 'Enter tracking number',
    customerInfo: language === 'fr' ? 'INFORMATIONS CLIENT' : 'CUSTOMER INFORMATION',
    email: 'Email',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    address: language === 'fr' ? 'Adresse' : 'Address',
    delivery: language === 'fr' ? 'Livraison' : 'Delivery',
    standardDelivery: language === 'fr' ? 'Livraison standard' : 'Standard delivery',
    orderedItems: language === 'fr' ? 'ARTICLES COMMANDÉS' : 'ORDERED ITEMS',
    size: language === 'fr' ? 'Taille' : 'Size',
    color: language === 'fr' ? 'Couleur' : 'Color',
    qty: language === 'fr' ? 'Qté' : 'Qty',
    subtotal: language === 'fr' ? 'Sous-total' : 'Subtotal',
    free: language === 'fr' ? 'Gratuit' : 'Free',
    discount: language === 'fr' ? 'Réduction' : 'Discount',
    close: language === 'fr' ? 'FERMER' : 'CLOSE',
    save: language === 'fr' ? 'SAUVEGARDER' : 'SAVE',
  };

  const statusOptions = [
    { value: 'pending', label: t.pending, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'confirmed', label: t.confirmed, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'preparing', label: t.preparing, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'shipped', label: t.shipped, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { value: 'delivered', label: t.delivered, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'cancelled', label: t.cancelled, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'refunded', label: t.refunded, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: t.pending, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'paid', label: t.paid, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'failed', label: t.failed, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'refunded', label: t.refunded, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  ];

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync tracking input when selected order changes
  useEffect(() => {
    setTrackingInput(selectedOrder?.trackingNumber || '');
  }, [selectedOrder?.id]);

  const filteredOrders = orders
    .filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
        o.status === statusFilter ||
        (statusFilter === 'handDelivery' && o.deliveryMethod === 'handDelivery');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const options = type === 'order' ? statusOptions : paymentStatusOptions;
    const option = options.find((o) => o.value === status);
    return option ? (
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${option.color}`}>
        {option.label}
      </span>
    ) : (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">{status}</span>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleTrackingUpdate = async (orderId: string, trackingNumber: string, trackingUrl?: string) => {
    await updateOrderStatus(orderId, selectedOrder?.status || 'preparing', trackingNumber, trackingUrl);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, trackingNumber, trackingUrl });
    }
  };

  const orderStats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    handDeliveryPending: orders.filter((o) => o.deliveryMethod === 'handDelivery' && o.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Alert for hand delivery pending */}
      {orderStats.handDeliveryPending > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/30">
            <AlertCircle size={24} className="text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {orderStats.handDeliveryPending} {t.handDeliveryPending}
            </p>
            <p className="text-sm text-white/60">
              {t.handDeliveryWaiting}
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('handDelivery')}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 transition-colors"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {t.view}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.pending}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.pending}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Package size={20} className="text-purple-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.preparing}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.inPreparation}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20">
              <Truck size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.shipped}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.shipped}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.delivered}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.delivered}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20">
              <HandMetal size={20} className="text-orange-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.handDeliveryPending}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.handDelivery}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
          <input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`appearance-none px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:border-primary transition-colors cursor-pointer ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <option value="all" className={darkMode ? 'bg-black' : 'bg-white'}>{t.allStatuses}</option>
            <option value="handDelivery" className={darkMode ? 'bg-black' : 'bg-white'}>{t.handDelivery.toUpperCase()}</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className={darkMode ? 'bg-black' : 'bg-white'}>
                {opt.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Orders Table */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.order}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.customer}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.date}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.total}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.status}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.payment}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        {order.orderNumber}
                      </p>
                      {order.deliveryMethod === 'handDelivery' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          <HandMetal size={10} />
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {order.items.length} {order.items.length > 1 ? t.items : t.item}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{order.customer.email}</p>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>{new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {new Date(order.createdAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {Number(order.total).toFixed(2)}€
                    </p>
                    {order.discount > 0 && (
                      <p className="text-xs text-green-400">-{Number(order.discount).toFixed(2)}€</p>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(order.status, 'order')}</td>
                  <td className="p-4">{getStatusBadge(order.paymentStatus, 'payment')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors ${darkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-700'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      {t.details}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noOrders}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2
                  className="text-xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.order.toUpperCase()} {selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-white/50">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-2 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.orderStatus}
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-black">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.paymentStatus}
                  </label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                    {getStatusBadge(selectedOrder.paymentStatus, 'payment')}
                    <span className="text-xs text-white/30 ml-2">{t.managedByStripe}</span>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              <div>
                <label className="text-xs text-white/50 mb-2 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.trackingNumber}
                </label>
                <div className="flex gap-2">
                  <input
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder={t.enterTracking}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={() => handleTrackingUpdate(selectedOrder.id, trackingInput)}
                    disabled={trackingInput === (selectedOrder.trackingNumber || '')}
                    className="px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <Save size={14} />
                    {t.save}
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.customerInfo}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Mail size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">{t.email}</p>
                      <p className="text-white text-sm">{selectedOrder.customer.email}</p>
                    </div>
                  </div>
                  {selectedOrder.customer.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Phone size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">{t.phone}</p>
                        <p className="text-white text-sm">{selectedOrder.customer.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.customer.address && (
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">{t.address}</p>
                        <p className="text-white text-sm">
                          {selectedOrder.customer.address}, {selectedOrder.customer.postalCode} {selectedOrder.customer.city}, {selectedOrder.customer.country}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Truck size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">{t.delivery}</p>
                      <p className="text-white text-sm">
                        {selectedOrder.deliveryMethod === 'delivery' ? t.standardDelivery : t.handDelivery}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.orderedItems}
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div>
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-sm text-white/50">
                          {t.size}: {item.size} • {t.color}: {item.color} • {t.qty}: {item.quantity}
                        </p>
                      </div>
                      <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {(Number(item.price) * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div className="flex justify-between text-white/70">
                  <span>{t.subtotal}</span>
                  <span>{Number(selectedOrder.subtotal).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>{t.delivery}</span>
                  <span>{selectedOrder.shipping === 0 ? t.free : `${Number(selectedOrder.shipping).toFixed(2)}€`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>{t.discount} {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}</span>
                    <span>-{Number(selectedOrder.discount).toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-xl pt-3 border-t border-white/10" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  <span>TOTAL</span>
                  <span className="text-primary">{Number(selectedOrder.total).toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
