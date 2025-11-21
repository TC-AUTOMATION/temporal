'use client';

import { useAdminStore } from '@/stores/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Tags,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { getDashboardStats, orders, products } = useAdminStore();
  const stats = getDashboardStats();

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => p.totalStock < 10);

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Commandes totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Commandes en attente',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Stock faible',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: 'Promos actives',
      value: stats.activePromoCodes,
      icon: Tags,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'Préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total.toFixed(2)} €</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune commande</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertes stock faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{product.totalStock} unités</p>
                    <p className="text-xs text-gray-500">restantes</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-green-600 text-center py-4">
                  Tous les stocks sont corrects
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
