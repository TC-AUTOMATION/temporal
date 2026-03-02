'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, ChevronDown } from 'lucide-react';
import { Product, useStore } from '@/stores/useStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import { getProductName, getProductCategory } from '@/lib/products';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  index?: number;
}

// Check if product is a sticker
const isSticker = (product: Product) => {
  const name = product.name.toLowerCase();
  const id = product.id.toLowerCase();
  return name.includes('sticker') || id.includes('sticker');
};

// Check if product is a clothing item (has noir/blanc variants)
const isClothing = (product: Product) => {
  const name = product.name.toLowerCase();
  return name.includes('veste') || name.includes('t-shirt') || name.includes('jogging') || name.includes('bonnet') || name.includes('ensemble');
};

// Get the base product type from name (e.g., "veste", "t-shirt")
const getProductBase = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes('veste')) return 'veste';
  if (lower.includes('t-shirt')) return 't-shirt';
  if (lower.includes('jogging')) return 'jogging';
  if (lower.includes('bonnet')) return 'bonnet';
  return null;
};

// Check if current product is noir or blanc
const isNoirVariant = (name: string) => name.toLowerCase().includes('noir');

// Clothing color variants (noir and blanc)
const clothingColorVariants = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
];

// All sticker color variants
const stickerColorVariants = [
  { id: 'sticker-black-purple', color1: '#000000', color2: '#5B2D8E' },
  { id: 'sticker-black-white', color1: '#000000', color2: '#FFFFFF' },
  { id: 'sticker-purple-black', color1: '#5B2D8E', color2: '#000000' },
  { id: 'sticker-purple-white', color1: '#5B2D8E', color2: '#FFFFFF' },
  { id: 'sticker-white-black', color1: '#FFFFFF', color2: '#000000' },
  { id: 'sticker-white-purple', color1: '#FFFFFF', color2: '#5B2D8E' },
];

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart, setCartOpen, darkMode, language } = useStore();
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const t = translations[language];

  // Extract colors and sizes from variants (API format) or use existing format
  const productAny = product as any;
  const colors = product.colors || (productAny.variants ?
    Array.from(new Map(productAny.variants.map((v: any) => [v.color, { name: v.color, hex: v.colorHex || '#000000' }])).values()) :
    []);
  const sizes = product.sizes || (productAny.variants ?
    Array.from(new Map(productAny.variants.map((v: any) => [v.size, { name: v.size, available: v.stock > 0 }])).values()) :
    []);

  const isLiked = isInWishlist(product.id);

  // Detect mobile/tablet (auto-switch images on screens < 1200px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-switch images on mobile/tablet - cascade effect: one product at a time, looping
  useEffect(() => {
    if (!isMobile || product.images.length <= 1) return;

    const imageCount = product.images.length;
    const timePerImage = 1000; // 1s per image
    const fixedSlotDuration = 4000; // Fixed 4s per product slot (animation + gap)
    const totalProducts = 10; // Total clothing products in the cascade
    const fullCycleDuration = totalProducts * fixedSlotDuration; // Full cycle before repeating
    const startDelay = index * fixedSlotDuration;

    let animationInterval: ReturnType<typeof setInterval> | null = null;
    let cycleTimeout: ReturnType<typeof setTimeout> | null = null;

    const runAnimation = () => {
      let currentImg = 0;

      // Animate through all images once
      animationInterval = setInterval(() => {
        currentImg++;
        if (currentImg >= imageCount) {
          if (animationInterval) clearInterval(animationInterval);
          setCurrentImageIndex(0);
        } else {
          setCurrentImageIndex(currentImg);
        }
      }, timePerImage);
    };

    const scheduleNextCycle = () => {
      cycleTimeout = setTimeout(() => {
        runAnimation();
        scheduleNextCycle(); // Schedule next cycle
      }, fullCycleDuration);
    };

    // Initial animation after delay
    const initialTimer = setTimeout(() => {
      runAnimation();
      scheduleNextCycle(); // Start the loop
    }, startDelay);

    return () => {
      clearTimeout(initialTimer);
      if (animationInterval) clearInterval(animationInterval);
      if (cycleTimeout) clearTimeout(cycleTimeout);
    };
  }, [isMobile, product.images.length, index]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showSizeSelector) {
      setShowSizeSelector(true);
      return;
    }

    if (selectedSize) {
      addToCart({
        id: product.id,
        name: getProductName(product, language),
        price: product.price,
        size: selectedSize,
        color: colors[0]?.name || '',
        quantity: 1,
        image: product.images[0],
      });
      setCartOpen(true);
      setShowSizeSelector(false);
      setSelectedSize(null);
    }
  };

  const handleSizeSelect = (e: React.MouseEvent, sizeName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sizeName);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isLiked) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
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
          {/* Product image - shows second image on hover (desktop) or auto-switches (mobile) */}
          <div className={`absolute inset-0 transition-transform duration-500 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {product.images[0] ? (
              <>
                {/* Mobile/Tablet: Auto-switching images */}
                {isMobile ? (
                  product.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-500 ${
                        currentImageIndex === idx ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))
                ) : (
                  /* Desktop: Hover to switch */
                  <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className={`object-cover transition-opacity duration-500 ${isHovered && product.images[1] ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {product.images[1] && (
                      <Image
                        src={product.images[1]}
                        alt={`${getProductName(product, language)} - view 2`}
                        fill
                        className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                      />
                    )}
                  </>
                )}
              </>
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
          <div
            className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {showSizeSelector && (
              <div className="bg-white p-2 mb-2">
                <p
                  className="text-black text-xs text-center mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.chooseSize}
                </p>
                <div className="flex gap-1 justify-center flex-wrap">
                  {sizes.filter((s: any) => s.available).map((size: any) => (
                    <button
                      key={size.name}
                      onClick={(e) => handleSizeSelect(e, size.name)}
                      className={`px-3 py-1 text-xs border transition-all ${
                        selectedSize === size.name
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black/20 hover:border-black'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleQuickAdd}
              className={`w-full py-3 bg-white text-black flex items-center justify-center gap-2 transition-all ${
                showSizeSelector && !selectedSize ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
            >
              <ShoppingBag size={16} />
              {showSizeSelector ? t.confirm : t.addToCartShort}
            </button>
          </div>

          {/* Status badge - Only show if isNew is true */}
          {(product as any).isNew !== false && (
            <div className="absolute top-3 left-3">
              <span
                className="px-3 py-1 bg-primary text-primary-foreground text-xs"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.newBadge}
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="pt-4 space-y-2">
          {/* Category */}
          <p
            className="text-xs text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            {getProductCategory(product, language)}
          </p>

          {/* Name and price row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-foreground text-base uppercase leading-tight group-hover:text-primary transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
            >
              {getProductName(product, language)}
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
            {isSticker(product) ? (
              // Sticker: show all 6 bicolor variants
              stickerColorVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="w-4 h-4 rounded-full overflow-hidden border border-gray-400"
                >
                  <div className="relative w-full h-full">
                    <div
                      className="absolute inset-0 w-1/2"
                      style={{ backgroundColor: variant.color1 }}
                    />
                    <div
                      className="absolute inset-0 left-1/2 w-1/2"
                      style={{ backgroundColor: variant.color2 }}
                    />
                  </div>
                </div>
              ))
            ) : isClothing(product) ? (
              // Clothing: always show noir and blanc variants
              clothingColorVariants.map((colorVariant) => (
                <div
                  key={colorVariant.name}
                  className="w-4 h-4 rounded-full border border-gray-400"
                  style={{ backgroundColor: colorVariant.hex }}
                />
              ))
            ) : (
              // Other products: show color dots from variants
              <>
                {colors.slice(0, 4).map((color: any, i: number) => (
                  <div
                    key={color.name}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      darkMode ? 'border-white/20' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{colors.length - 4}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
