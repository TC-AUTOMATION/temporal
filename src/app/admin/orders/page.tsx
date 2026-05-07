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
  Send,
  Download,
  ExternalLink,
  RefreshCw,
  FileText,
  Navigation,
  Home,
  Copy,
  Check,
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, updateOrderStatus, fetchOrders, createShipment, getShipmentLabel, isLoading } = useAdminStore();
  const { darkMode, language } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentMessage, setShipmentMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [boxtalHelperOpen, setBoxtalHelperOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [parcelModalOpen, setParcelModalOpen] = useState(false);
  const [parcelInput, setParcelInput] = useState({ weight: '0.5', length: '30', width: '25', height: '5' });

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(prev => (prev === fieldId ? null : prev)), 1500);
    } catch {
      // ignore
    }
  };

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
    relay: language === 'fr' ? 'Point relais' : 'Relay point',
    relayDelivery: language === 'fr' ? 'Point relais' : 'Relay point',
    createShipment: language === 'fr' ? 'CRÉER ENVOI BOXTAL' : 'CREATE BOXTAL SHIPMENT',
    printLabel: language === 'fr' ? 'ÉTIQUETTE' : 'LABEL',
    printSlip: language === 'fr' ? 'BON DE COMMANDE' : 'ORDER SLIP',
    shipmentCreating: language === 'fr' ? 'CRÉATION...' : 'CREATING...',
    viewTracking: language === 'fr' ? 'VOIR LE SUIVI' : 'VIEW TRACKING',
    carrier: language === 'fr' ? 'Transporteur' : 'Carrier',
    relayInfo: language === 'fr' ? 'POINT RELAIS' : 'RELAY POINT',
    shipmentInfo: language === 'fr' ? 'EXPÉDITION' : 'SHIPMENT',
    downloadLabel: language === 'fr' ? 'TÉLÉCHARGER ÉTIQUETTE' : 'DOWNLOAD LABEL',
    markShipped: language === 'fr' ? 'MARQUER EXPÉDIÉ' : 'MARK SHIPPED',
    markDelivered: language === 'fr' ? 'MARQUER LIVRÉ' : 'MARK DELIVERED',
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
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (o.trackingNumber || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
        o.status === statusFilter ||
        (statusFilter === 'handDelivery' && o.deliveryMethod === 'handDelivery') ||
        (statusFilter === 'relay' && o.deliveryMethod === 'relay');
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
            <option value="relay" className={darkMode ? 'bg-black' : 'bg-white'}>{t.relay.toUpperCase()}</option>
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
                      {order.deliveryMethod === 'relay' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <MapPin size={10} />
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
                      {selectedOrder.deliveryMethod === 'relay' ? <MapPin size={14} className="text-primary" /> : <Truck size={14} className="text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs text-white/50">{t.delivery}</p>
                      <p className="text-white text-sm">
                        {selectedOrder.deliveryMethod === 'relay'
                          ? t.relayDelivery
                          : selectedOrder.deliveryMethod === 'handDelivery'
                            ? t.handDelivery
                            : t.standardDelivery}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relay Point Info */}
              {selectedOrder.deliveryMethod === 'relay' && selectedOrder.relayPointName && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                  <h4 className="text-sm text-blue-400 mb-2 flex items-center gap-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    <MapPin size={16} />
                    {t.relayInfo}
                  </h4>
                  <div className="text-sm text-blue-300/80 space-y-1">
                    <p className="font-medium">{selectedOrder.relayPointName}</p>
                    {selectedOrder.relayPointAddress && <p>{selectedOrder.relayPointAddress}</p>}
                    {selectedOrder.relayCarrier && (
                      <p className="text-xs text-blue-400/60">{t.carrier}: {
                        { mondial_relay: 'Mondial Relay', colissimo: 'Colissimo', chronopost: 'Chronopost', ups: 'UPS' }[selectedOrder.relayCarrier] || selectedOrder.relayCarrier
                      }</p>
                    )}
                  </div>
                </div>
              )}

              {/* Shipment Info */}
              {selectedOrder.shipment && (
                <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                  <h4 className="text-sm text-indigo-400 mb-2 flex items-center gap-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    <Navigation size={16} />
                    {t.shipmentInfo}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.shipment.carrier && (
                      <div>
                        <p className="text-xs text-indigo-400/60">{t.carrier}</p>
                        <p className="text-sm text-indigo-300">{
                          { mondial_relay: 'Mondial Relay', colissimo: 'Colissimo', chronopost: 'Chronopost', ups: 'UPS', main_propre: 'Main propre' }[selectedOrder.shipment.carrier] || selectedOrder.shipment.carrier
                        }</p>
                      </div>
                    )}
                    {selectedOrder.shipment.trackingNumber && (
                      <div>
                        <p className="text-xs text-indigo-400/60">{t.trackingNumber}</p>
                        <p className="text-sm text-indigo-300 font-mono">{selectedOrder.shipment.trackingNumber}</p>
                      </div>
                    )}
                    {selectedOrder.shipment.labelUrl && (
                      <a
                        href={selectedOrder.shipment.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-400 text-xs transition-colors col-span-2 w-fit"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                      >
                        <Download size={12} />
                        {t.downloadLabel}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Shipment Actions */}
              {selectedOrder.deliveryMethod !== 'handDelivery' && !selectedOrder.trackingNumber && !selectedOrder.shipment?.trackingNumber && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        // Pre-fill weight from item count (0.3kg/item heuristic), keep last edited dimensions
                        const totalItems = selectedOrder.items.reduce((s, it) => s + it.quantity, 0);
                        const estWeight = Math.max(0.3, totalItems * 0.3).toFixed(2);
                        setParcelInput((prev) => ({ ...prev, weight: estWeight }));
                        setShipmentMessage(null);
                        setParcelModalOpen(true);
                      }}
                      disabled={shipmentLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors disabled:opacity-50"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {shipmentLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                      {shipmentLoading ? t.shipmentCreating : t.createShipment}
                    </button>
                    <button
                      onClick={() => setBoxtalHelperOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-xl text-indigo-300 transition-colors"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      <Copy size={14} />
                      {language === 'fr' ? 'PRÉPARER ENVOI MANUEL' : 'PREPARE MANUAL SHIPMENT'}
                    </button>
                    {shipmentMessage?.success && (
                      <span className="text-xs text-green-400">{shipmentMessage.text}</span>
                    )}
                  </div>
                  {shipmentMessage && !shipmentMessage.success && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                      <p className="text-xs text-red-400 font-medium">{shipmentMessage.text}</p>
                      <p className="text-xs text-white/60">
                        {language === 'fr'
                          ? 'Solution manuelle : cliquez PRÉPARER ENVOI MANUEL pour copier-coller les champs dans Boxtal en 30 secondes.'
                          : 'Manual workaround: click PREPARE MANUAL SHIPMENT to get one-click copy fields for the Boxtal form.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick status buttons */}
              {selectedOrder.trackingNumber && ['pending', 'confirmed', 'preparing'].includes(selectedOrder.status) && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'shipped');
                    setSelectedOrder({ ...selectedOrder, status: 'shipped' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-xl text-indigo-400 transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <Truck size={14} />
                  {t.markShipped}
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'delivered');
                    setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 rounded-xl text-green-400 transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <CheckCircle size={14} />
                  {t.markDelivered}
                </button>
              )}

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

      {/* Boxtal manual-entry helper modal */}
      {boxtalHelperOpen && selectedOrder && (() => {
        const o = selectedOrder;
        const isRelay = o.deliveryMethod === 'relay';
        const items = o.items || [];
        const totalItems = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
        const weight = Math.max(0.3, totalItems * 0.3);
        const declaredValue = Math.round(Number(o.total) || 0);

        const shipStreet = o.relayPointAddress || o.customer.address || '';
        const shipCity = isRelay
          ? (o.relayPointName ? `${o.relayPointName} · ${o.customer.city || ''}` : o.customer.city || '')
          : (o.customer.city || '');
        const shipPostal = o.customer.postalCode || '';
        const customerFullName = `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim();

        const fields: Array<{ id: string; label: string; value: string; hint?: string }> = [
          // DÉPART — Temporal shop (shipper)
          { id: 'dep-firstName', label: 'Départ · Prénom', value: 'Tom' },
          { id: 'dep-lastName', label: 'Départ · Nom', value: 'Pradel' },
          { id: 'dep-company', label: 'Départ · Société', value: 'Temporal' },
          { id: 'dep-street', label: 'Départ · Adresse', value: '22 Rue Pierre Brossolette' },
          { id: 'dep-postal', label: 'Départ · Code postal + ville', value: '27000 Évreux' },
          { id: 'dep-email', label: 'Départ · Email', value: 'contact@temporal-clothes.com' },
          { id: 'dep-phone', label: 'Départ · Mobile', value: '07 68 28 13 95' },
          // ARRIVÉE — customer
          { id: 'arr-firstName', label: 'Arrivée · Prénom', value: o.customer.firstName || '' },
          { id: 'arr-lastName', label: 'Arrivée · Nom', value: o.customer.lastName || '' },
          { id: 'arr-street', label: 'Arrivée · Adresse', value: shipStreet, hint: isRelay ? `Point relais ${o.relayCarrier || ''}` : undefined },
          { id: 'arr-postal', label: 'Arrivée · Code postal + ville', value: `${shipPostal} ${shipCity}`.trim() },
          { id: 'arr-email', label: 'Arrivée · Email', value: o.customer.email || '' },
          { id: 'arr-phone', label: 'Arrivée · Mobile', value: o.customer.phone || '' },
          // COLIS
          { id: 'pkg-length', label: 'Colis · L (cm)', value: '30' },
          { id: 'pkg-width', label: 'Colis · l (cm)', value: '25' },
          { id: 'pkg-height', label: 'Colis · H (cm)', value: '5' },
          { id: 'pkg-weight', label: 'Colis · Poids (kg)', value: weight.toFixed(1) },
          { id: 'pkg-value', label: 'Colis · Valeur (€)', value: String(declaredValue) },
          // CONTENU
          { id: 'content-desc', label: 'Description du contenu', value: 'Vêtements Temporal' },
          { id: 'content-cat', label: 'Catégorie', value: 'Tissus, vêtements neufs', hint: 'Tapez "vêtement" dans le champ Catégorie' },
          // RÉFÉRENCE
          { id: 'ref', label: 'Référence interne', value: o.orderNumber || '' },
        ];

        const copyAll = () => {
          const text = [
            '=== DÉPART ===',
            'Tom Pradel · Temporal',
            '22 Rue Pierre Brossolette',
            '27000 Évreux',
            'contact@temporal-clothes.com',
            '+33 7 68 28 13 95',
            '',
            '=== ARRIVÉE ===',
            customerFullName,
            shipStreet,
            `${shipPostal} ${shipCity}`.trim(),
            o.customer.email || '',
            o.customer.phone || '',
            '',
            '=== COLIS ===',
            `30 × 25 × 5 cm · ${weight.toFixed(1)} kg · ${declaredValue}€`,
            'Contenu : Vêtements Temporal',
            'Catégorie : Tissus, vêtements neufs',
            '',
            `Référence : ${o.orderNumber}`,
          ].join('\n');
          copyToClipboard(text, 'all');
        };

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-white/10 bg-zinc-900 text-white">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Copy className="text-indigo-300" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      PRÉPARER ENVOI BOXTAL · {o.orderNumber}
                    </h2>
                    <p className="text-xs text-white/50">
                      Copiez chaque champ, puis collez dans le formulaire Boxtal.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBoxtalHelperOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Top actions */}
              <div className="p-4 border-b border-white/10 flex items-center gap-2 flex-wrap">
                <a
                  href="https://shipping.boxtal.com/fr/fr/app/envoyer-colis/criteres"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  OUVRIR LE FORMULAIRE BOXTAL ↗
                </a>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"
                >
                  {copiedField === 'all' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedField === 'all' ? 'Copié !' : 'Tout copier (texte)'}
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {/* Shipping method banner */}
                <div className={`p-3 rounded-xl border text-sm ${isRelay ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'}`}>
                  <strong>{isRelay ? 'Point relais' : 'Livraison à domicile'}</strong>
                  {isRelay && o.relayCarrier && <> · {o.relayCarrier.replace('_', ' ')} · {o.relayPointName || ''}</>}
                  {isRelay && <div className="text-xs text-white/60 mt-1">Dans Boxtal, dans les critères : choisissez une offre <strong>Point Relais</strong> du bon transporteur.</div>}
                </div>

                {fields.map(f => {
                  const isCopied = copiedField === f.id;
                  return (
                    <div
                      key={f.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        isCopied ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 mb-0.5" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                          {f.label}
                        </p>
                        <p className="font-mono text-sm break-all">{f.value || <span className="text-white/30">—</span>}</p>
                        {f.hint && <p className="text-[11px] text-white/40 mt-0.5">{f.hint}</p>}
                      </div>
                      {f.value && (
                        <button
                          onClick={() => copyToClipboard(f.value, f.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0 ${
                            isCopied
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/10 hover:bg-white/20 text-white/70'
                          }`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {isCopied ? <><Check size={12} /> OK</> : <><Copy size={12} /> COPIER</>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 text-xs text-white/60 space-y-1">
                <p>
                  <strong className="text-white/80">Étapes :</strong> Ouvrez Boxtal ↗ → copiez chaque champ →
                  remplissez le formulaire → payez → récupérez le numéro de suivi → collez-le dans le champ <strong>NUMÉRO DE SUIVI</strong> plus haut.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Parcel dimensions modal */}
      {parcelModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !shipmentLoading && setParcelModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/10'} shadow-2xl`}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3
                className={`text-lg ${darkMode ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {language === 'fr' ? 'DIMENSIONS DU COLIS' : 'PARCEL DIMENSIONS'}
              </h3>
              <button
                onClick={() => !shipmentLoading && setParcelModalOpen(false)}
                className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr'
                  ? 'Renseignez le poids et les dimensions réels du colis avant l\'envoi à Boxtal.'
                  : 'Provide the actual parcel weight and dimensions before sending to Boxtal.'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {language === 'fr' ? 'Poids (kg)' : 'Weight (kg)'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={parcelInput.weight}
                    onChange={(e) => setParcelInput({ ...parcelInput, weight: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-black/5 border border-black/10 text-black'}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {language === 'fr' ? 'Longueur (cm)' : 'Length (cm)'}
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={parcelInput.length}
                    onChange={(e) => setParcelInput({ ...parcelInput, length: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-black/5 border border-black/10 text-black'}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {language === 'fr' ? 'Largeur (cm)' : 'Width (cm)'}
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={parcelInput.width}
                    onChange={(e) => setParcelInput({ ...parcelInput, width: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-black/5 border border-black/10 text-black'}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={`text-xs ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {language === 'fr' ? 'Hauteur (cm)' : 'Height (cm)'}
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={parcelInput.height}
                    onChange={(e) => setParcelInput({ ...parcelInput, height: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-black/5 border border-black/10 text-black'}`}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5">
              <button
                onClick={() => setParcelModalOpen(false)}
                disabled={shipmentLoading}
                className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'text-white/70 hover:bg-white/5' : 'text-black/70 hover:bg-black/5'} disabled:opacity-50`}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  const weight = parseFloat(parcelInput.weight);
                  const length = parseInt(parcelInput.length, 10);
                  const width = parseInt(parcelInput.width, 10);
                  const height = parseInt(parcelInput.height, 10);
                  if (!Number.isFinite(weight) || weight <= 0 || !length || !width || !height) {
                    setShipmentMessage({ success: false, text: language === 'fr' ? 'Valeurs invalides' : 'Invalid values' });
                    return;
                  }
                  setShipmentLoading(true);
                  const result = await createShipment(selectedOrder.id, { weight, length, width, height });
                  setShipmentLoading(false);
                  setParcelModalOpen(false);
                  if (result.success) {
                    setShipmentMessage({ success: true, text: `Envoi créé - Tracking: ${result.trackingNumber || 'N/A'}` });
                    await fetchOrders();
                    const updated = useAdminStore.getState().orders.find(o => o.id === selectedOrder.id);
                    if (updated) setSelectedOrder(updated);
                  } else {
                    setShipmentMessage({ success: false, text: result.error || 'Erreur' });
                  }
                }}
                disabled={shipmentLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary text-sm transition-colors disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {shipmentLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {shipmentLoading ? (language === 'fr' ? 'CRÉATION...' : 'CREATING...') : (language === 'fr' ? 'CRÉER ENVOI' : 'CREATE SHIPMENT')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
