'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/stores/useStore';
import { Package } from 'lucide-react';

interface PackProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface PackItem {
  productId: string;
  quantity: number;
  product: PackProduct;
}

interface PackData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  image?: string | null;
  items: PackItem[];
  originalPrice: number;
  discount: number;
  discountPercent: number;
}

export default function PackCard({ pack }: { pack: PackData }) {
  const { darkMode, language } = useStore();

  const productImages = pack.items
    .flatMap((item) => item.product.images.slice(0, 1))
    .slice(0, 4);

  const hasDiscount = pack.discount > 0;

  return (
    <Link href={`/packs/${pack.slug}`} className="group block">
      <div
        className={`relative rounded-2xl overflow-hidden border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 ${
          darkMode
            ? 'bg-white/5 border-white/10'
            : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10">
            <div
              className="bg-primary text-white px-3 py-1 text-sm"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              -{pack.discountPercent}%
            </div>
          </div>
        )}

        {/* Pack badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
              darkMode
                ? 'bg-black/60 text-white/90 backdrop-blur-sm'
                : 'bg-white/90 text-gray-900 backdrop-blur-sm shadow-sm'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <Package size={12} />
            PACK
          </div>
        </div>

        {/* Product images grid */}
        <div className="aspect-square relative overflow-hidden">
          {productImages.length >= 2 ? (
            <div className="grid grid-cols-2 h-full">
              {productImages.slice(0, 4).map((img, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : pack.image ? (
            <Image
              src={pack.image}
              alt={pack.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Package size={48} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Pack info */}
        <div className="p-4">
          {/* Products list */}
          <div className={`text-xs mb-2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {pack.items.map((item) => item.product.name).join(' + ')}
          </div>

          {/* Pack name */}
          <h3
            className={`text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {pack.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {pack.price.toFixed(2)}€
            </span>
            {hasDiscount && (
              <span
                className={`text-sm line-through ${darkMode ? 'text-white/30' : 'text-gray-400'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {pack.originalPrice.toFixed(2)}€
              </span>
            )}
          </div>

          {/* CTA */}
          <div
            className="mt-4 w-full py-2.5 text-center bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary rounded-lg transition-all duration-300"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.85rem' }}
          >
            {language === 'fr' ? 'VOIR LE PACK' : 'VIEW PACK'}
          </div>
        </div>
      </div>
    </Link>
  );
}
