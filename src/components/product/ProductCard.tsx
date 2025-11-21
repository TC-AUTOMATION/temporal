'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product, useStore } from '@/stores/useStore';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart, setCartOpen, darkMode } = useStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const availableSize = product.sizes.find((s) => s.available);
    if (availableSize) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        size: availableSize.name,
        color: product.colors[0]?.name || '',
        quantity: 1,
        image: product.images[0],
      });
      setCartOpen(true);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Image container */}
        <div className={`aspect-[3/4] relative overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
          {/* Product image */}
          <div className={`absolute inset-0 transition-transform duration-500 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-8xl font-black text-foreground/5"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  TPL
                </span>
              </div>
            )}
          </div>

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Like button */}
          <button
            onClick={handleLike}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center transition-all duration-300 ${
              isLiked
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
          </button>

          {/* Quick add button - appears on hover */}
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-3 left-3 right-3 py-3 bg-white text-black flex items-center justify-center gap-2 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
          >
            <ShoppingBag size={16} />
            AJOUTER AU PANIER
          </button>

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-3 py-1 bg-primary text-primary-foreground text-xs"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              NEW
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="pt-4 space-y-2">
          {/* Category */}
          <p
            className="text-xs text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {product.category}
          </p>

          {/* Name and price row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-foreground text-base uppercase leading-tight group-hover:text-primary transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {product.name}
            </h3>
            <span
              className="text-foreground text-lg flex-shrink-0"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {product.price}€
            </span>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.slice(0, 4).map((color, i) => (
              <div
                key={color.name}
                className={`w-4 h-4 rounded-full border transition-all ${
                  darkMode ? 'border-white/20' : 'border-black/10'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
