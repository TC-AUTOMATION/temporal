'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/stores/useStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isHovered && product.modelImages.length > 0
    ? product.modelImages[0]
    : product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden mb-3">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {product.name}
          </div>
        )}
      </div>
      <h3 className="font-medium">{product.name}</h3>
      <p className="text-[#5B2D8E] font-medium">{product.price}€</p>
    </Link>
  );
}
