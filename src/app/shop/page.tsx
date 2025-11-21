'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { products } from '@/lib/products';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'all', labelKey: 'tous' },
  { id: 'vestes', labelKey: 'vestes' },
  { id: 'tshirts', labelKey: 'tshirts' },
  { id: 'pantalons', labelKey: 'pantalons' },
  { id: 'accessoires', labelKey: 'accessoires' },
];

export default function ShopPage() {
  const { language } = useStore();
  const t = translations[language];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBanner />
      <Header showLogo />
      <Sidebar />
      <CartDrawer />
      <SearchOverlay />

      <main className="px-4 py-8 max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'fr' ? 'Bienvenue dans l\'univers Temporal' : 'Welcome to the Temporal universe'}
          </h1>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'secondary'}
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full"
            >
              {cat.id === 'all' ? (cat.labelKey === 'tous' ? 'Tous' : 'All') : (t as Record<string, string>)[cat.labelKey] || cat.labelKey}
            </Button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {language === 'fr' ? 'Aucun produit dans cette catégorie' : 'No products in this category'}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
