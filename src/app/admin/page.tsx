'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
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
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { getDashboardStats, orders, products, fetchProducts, fetchOrders, fetchPromoCodes } = useAdminStore();
  const { darkMode, language } = useStore();
  const [onlineVisitors, setOnlineVisitors] = useState(0);

  const fetchOnlineVisitors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/online-visitors');
      if (res.ok) {
        const data = await res.json();
        setOnlineVisitors(data.count);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchPromoCodes();
    fetchOnlineVisitors();

    // Refresh online visitors every 10 seconds
    const interval = setInterval(fetchOnlineVisitors, 10_000);
    return () => clearInterval(interval);
  }, [fetchProducts, fetchOrders, fetchPromoCodes, fetchOnlineVisitors]);

  const stats = getDashboardStats();

  // Translations
  const t = {
    welcome: language === 'fr' ? 'Bienvenue sur votre Tableau de Bord' : 'Welcome to your Dashboard',
    overview: language === 'fr' ? 'Voici un aperçu de votre activité' : "Here's an overview of your activity",
    today: language === 'fr' ? "Aujourd'hui" : 'Today',
    onlineNow: language === 'fr' ? 'En ligne' : 'Online Now',
    live: language === 'fr' ? 'En direct' : 'Live',
    revenue: language === 'fr' ? 'Revenus' : 'Revenue',
    totalOrders: language === 'fr' ? 'Commandes' : 'Total Orders',
    pending: language === 'fr' ? 'En attente' : 'Pending',
    products: language === 'fr' ? 'Produits' : 'Products',
    lowStock: language === 'fr' ? 'Stock bas' : 'Low Stock',
    activePromos: language === 'fr' ? 'Promos actives' : 'Active Promos',
    warning: language === 'fr' ? 'Attention' : 'Warning',
    ok: 'OK',
    active: language === 'fr' ? 'Actif' : 'Active',
    recentOrders: language === 'fr' ? 'Commandes récentes' : 'Recent Orders',
    viewAll: language === 'fr' ? 'VOIR TOUT' : 'VIEW ALL',
    noOrders: language === 'fr' ? 'Aucune commande' : 'No orders',
    lowStockAlerts: language === 'fr' ? 'Alertes stock bas' : 'Low Stock Alerts',
    manage: language === 'fr' ? 'GÉRER' : 'MANAGE',
    units: language === 'fr' ? 'unités' : 'units',
    remaining: language === 'fr' ? 'restantes' : 'remaining',
    allStockGood: language === 'fr' ? 'Tous les stocks sont OK' : 'All stock levels are good',
    addProduct: language === 'fr' ? 'Ajouter un produit' : 'Add a product',
    createNewProduct: language === 'fr' ? 'Créer un nouveau produit' : 'Create a new product',
    manageOrders: language === 'fr' ? 'Gérer les commandes' : 'Manage orders',
    viewAllOrders: language === 'fr' ? 'Voir toutes les commandes' : 'View all orders',
    createPromo: language === 'fr' ? 'Créer une promo' : 'Create a promo',
    newPromoCode: language === 'fr' ? 'Nouveau code promo' : 'New promo code',
    viewAnalytics: language === 'fr' ? 'Voir les stats' : 'View analytics',
    detailedStats: language === 'fr' ? 'Statistiques détaillées' : 'Detailed statistics',
    // Status labels
    statusPending: language === 'fr' ? 'En attente' : 'Pending',
    statusConfirmed: language === 'fr' ? 'Confirmé' : 'Confirmed',
    statusPreparing: language === 'fr' ? 'Préparation' : 'Preparing',
    statusShipped: language === 'fr' ? 'Expédié' : 'Shipped',
    statusDelivered: language === 'fr' ? 'Livré' : 'Delivered',
    statusCancelled: language === 'fr' ? 'Annulé' : 'Cancelled',
    statusRefunded: language === 'fr' ? 'Remboursé' : 'Refunded',
  };

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => p.totalStock < 10);

  const statCards = [
    {
      title: t.onlineNow,
      value: onlineVisitors.toString(),
      change: t.live,
      trend: 'up' as const,
      icon: Users,
      color: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      isLive: true,
    },
    {
      title: t.revenue,
      value: `${Number(stats.totalRevenue).toFixed(0)}€`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      title: t.totalOrders,
      value: stats.totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      title: t.pending,
      value: stats.pendingOrders.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
    },
    {
      title: t.products,
      value: stats.totalProducts.toString(),
      change: '+2',
      trend: 'up',
      icon: Package,
      color: 'from-purple-500/20 to-violet-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      title: t.lowStock,
      value: stats.lowStockProducts.toString(),
      change: stats.lowStockProducts > 0 ? t.warning : t.ok,
      trend: stats.lowStockProducts > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: 'from-red-500/20 to-rose-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20',
    },
    {
      title: t.activePromos,
      value: stats.activePromoCodes.toString(),
      change: t.active,
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
      pending: t.statusPending,
      confirmed: t.statusConfirmed,
      preparing: t.statusPreparing,
      shipped: t.statusShipped,
      delivered: t.statusDelivered,
      cancelled: t.statusCancelled,
      refunded: t.statusRefunded,
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
            {t.welcome}
          </h2>
          <p className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.overview}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.today}</p>
          <p style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/50'} ${stat.iconColor}`}>
                <stat.icon size={20} />
              </div>
              {'isLive' in stat && stat.isLive ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  {stat.change}
                </div>
              ) : (
                <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              )}
            </div>
            <p
              className={`text-3xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {stat.value}
            </p>
            <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-600'}`}>{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h3
              className="text-lg"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.recentOrders}
            </h3>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {t.viewAll}
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className={`flex items-center justify-between p-4 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ShoppingCart size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {order.orderNumber}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {Number(order.total).toFixed(0)}€
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <Link href="/admin/orders">
                    <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Eye size={14} className={darkMode ? 'text-white/50' : 'text-gray-500'} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingCart size={40} className={`mx-auto mb-3 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
                <p className={darkMode ? 'text-white/40' : 'text-gray-400'}>{t.noOrders}</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h3
              className="flex items-center gap-2 text-lg"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              <AlertTriangle size={18} className="text-red-400" />
              {t.lowStockAlerts}
            </h3>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {t.manage}
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-4 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Package size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {product.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-red-400"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {product.totalStock} {t.units}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.remaining}</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-400/50" />
                <p className="text-green-400">{t.allStockGood}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/products">
          <div className={`p-5 rounded-2xl border hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <Package size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {t.addProduct}
            </p>
            <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.createNewProduct}</p>
          </div>
        </Link>
        <Link href="/admin/orders">
          <div className={`p-5 rounded-2xl border hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <ShoppingCart size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {t.manageOrders}
            </p>
            <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.viewAllOrders}</p>
          </div>
        </Link>
        <Link href="/admin/promos">
          <div className={`p-5 rounded-2xl border hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <Tags size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {t.createPromo}
            </p>
            <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.newPromoCode}</p>
          </div>
        </Link>
        <Link href="/admin/settings">
          <div className={`p-5 rounded-2xl border hover:border-primary/50 hover:bg-primary/10 transition-all group cursor-pointer ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <TrendingUp size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              {t.viewAnalytics}
            </p>
            <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.detailedStats}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
