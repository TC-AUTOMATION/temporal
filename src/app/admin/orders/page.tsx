'use client';

import { useState } from 'react';
import { useAdminStore, Order } from '@/stores/useAdminStore';
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
} from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'preparing', label: 'Préparation', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'shipped', label: 'Expédiée', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'refunded', label: 'Remboursée', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'paid', label: 'Payée', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'failed', label: 'Échouée', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'refunded', label: 'Remboursée', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

export default function OrdersPage() {
  const { orders, updateOrderStatus, updatePaymentStatus, updateOrder } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders
    .filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
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

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handlePaymentStatusChange = (orderId: string, newStatus: Order['paymentStatus']) => {
    updatePaymentStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
    }
  };

  const handleTrackingUpdate = (orderId: string, trackingNumber: string) => {
    updateOrder(orderId, { trackingNumber });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, trackingNumber });
    }
  };

  const orderStats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.pending}
              </p>
              <p className="text-xs text-white/50">En attente</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Package size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.preparing}
              </p>
              <p className="text-xs text-white/50">En préparation</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20">
              <Truck size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.shipped}
              </p>
              <p className="text-xs text-white/50">Expédiées</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {orderStats.delivered}
              </p>
              <p className="text-xs text-white/50">Livrées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            placeholder="Rechercher par numéro, email ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <option value="all" className="bg-black">TOUS LES STATUTS</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black">
                {opt.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Commande</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Client</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Date</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Total</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Statut</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Paiement</th>
                <th className="text-left p-4 text-xs text-white/50 uppercase tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-white/40">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-xs text-white/40">{order.customer.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-white/40">
                      {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {order.total.toFixed(2)}€
                    </p>
                    {order.discount > 0 && (
                      <p className="text-xs text-green-400">-{order.discount.toFixed(2)}€</p>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(order.status, 'order')}</td>
                  <td className="p-4">{getStatusBadge(order.paymentStatus, 'payment')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white/70 hover:text-primary transition-colors"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      DÉTAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              AUCUNE COMMANDE TROUVÉE
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
                  COMMANDE {selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-white/50">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
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
                    STATUT COMMANDE
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
                    STATUT PAIEMENT
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value as Order['paymentStatus'])}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {paymentStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-black">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tracking */}
              <div>
                <label className="text-xs text-white/50 mb-2 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  NUMÉRO DE SUIVI
                </label>
                <input
                  value={selectedOrder.trackingNumber || ''}
                  onChange={(e) => handleTrackingUpdate(selectedOrder.id, e.target.value)}
                  placeholder="Entrer le numéro de suivi"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Customer Info */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  INFORMATIONS CLIENT
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Mail size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Email</p>
                      <p className="text-white text-sm">{selectedOrder.customer.email}</p>
                    </div>
                  </div>
                  {selectedOrder.customer.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Phone size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Téléphone</p>
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
                        <p className="text-xs text-white/50">Adresse</p>
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
                      <p className="text-xs text-white/50">Livraison</p>
                      <p className="text-white text-sm">
                        {selectedOrder.deliveryMethod === 'delivery' ? 'Livraison standard' : 'Remise en main propre'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  ARTICLES COMMANDÉS
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
                          Taille: {item.size} • Couleur: {item.color} • Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {(item.price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div className="flex justify-between text-white/70">
                  <span>Sous-total</span>
                  <span>{selectedOrder.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Livraison</span>
                  <span>{selectedOrder.shipping === 0 ? 'Gratuit' : `${selectedOrder.shipping.toFixed(2)}€`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Réduction {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}</span>
                    <span>-{selectedOrder.discount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-xl pt-3 border-t border-white/10" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  <span>TOTAL</span>
                  <span className="text-primary">{selectedOrder.total.toFixed(2)}€</span>
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
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
