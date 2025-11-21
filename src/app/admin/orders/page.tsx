'use client';

import { useState } from 'react';
import { useAdminStore, Order } from '@/stores/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const statusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Préparation', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Payée', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Échouée', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
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
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro, email ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md bg-white"
        >
          <option value="all">Tous les statuts</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">En préparation</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'preparing').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Expédiées</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'shipped').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Livrées</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Commande</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Paiement</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </td>
                    <td className="p-4">
                      <p>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{order.total.toFixed(2)} €</p>
                      {order.discount > 0 && (
                        <p className="text-sm text-green-600">-{order.discount.toFixed(2)} €</p>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(order.status, 'order')}</td>
                    <td className="p-4">{getStatusBadge(order.paymentStatus, 'payment')}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">Aucune commande trouvée</div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Commande {selectedOrder.orderNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status Management */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Statut commande</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder.id, e.target.value as Order['status'])
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Statut paiement</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(
                          selectedOrder.id,
                          e.target.value as Order['paymentStatus']
                        )
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      {paymentStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tracking */}
                <div>
                  <label className="text-sm font-medium">Numéro de suivi</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={selectedOrder.trackingNumber || ''}
                      onChange={(e) =>
                        handleTrackingUpdate(selectedOrder.id, e.target.value)
                      }
                      placeholder="Entrer le numéro de suivi"
                    />
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">Informations client</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                    <p>
                      <strong>Nom:</strong> {selectedOrder.customer.firstName}{' '}
                      {selectedOrder.customer.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer.email}
                    </p>
                    {selectedOrder.customer.phone && (
                      <p>
                        <strong>Téléphone:</strong> {selectedOrder.customer.phone}
                      </p>
                    )}
                    {selectedOrder.customer.address && (
                      <p>
                        <strong>Adresse:</strong> {selectedOrder.customer.address},{' '}
                        {selectedOrder.customer.postalCode} {selectedOrder.customer.city},{' '}
                        {selectedOrder.customer.country}
                      </p>
                    )}
                    <p>
                      <strong>Livraison:</strong>{' '}
                      {selectedOrder.deliveryMethod === 'delivery'
                        ? 'Livraison standard'
                        : 'Remise en main propre'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Articles commandés</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            Taille: {item.size} | Couleur: {item.color} | Qté: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>
                      {selectedOrder.shipping === 0
                        ? 'Gratuit'
                        : `${selectedOrder.shipping.toFixed(2)} €`}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}</span>
                      <span>-{selectedOrder.discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{selectedOrder.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
