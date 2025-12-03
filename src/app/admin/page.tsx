'use client';

import { useAdminStore } from '@/stores/useAdminStore';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Tags,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

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
      value: `${stats.totalRevenue.toFixed(0)}€`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Commandes totales',
      value: stats.totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'En attente',
      value: stats.pendingOrders.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Produits',
      value: stats.totalProducts.toString(),
      change: '+2',
      trend: 'up',
      icon: Package,
      color: 'from-purple-500/20 to-violet-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Stock faible',
      value: stats.lowStockProducts.toString(),
      change: stats.lowStockProducts > 0 ? 'Attention' : 'OK',
      trend: stats.lowStockProducts > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: 'from-red-500/20 to-rose-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Promos actives',
      value: stats.activePromoCodes.toString(),
      change: 'Actifs',
      trend: 'up',
      icon: Tags,
      color: 'from-teal-500/20 to-cyan-500/20',
      iconColor: 'text-teal-400',
      borderColor: 'border-teal-500/20',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={12} />,
      confirmed: <CheckCircle size={12} />,
      preparing: <Package size={12} />,
      shipped: <Truck size={12} />,
      delivered: <CheckCircle size={12} />,
    };
    return icons[status] || <Clock size={12} />;
  };

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl mb-1"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            Bienvenue sur votre Dashboard
          </h2>
          <p className="text-white/50">Voici un aperçu de votre activité</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-sm">Aujourd'hui</p>
          <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-white/5 ${stat.iconColor}`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p
              className="text-3xl text-white mb-1"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-white/50">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3
              className="text-lg"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              Commandes récentes
            </h3>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              VOIR TOUT
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ShoppingCart size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-white/50">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {order.total.toFixed(0)}€
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <Link href="/admin/orders">
                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Eye size={14} className="text-white/50" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingCart size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40">Aucune commande</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3
              className="flex items-center gap-2 text-lg"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              <AlertTriangle size={18} className="text-red-400" />
              Alertes stock faible
            </h3>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              GÉRER
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Package size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {product.name}
                    </p>
                    <p className="text-xs text-white/50">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-red-400"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {product.totalStock} unités
                  </p>
                  <p className="text-xs text-white/50">restantes</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-400/50" />
                <p className="text-green-400">Tous les stocks sont corrects</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/products">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer">
            <Package size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              Ajouter un produit
            </p>
            <p className="text-xs text-white/50">Créer un nouveau produit</p>
          </div>
        </Link>
        <Link href="/admin/orders">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer">
            <ShoppingCart size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              Gérer commandes
            </p>
            <p className="text-xs text-white/50">Voir toutes les commandes</p>
          </div>
        </Link>
        <Link href="/admin/promos">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer">
            <Tags size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              Créer une promo
            </p>
            <p className="text-xs text-white/50">Nouveau code promo</p>
          </div>
        </Link>
        <Link href="/admin/settings">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer">
            <TrendingUp size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              Voir analytics
            </p>
            <p className="text-xs text-white/50">Statistiques détaillées</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
