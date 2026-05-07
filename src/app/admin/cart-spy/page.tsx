'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/stores/useStore';
import {
  Search,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  User,
  UserX,
  Filter,
  X,
  BarChart3,
  Star,
} from 'lucide-react';

interface CartSnapshotItem {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image?: string;
}

interface CartSnapshot {
  id: string;
  sessionId: string;
  userId: string | null;
  items: CartSnapshotItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface Analytics {
  totalCarts: number;
  totalActiveCarts: number;
  carts24h: number;
  avgCartValue: number;
  totalPotentialRevenue: number;
  mostPopularProduct: { id: string; name: string; count: number; image?: string } | null;
  popularProducts: { id: string; name: string; count: number; image?: string }[];
  mostAddedProducts: { id: string; name: string; count: number; cartCount: number; image?: string }[];
  avgCartAgeHours: number;
  loggedInCount: number;
  anonymousCount: number;
}

export default function CartSpyPage() {
  const { darkMode, language } = useStore();

  const [snapshots, setSnapshots] = useState<CartSnapshot[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [loggedInFilter, setLoggedInFilter] = useState<'all' | 'true' | 'false'>('all');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [expandedCart, setExpandedCart] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<'carts' | 'analytics'>('carts');
  const autoRefreshRef = useRef(autoRefresh);

  useEffect(() => {
    autoRefreshRef.current = autoRefresh;
  }, [autoRefresh]);

  // Translations
  const t = {
    title: language === 'fr' ? 'PANIERS EN TEMPS REEL' : 'REAL-TIME CARTS',
    totalCarts: language === 'fr' ? 'Total paniers' : 'Total carts',
    activeCarts: language === 'fr' ? 'Actifs (7j)' : 'Active (7d)',
    carts24h: language === 'fr' ? '24h' : '24h',
    avgValue: language === 'fr' ? 'Valeur moyenne' : 'Average value',
    potentialRevenue: language === 'fr' ? 'Revenu potentiel' : 'Potential revenue',
    mostPopular: language === 'fr' ? 'Produit populaire' : 'Popular product',
    searchPlaceholder: language === 'fr' ? 'Rechercher par produit ou email...' : 'Search by product or email...',
    allUsers: language === 'fr' ? 'TOUS' : 'ALL',
    loggedIn: language === 'fr' ? 'CONNECTES' : 'LOGGED IN',
    anonymous: language === 'fr' ? 'ANONYMES' : 'ANONYMOUS',
    session: language === 'fr' ? 'Session / Utilisateur' : 'Session / User',
    items: language === 'fr' ? 'Articles' : 'Items',
    total: language === 'fr' ? 'Total' : 'Total',
    lastUpdated: language === 'fr' ? 'Derniere MAJ' : 'Last Updated',
    status: language === 'fr' ? 'Statut' : 'Status',
    noCarts: language === 'fr' ? 'AUCUN PANIER TROUVE' : 'NO CARTS FOUND',
    noCartsDesc: language === 'fr' ? 'Les paniers apparaitront ici quand les clients ajouteront des produits.' : 'Carts will appear here when customers add products.',
    autoRefresh: language === 'fr' ? 'Auto-refresh' : 'Auto-refresh',
    refresh: language === 'fr' ? 'Rafraichir' : 'Refresh',
    filters: language === 'fr' ? 'FILTRES' : 'FILTERS',
    minTotal: language === 'fr' ? 'Total min' : 'Min total',
    maxTotal: language === 'fr' ? 'Total max' : 'Max total',
    from: language === 'fr' ? 'Du' : 'From',
    to: language === 'fr' ? 'Au' : 'To',
    clearFilters: language === 'fr' ? 'Effacer' : 'Clear',
    cartsTab: language === 'fr' ? 'PANIERS' : 'CARTS',
    analyticsTab: language === 'fr' ? 'ANALYTICS' : 'ANALYTICS',
    mostAdded: language === 'fr' ? 'PRODUITS LES PLUS AJOUTES' : 'MOST ADDED PRODUCTS',
    timesAdded: language === 'fr' ? 'fois ajoute' : 'times added',
    inCarts: language === 'fr' ? 'dans' : 'in',
    carts: language === 'fr' ? 'paniers' : 'carts',
    avgCartAge: language === 'fr' ? 'Age moyen des paniers' : 'Average cart age',
    hours: language === 'fr' ? 'heures' : 'hours',
    loggedVsAnon: language === 'fr' ? 'Connectes vs Anonymes' : 'Logged in vs Anonymous',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    error: language === 'fr' ? 'Erreur de chargement' : 'Loading error',
    product: language === 'fr' ? 'Produit' : 'Product',
    size: language === 'fr' ? 'Taille' : 'Size',
    color: language === 'fr' ? 'Couleur' : 'Color',
    qty: language === 'fr' ? 'Qte' : 'Qty',
    price: language === 'fr' ? 'Prix' : 'Price',
  };

  const fetchSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (loggedInFilter !== 'all') params.set('loggedIn', loggedInFilter);
      if (minTotal) params.set('minTotal', minTotal);
      if (maxTotal) params.set('maxTotal', maxTotal);
      if (dateFrom) params.set('dateFrom', new Date(dateFrom).toISOString());
      if (dateTo) params.set('dateTo', new Date(dateTo + 'T23:59:59').toISOString());

      const res = await fetch(`/api/admin/cart-spy?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.data.snapshots);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [search, loggedInFilter, minTotal, maxTotal, dateFrom, dateTo]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch('/api/admin/cart-spy?analytics=true');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch {
      // Analytics errors are non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSnapshots();
    fetchAnalytics();
  }, [fetchSnapshots, fetchAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (autoRefreshRef.current) {
        fetchSnapshots();
        fetchAnalytics();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSnapshots, fetchAnalytics]);

  const handleRefresh = () => {
    fetchSnapshots();
    fetchAnalytics();
  };

  const clearFilters = () => {
    setSearch('');
    setLoggedInFilter('all');
    setMinTotal('');
    setMaxTotal('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = search || loggedInFilter !== 'all' || minTotal || maxTotal || dateFrom || dateTo;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (language === 'fr') {
      if (minutes < 1) return 'A l\'instant';
      if (minutes < 60) return `Il y a ${minutes}min`;
      if (hours < 24) return `Il y a ${hours}h`;
      return `Il y a ${days}j`;
    }
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Carts */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <ShoppingCart size={20} className="text-purple-400" />
            </div>
            <div>
              <p
                className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {analyticsLoading ? '-' : (analytics?.totalCarts ?? 0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.totalCarts}
              </p>
              {!analyticsLoading && analytics && (
                <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  {analytics.totalActiveCarts} {t.activeCarts} · {analytics.carts24h} {t.carts24h}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Average Value */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <DollarSign size={20} className="text-blue-400" />
            </div>
            <div>
              <p
                className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {analyticsLoading ? '-' : `${(analytics?.avgCartValue ?? 0).toFixed(2)}\u20AC`}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.avgValue}
              </p>
            </div>
          </div>
        </div>

        {/* Potential Revenue */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <p
                className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {analyticsLoading ? '-' : `${(analytics?.totalPotentialRevenue ?? 0).toFixed(2)}\u20AC`}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.potentialRevenue}
              </p>
            </div>
          </div>
        </div>

        {/* Most Popular Product */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20">
              <Star size={20} className="text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                title={analytics?.mostPopularProduct?.name || ''}
              >
                {analyticsLoading ? '-' : (analytics?.mostPopularProduct?.name?.toUpperCase() || 'N/A')}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.mostPopular}
                {analytics?.mostPopularProduct ? ` (x${analytics.mostPopularProduct.count})` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('carts')}
            className={`px-5 py-2.5 text-sm transition-colors ${
              activeTab === 'carts'
                ? 'bg-primary text-white'
                : darkMode
                  ? 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={16} />
              {t.cartsTab}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary text-white'
                : darkMode
                  ? 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={16} />
              {t.analyticsTab}
            </span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              autoRefresh
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : darkMode
                  ? 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {autoRefresh ? <Eye size={16} /> : <EyeOff size={16} />}
            {t.autoRefresh}
            {autoRefresh && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          </button>

          {/* Manual refresh */}
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Carts Tab */}
      {activeTab === 'carts' && (
        <>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
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

            {/* Status filter */}
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              {(['all', 'true', 'false'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setLoggedInFilter(val)}
                  className={`px-4 py-3 text-xs transition-colors ${
                    loggedInFilter === val
                      ? 'bg-primary text-white'
                      : darkMode
                        ? 'bg-white/5 text-white/50 hover:text-white'
                        : 'bg-gray-50 text-gray-500 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}
                >
                  {val === 'all' ? t.allUsers : val === 'true' ? t.loggedIn : t.anonymous}
                </button>
              ))}
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-colors ${
                hasActiveFilters
                  ? 'bg-primary/20 border-primary/30 text-primary'
                  : darkMode
                    ? 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              <Filter size={16} />
              {t.filters}
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.minTotal}
                  </label>
                  <input
                    type="number"
                    value={minTotal}
                    onChange={(e) => setMinTotal(e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.maxTotal}
                  </label>
                  <input
                    type="number"
                    value={maxTotal}
                    onChange={(e) => setMaxTotal(e.target.value)}
                    placeholder="999"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.from}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.to}
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <X size={12} />
                    {t.clearFilters}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart List Table */}
          <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            {loading && snapshots.length === 0 ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className={`mx-auto mb-4 animate-spin ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
                <p
                  className={darkMode ? 'text-white/40' : 'text-gray-400'}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.loading}
                </p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-400" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.error}
                </p>
                <p className="text-sm text-red-400/60 mt-1">{error}</p>
              </div>
            ) : snapshots.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
                <p
                  className={darkMode ? 'text-white/40' : 'text-gray-400'}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.noCarts}
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-white/25' : 'text-gray-300'}`}>
                  {t.noCartsDesc}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <th
                        className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.session}
                      </th>
                      <th
                        className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.items}
                      </th>
                      <th
                        className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.total}
                      </th>
                      <th
                        className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.lastUpdated}
                      </th>
                      <th
                        className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {t.status}
                      </th>
                      <th className="p-4 w-10" />
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                    {snapshots.map((snap) => {
                      const isExpanded = expandedCart === snap.id;
                      const items = Array.isArray(snap.items) ? snap.items : [];
                      const isRecent = Date.now() - new Date(snap.updatedAt).getTime() < 300000; // 5 min

                      return (
                        <tr key={snap.id} className="group">
                          <td colSpan={6} className="p-0">
                            {/* Main row */}
                            <div
                              className={`flex items-center cursor-pointer transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                              onClick={() => setExpandedCart(isExpanded ? null : snap.id)}
                            >
                              <div className="flex-1 flex items-center">
                                <div className="p-4 flex-1 min-w-0">
                                  {snap.user ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <User size={14} className="text-primary" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {snap.user.firstName} {snap.user.lastName}
                                        </p>
                                        <p className={`text-xs truncate ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                                          {snap.user.email}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        <UserX size={14} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                          {language === 'fr' ? 'Anonyme' : 'Anonymous'}
                                        </p>
                                        <p className={`text-xs truncate ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                                          {snap.sessionId.substring(0, 16)}...
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4 w-24">
                                  <p
                                    className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                  >
                                    {snap.itemCount}
                                  </p>
                                </div>
                                <div className="p-4 w-32">
                                  <p
                                    className={darkMode ? 'text-white' : 'text-gray-900'}
                                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                  >
                                    {Number(snap.total).toFixed(2)}&euro;
                                  </p>
                                </div>
                                <div className="p-4 w-36">
                                  <p className={`text-sm ${isRecent ? 'text-green-400' : darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    {formatTimeAgo(snap.updatedAt)}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                                    {new Date(snap.updatedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                  </p>
                                </div>
                                <div className="p-4 w-32">
                                  {snap.user ? (
                                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                                      <User size={10} />
                                      {language === 'fr' ? 'Connecte' : 'Logged in'}
                                    </span>
                                  ) : (
                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${darkMode ? 'bg-white/10 text-white/50 border-white/20' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                      <UserX size={10} />
                                      {language === 'fr' ? 'Anonyme' : 'Anonymous'}
                                    </span>
                                  )}
                                </div>
                                <div className="p-4 w-10">
                                  {isExpanded ? (
                                    <ChevronUp size={16} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                                  ) : (
                                    <ChevronDown size={16} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className={`px-4 pb-4 border-t ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                                <div className="pt-4 space-y-2">
                                  {items.map((item, idx) => (
                                    <div
                                      key={`${item.id}-${item.size}-${idx}`}
                                      className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                                    >
                                      {/* Image */}
                                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package size={20} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                                          </div>
                                        )}
                                      </div>

                                      {/* Info */}
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                                        >
                                          {item.name?.toUpperCase()}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                          {item.size && (
                                            <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}>
                                              {t.size}: {item.size}
                                            </span>
                                          )}
                                          {item.color && (
                                            <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}>
                                              {t.color}: {item.color}
                                            </span>
                                          )}
                                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                                            {t.qty}: {item.quantity}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Price */}
                                      <p
                                        className="text-primary text-lg flex-shrink-0"
                                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                      >
                                        {(Number(item.price) * item.quantity).toFixed(2)}&euro;
                                      </p>
                                    </div>
                                  ))}

                                  {/* Cart total in expanded view */}
                                  <div className={`flex justify-between items-center pt-3 mt-2 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                    <span
                                      className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                                    >
                                      TOTAL
                                    </span>
                                    <span
                                      className="text-primary text-xl"
                                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                    >
                                      {Number(snap.total).toFixed(2)}&euro;
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="p-12 text-center">
              <RefreshCw size={32} className={`mx-auto mb-4 animate-spin ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
              <p
                className={darkMode ? 'text-white/40' : 'text-gray-400'}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.loading}
              </p>
            </div>
          ) : analytics ? (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Average Cart Age */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20">
                      <Clock size={20} className="text-indigo-400" />
                    </div>
                    <p
                      className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.avgCartAge}
                    </p>
                  </div>
                  <p
                    className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {analytics.avgCartAgeHours} {t.hours}
                  </p>
                </div>

                {/* Logged vs Anonymous */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20">
                      <Users size={20} className="text-cyan-400" />
                    </div>
                    <p
                      className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.loggedVsAnon}
                    </p>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p
                        className="text-3xl text-green-400"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {analytics.loggedInCount}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{t.loggedIn}</p>
                    </div>
                    <p className={`text-xl mb-1 ${darkMode ? 'text-white/30' : 'text-gray-300'}`}>/</p>
                    <div>
                      <p
                        className={`text-3xl ${darkMode ? 'text-white/50' : 'text-gray-400'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {analytics.anonymousCount}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{t.anonymous}</p>
                    </div>
                  </div>
                  {/* Bar representation */}
                  {(analytics.loggedInCount + analytics.anonymousCount) > 0 && (
                    <div className={`mt-3 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-green-400 rounded-full transition-all"
                        style={{
                          width: `${(analytics.loggedInCount / (analytics.loggedInCount + analytics.anonymousCount)) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Carts summary */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20">
                      <ShoppingCart size={20} className="text-purple-400" />
                    </div>
                    <p
                      className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.totalCarts}
                    </p>
                  </div>
                  <p
                    className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {analytics.totalCarts}
                  </p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    {t.potentialRevenue}: <span className="text-primary">{analytics.totalPotentialRevenue.toFixed(2)}&euro;</span>
                  </p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {analytics.totalActiveCarts} {t.activeCarts} · {analytics.carts24h} {t.carts24h}
                  </p>
                </div>
              </div>

              {/* Most Added Products */}
              <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3
                    className={darkMode ? 'text-white' : 'text-gray-900'}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '1.1rem' }}
                  >
                    {t.mostAdded}
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {analytics.mostAddedProducts.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className={darkMode ? 'text-white/30' : 'text-gray-400'}>
                        {t.noCarts}
                      </p>
                    </div>
                  ) : (
                    analytics.mostAddedProducts.map((product, idx) => {
                      const maxCount = analytics.mostAddedProducts[0]?.count || 1;
                      const barWidth = (product.count / maxCount) * 100;

                      return (
                        <div
                          key={product.id}
                          className={`flex items-center gap-4 px-6 py-4 relative overflow-hidden transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                          {/* Background bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                            style={{ width: `${barWidth}%` }}
                          />

                          {/* Rank */}
                          <div className="relative z-10 w-8 flex-shrink-0">
                            <span
                              className={`text-lg ${idx < 3 ? 'text-primary' : darkMode ? 'text-white/30' : 'text-gray-400'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Image */}
                          <div className="relative z-10 w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="relative z-10 flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {product.name.toUpperCase()}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                              {product.count} {t.timesAdded} - {t.inCarts} {product.cartCount} {t.carts}
                            </p>
                          </div>

                          {/* Count badge */}
                          <div className="relative z-10 flex-shrink-0">
                            <span
                              className="text-primary text-xl"
                              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                            >
                              x{product.count}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Popular Products in Active Carts */}
              {analytics.popularProducts.length > 0 && (
                <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3
                      className={darkMode ? 'text-white' : 'text-gray-900'}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '1.1rem' }}
                    >
                      {language === 'fr' ? 'PRODUITS DANS LES PANIERS ACTIFS (24H)' : 'PRODUCTS IN ACTIVE CARTS (24H)'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4">
                    {analytics.popularProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden mb-2 bg-black/20">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          title={product.name}
                        >
                          {product.name.toUpperCase()}
                        </p>
                        <p className="text-primary text-sm mt-1" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                          x{product.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
