'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Zap } from 'lucide-react';
import { Product, useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart, setCartOpen } = useStore();

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
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rounded-[2rem] overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 bg-card shadow-lg hover:shadow-2xl hover:shadow-primary/10">
        <div className="aspect-[3/4] relative overflow-hidden rounded-t-[2rem]">
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: isHovered
                ? 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary)/0.15) 0%, transparent 70%)'
                : 'transparent'
            }}
          />

          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}>
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center">
                <span className="text-7xl font-black text-foreground/10 tracking-tighter">T</span>
              </div>
            )}
          </div>

          <Button
            variant={isLiked ? "default" : "secondary"}
            size="icon"
            onClick={handleLike}
            className={`absolute top-4 right-4 rounded-full w-10 h-10 transition-all duration-300 ${isLiked ? 'scale-110 bg-primary' : 'bg-background/80 backdrop-blur-sm'}`}
          >
            <Heart
              size={18}
              className={`transition-all ${isLiked ? 'fill-current' : ''}`}
            />
          </Button>

          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button
              onClick={handleQuickAdd}
              className="w-full rounded-full font-black uppercase tracking-widest text-sm py-6 bg-primary hover:bg-primary/90"
              style={{ fontFamily: '"Bebas Neue", "Impact", sans-serif', letterSpacing: '0.15em' }}
            >
              <Plus size={18} strokeWidth={3} className="mr-2" />
              AJOUTER
            </Button>
          </div>

          <Badge className="absolute top-4 left-4 rounded-full px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground border-0">
            <Zap size={12} className="text-primary mr-1" />
            <span style={{ fontFamily: '"Bebas Neue", "Impact", sans-serif', letterSpacing: '0.1em' }}>LIMITED</span>
          </Badge>
        </div>

        <div className="p-5 bg-card">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3
              className="text-foreground text-xl leading-tight group-hover:text-primary transition-colors uppercase"
              style={{ fontFamily: '"Bebas Neue", "Impact", sans-serif', letterSpacing: '0.05em' }}
            >
              {product.name}
            </h3>
            <div className="text-right flex-shrink-0">
              <span
                className="text-primary text-2xl"
                style={{ fontFamily: '"Bebas Neue", "Impact", sans-serif' }}
              >
                {product.price}€
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={color.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 shadow-sm ${
                    i === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {product.sizes.filter(s => s.available).slice(0, 3).map((size) => (
                <span
                  key={size.name}
                  className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50"
                  style={{ fontFamily: '"Bebas Neue", "Impact", sans-serif', letterSpacing: '0.05em' }}
                >
                  {size.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
