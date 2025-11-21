'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Product, useStore } from '@/stores/useStore';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { addToCart, setCartOpen } = useStore();

  const allImages = [...product.images, ...product.modelImages];

  const handleImageCycle = () => {
    if (allImages.length > 1) {
      setImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

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

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block relative animate-slide-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-streetwear rounded-lg overflow-hidden">
        {/* Image container */}
        <div
          className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-900 to-black"
          onClick={handleImageCycle}
        >
          {/* Placeholder or actual image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {allImages[imageIndex] ? (
              <Image
                src={allImages[imageIndex]}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-700 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
              />
            ) : (
              <div className="text-center p-4">
                <div className="text-6xl font-black text-white/5 mb-2 tracking-tighter">TPL</div>
                <div className="text-white/40 text-sm font-medium">{product.name}</div>
              </div>
            )}
          </div>

          {/* Overlay gradient on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-80' : 'opacity-40'
            }`}
          />

          {/* Quick actions */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="flex gap-2">
              <button
                onClick={handleQuickAdd}
                className="flex-1 py-3 bg-[#5B2D8E] text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#7B4DB0] transition-colors rounded"
              >
                <ShoppingBag size={16} />
                Add
              </button>
              <button
                onClick={(e) => e.preventDefault()}
                className="p-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors rounded"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>

          {/* Image indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === imageIndex ? 'bg-[#5B2D8E] w-6' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
            <div className="absolute top-3 right-3 w-8 h-px bg-gradient-to-l from-[#5B2D8E] to-transparent" />
            <div className="absolute top-3 right-3 w-px h-8 bg-gradient-to-b from-[#5B2D8E] to-transparent" />
          </div>

          {/* View indicator */}
          <div
            className={`absolute top-4 left-4 flex items-center gap-2 text-white/60 text-xs transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <Eye size={14} />
            <span>{Math.floor(Math.random() * 50) + 10}</span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-4 bg-[#0a0a0a]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white group-hover:text-[#5B2D8E] transition-colors uppercase tracking-wide text-sm">
              {product.name}
            </h3>
            <span className="text-[#5B2D8E] font-black text-lg">{product.price}€</span>
          </div>

          {/* Color options */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {product.colors.slice(0, 3).map((color) => (
                <div
                  key={color.name}
                  className="w-4 h-4 rounded-full border-2 border-white/10 hover:border-[#5B2D8E] transition-colors"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            <span className="text-white/30 text-xs uppercase tracking-wider">
              {product.sizes.filter((s) => s.available).length} sizes
            </span>
          </div>

          {/* Hover underline */}
          <div
            className={`h-0.5 bg-gradient-to-r from-[#5B2D8E] to-[#7B4DB0] mt-4 transition-all duration-500 origin-left ${
              isHovered ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        </div>
      </div>
    </Link>
  );
}
