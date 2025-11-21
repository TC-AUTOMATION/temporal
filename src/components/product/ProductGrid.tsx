'use client';

import { products } from '@/lib/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  category?: string;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 py-8">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
