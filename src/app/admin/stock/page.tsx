'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/stores/useStore';
import {
  Package,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  TrendingDown,
  ShoppingBag,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ColorStock {
  color: string;
  colorHex: string | null;
  stock: number;
  sold: number;
}

interface SizeStock {
  size: string;
  currentStock: number;
  sold: number;
  colors: ColorStock[];
}

interface ProductStock {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  category: { name: string; slug: string } | null;
  totalStock: number;
  totalSold: number;
  sizes: SizeStock[];
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

function sortSizes(sizes: SizeStock[]): SizeStock[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.size);
    const bi = SIZE_ORDER.indexOf(b.size);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.size.localeCompare(b.size);
  });
}

export default function StockPage() {
  const { darkMode, language } = useStore();
  const [stockData, setStockData] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const t = {
    title: language === 'fr' ? 'STOCK PAR TAILLE' : 'STOCK BY SIZE',
    search: language === 'fr' ? 'Rechercher un produit...' : 'Search product...',
    all: language === 'fr' ? 'TOUS' : 'ALL',
    lowStock: language === 'fr' ? 'STOCK BAS' : 'LOW STOCK',
    outOfStock: language === 'fr' ? 'RUPTURE' : 'OUT OF STOCK',
    product: language === 'fr' ? 'Produit' : 'Product',
    size: language === 'fr' ? 'Taille' : 'Size',
    stock: language === 'fr' ? 'Stock' : 'Stock',
    sold: language === 'fr' ? 'Vendu' : 'Sold',
    remaining: language === 'fr' ? 'Restant' : 'Remaining',
    color: language === 'fr' ? 'Couleur' : 'Color',
    totalStock: language === 'fr' ? 'STOCK TOTAL' : 'TOTAL STOCK',
    totalSold: language === 'fr' ? 'TOTAL VENDU' : 'TOTAL SOLD',
    lowStockItems: language === 'fr' ? 'STOCK BAS' : 'LOW STOCK',
    outOfStockItems: language === 'fr' ? 'EN RUPTURE' : 'OUT OF STOCK',
    noProducts: language === 'fr' ? 'AUCUN PRODUIT TROUVE' : 'NO PRODUCTS FOUND',
    refresh: language === 'fr' ? 'ACTUALISER' : 'REFRESH',
    pieces: language === 'fr' ? 'pcs' : 'pcs',
    byCategory: language === 'fr' ? 'STOCK PAR CATEGORIE' : 'STOCK BY CATEGORY',
    products: language === 'fr' ? 'PRODUITS' : 'PRODUCTS',
    items: language === 'fr' ? 'pieces' : 'items',
    uncategorized: language === 'fr' ? 'NON CLASSE' : 'UNCATEGORIZED',
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStockData(data.data.stock);
        }
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const toggleProduct = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Stats
  const totalStockAll = stockData.reduce((sum, p) => sum + p.totalStock, 0);
  const totalSoldAll = stockData.reduce((sum, p) => sum + p.totalSold, 0);
  const lowStockCount = stockData.filter(p => p.sizes.some(s => s.currentStock > 0 && s.currentStock <= 3)).length;
  const outOfStockCount = stockData.filter(p => p.sizes.some(s => s.currentStock === 0)).length;

  // Group stock by category for the overview
  const categoryBreakdown = (() => {
    const map = new Map<string, { slug: string; name: string; totalStock: number; totalSold: number; productCount: number; lowStock: number; outOfStock: number }>();
    for (const p of stockData) {
      const slug = p.category?.slug || 'uncategorized';
      const name = p.category?.name || t.uncategorized;
      if (!map.has(slug)) {
        map.set(slug, { slug, name, totalStock: 0, totalSold: 0, productCount: 0, lowStock: 0, outOfStock: 0 });
      }
      const entry = map.get(slug)!;
      entry.totalStock += p.totalStock;
      entry.totalSold += p.totalSold;
      entry.productCount += 1;
      if (p.sizes.some(s => s.currentStock === 0)) entry.outOfStock += 1;
      else if (p.sizes.some(s => s.currentStock > 0 && s.currentStock <= 3)) entry.lowStock += 1;
    }
    return Array.from(map.values()).sort((a, b) => {
      // Always show "Bonnets" category first (it replaces the removed "TOUS" tile).
      const aIsBonnets = a.slug === 'bonnets' || a.name.toLowerCase().includes('bonnet');
      const bIsBonnets = b.slug === 'bonnets' || b.name.toLowerCase().includes('bonnet');
      if (aIsBonnets && !bIsBonnets) return -1;
      if (!aIsBonnets && bIsBonnets) return 1;
      return b.totalStock - a.totalStock;
    });
  })();

  // Filter and search
  const filteredProducts = stockData
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (categoryFilter !== 'all') {
        const slug = p.category?.slug || 'uncategorized';
        if (slug !== categoryFilter) return false;
      }
      if (filter === 'low') return p.sizes.some(s => s.currentStock > 0 && s.currentStock <= 3);
      if (filter === 'out') return p.sizes.some(s => s.currentStock === 0);
      return true;
    });

  // Group filtered products by category for readable display
  const productsByCategory = (() => {
    const map = new Map<string, { slug: string; name: string; products: ProductStock[] }>();
    for (const p of filteredProducts) {
      const slug = p.category?.slug || 'uncategorized';
      const name = p.category?.name || t.uncategorized;
      if (!map.has(slug)) map.set(slug, { slug, name, products: [] });
      map.get(slug)!.products.push(p);
    }
    return Array.from(map.values()).sort((a, b) => b.products.length - a.products.length);
  })();

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (stock <= 3) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    if (stock <= 10) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  const getStockBg = (stock: number) => {
    if (stock === 0) return 'bg-red-500';
    if (stock <= 3) return 'bg-orange-500';
    if (stock <= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border ${darkMode ? 'border-blue-500/20' : 'border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <Package size={20} className="text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {totalStockAll}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.totalStock}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border ${darkMode ? 'border-green-500/20' : 'border-green-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <ShoppingBag size={20} className="text-green-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {totalSoldAll}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.totalSold}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border ${darkMode ? 'border-orange-500/20' : 'border-orange-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20">
              <TrendingDown size={20} className="text-orange-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {lowStockCount}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.lowStockItems}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border ${darkMode ? 'border-red-500/20' : 'border-red-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {outOfStockCount}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary" />
            <h3
              className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.byCategory}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryBreakdown.map((c) => {
              const isActive = categoryFilter === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCategoryFilter(isActive ? 'all' : c.slug)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : darkMode
                        ? 'border-white/10 bg-white/[0.02] hover:border-white/30'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <p
                    className={`text-[10px] mb-1 truncate ${isActive ? 'text-primary' : darkMode ? 'text-white/50' : 'text-gray-500'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {c.name.toUpperCase()}
                  </p>
                  <p
                    className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {c.totalStock}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {c.productCount} {t.products.toLowerCase()}
                    </p>
                    {c.outOfStock > 0 && (
                      <span className="text-[10px] text-red-400">
                        {c.outOfStock} {t.outOfStock.toLowerCase()}
                      </span>
                    )}
                    {c.outOfStock === 0 && c.lowStock > 0 && (
                      <span className="text-[10px] text-orange-400">
                        {c.lowStock} {t.lowStock.toLowerCase()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-xl border transition-colors ${
                  filter === f
                    ? 'bg-primary text-white border-primary'
                    : darkMode
                      ? 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
              >
                {f === 'all' ? t.all : f === 'low' ? t.lowStock : t.outOfStock}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={fetchStock}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white/60 hover:border-white/30' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} />
          {t.refresh}
        </button>
      </div>

      {/* Products Stock List - grouped by category */}
      <div className="space-y-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noProducts}
            </p>
          </div>
        ) : (
          productsByCategory.map((group) => {
            const groupTotalStock = group.products.reduce((sum, p) => sum + p.totalStock, 0);
            const groupTotalSold = group.products.reduce((sum, p) => sum + p.totalSold, 0);
            return (
              <div key={group.slug} className="space-y-3">
                {/* Category section header */}
                <div className={`flex items-center justify-between px-1 pb-2 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <h3
                      className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {group.name.toUpperCase()}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}`}>
                      {group.products.length}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    <span>
                      <span className={`text-sm mr-1 ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {groupTotalStock}
                      </span>
                      {t.pieces}
                    </span>
                    <span>
                      <span className={`text-sm mr-1 ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {groupTotalSold}
                      </span>
                      {t.sold.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.products.map((product) => {
            const isExpanded = expandedProducts.has(product.id);
            const sortedSizes = sortSizes(product.sizes);
            const hasLowStock = product.sizes.some(s => s.currentStock > 0 && s.currentStock <= 3);
            const hasOutOfStock = product.sizes.some(s => s.currentStock === 0);

            return (
              <div
                key={product.id}
                className={`rounded-2xl overflow-hidden border transition-colors ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                {/* Product Header */}
                <button
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                    darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </p>
                      {hasOutOfStock && (
                        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          {t.outOfStock}
                        </span>
                      )}
                      {hasLowStock && !hasOutOfStock && (
                        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {t.lowStock}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {product.sku}
                    </p>
                  </div>

                  {/* Quick Size Badges */}
                  <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                    {sortedSizes.map((size) => (
                      <div
                        key={size.size}
                        className={`flex flex-col items-center px-2.5 py-1 rounded-lg border ${getStockColor(size.currentStock)}`}
                      >
                        <span className="text-[10px] font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                          {size.size}
                        </span>
                        <span className="text-[10px]">{size.currentStock}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {product.totalStock}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {product.totalSold} {t.sold.toLowerCase()}
                    </p>
                  </div>

                  {/* Expand icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown size={18} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                    ) : (
                      <ChevronRight size={18} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className={`border-t ${darkMode ? 'border-white/10' : 'border-gray-100'} p-4`}>
                    <div className="grid gap-3">
                      {sortedSizes.map((size) => {
                        const maxStock = Math.max(...product.sizes.map(s => s.currentStock + s.sold), 1);
                        const totalForSize = size.currentStock + size.sold;
                        const stockPercent = (size.currentStock / Math.max(totalForSize, 1)) * 100;

                        return (
                          <div key={size.size} className={`rounded-xl p-3 ${darkMode ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                              {/* Size label */}
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border ${getStockColor(size.currentStock)}`}
                                style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem' }}
                              >
                                {size.size}
                              </div>

                              {/* Bar + Info */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {size.currentStock} {t.pieces} {t.remaining.toLowerCase()}
                                    </span>
                                    <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                                      ({size.sold} {t.sold.toLowerCase()})
                                    </span>
                                  </div>
                                  {size.currentStock === 0 && (
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                      <AlertTriangle size={12} />
                                      {t.outOfStock}
                                    </span>
                                  )}
                                </div>

                                {/* Stock bar */}
                                <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                  <div className="h-full flex">
                                    <div
                                      className={`${getStockBg(size.currentStock)} transition-all duration-500`}
                                      style={{ width: `${(size.currentStock / maxStock) * 100}%` }}
                                    />
                                    <div
                                      className="bg-white/20"
                                      style={{ width: `${(size.sold / maxStock) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Color breakdown */}
                                {size.colors.length > 1 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {size.colors.map((c) => (
                                      <div
                                        key={c.color}
                                        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
                                          darkMode ? 'bg-white/5' : 'bg-white'
                                        }`}
                                      >
                                        {c.colorHex && (
                                          <div
                                            className="w-3 h-3 rounded-full border border-white/20"
                                            style={{ backgroundColor: c.colorHex }}
                                          />
                                        )}
                                        <span className={darkMode ? 'text-white/60' : 'text-gray-600'}>
                                          {c.color}:
                                        </span>
                                        <span className={`font-medium ${c.stock === 0 ? 'text-red-400' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {c.stock}
                                        </span>
                                        {c.sold > 0 && (
                                          <span className={darkMode ? 'text-white/30' : 'text-gray-400'}>
                                            ({c.sold} {t.sold.toLowerCase()})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
