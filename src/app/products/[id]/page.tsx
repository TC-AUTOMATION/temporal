'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, RotateCcw, Truck, Shield, Minus, Plus, ChevronLeft, ArrowLeft, X, Loader2, ChevronDown, FileText, Shirt, WashingMachine, User } from 'lucide-react';
import TemporalStar from '@/components/ui/TemporalStar';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ViewerCount from '@/components/product/ViewerCount';

// Check if product is a sticker
const isSticker = (name: string) => name.toLowerCase().includes('sticker');

// Check if product is a clothing item (has noir/blanc variants)
const isClothing = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('veste') || lower.includes('t-shirt') || lower.includes('jogging') || lower.includes('bonnet') || lower.includes('ensemble');
};

// Check if current product is noir or blanc
const isNoirVariant = (name: string) => name.toLowerCase().includes('noir');

// Clothing color variants (noir and blanc)
const clothingColorVariants = [
  { name: 'Noir', hex: '#000000', slug: 'noir' },
  { name: 'Blanc', hex: '#FFFFFF', slug: 'blanc' },
];

// Sticker color variants with dual colors
const stickerColorVariants = [
  { name: 'Noir/Violet', color1: '#000000', color2: '#5B2D8E', slug: 'noir-violet' },
  { name: 'Noir/Blanc', color1: '#000000', color2: '#FFFFFF', slug: 'noir-blanc' },
  { name: 'Violet/Noir', color1: '#5B2D8E', color2: '#000000', slug: 'violet-noir' },
  { name: 'Violet/Blanc', color1: '#5B2D8E', color2: '#FFFFFF', slug: 'violet-blanc' },
  { name: 'Blanc/Noir', color1: '#FFFFFF', color2: '#000000', slug: 'blanc-noir' },
  { name: 'Blanc/Violet', color1: '#FFFFFF', color2: '#5B2D8E', slug: 'blanc-violet' },
];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { language, addToCart, setCartOpen, darkMode } = useStore();
  const t = translations[language];

  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const [sizeGuideData, setSizeGuideData] = useState<any>(null);

  // Fetch product from API (with cache-busting for Safari)
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        });
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const result = await response.json();
        setProduct(result.data?.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Fetch all products (for variants and related)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=100', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        });
        if (response.ok) {
          const result = await response.json();
          const products = result.data?.products || [];
          setAllProducts(products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchAllProducts();
  }, [params.id]);

  // Update related products when product or allProducts change
  useEffect(() => {
    if (!product || !allProducts.length) return;

    // Filter out current product
    const filtered = allProducts.filter((p: any) => p.id !== product.id);

    // Determine current product color
    const currentIsNoir = product.name.toLowerCase().includes('noir');
    const currentIsBlanc = product.name.toLowerCase().includes('blanc');

    // Sort: same color first, then others
    const sorted = [...filtered].sort((a: any, b: any) => {
      const aIsNoir = a.name.toLowerCase().includes('noir');
      const aIsBlanc = a.name.toLowerCase().includes('blanc');
      const bIsNoir = b.name.toLowerCase().includes('noir');
      const bIsBlanc = b.name.toLowerCase().includes('blanc');

      // If current is noir, prioritize noir products
      if (currentIsNoir) {
        if (aIsNoir && !bIsNoir) return -1;
        if (!aIsNoir && bIsNoir) return 1;
      }
      // If current is blanc, prioritize blanc products
      if (currentIsBlanc) {
        if (aIsBlanc && !bIsBlanc) return -1;
        if (!aIsBlanc && bIsBlanc) return 1;
      }
      return 0;
    });

    setRelatedProducts(sorted.slice(0, 4));
  }, [product, allProducts]);

  // Fetch size guide data for this product's category
  useEffect(() => {
    const fetchSizeGuide = async () => {
      try {
        const res = await fetch('/api/size-guides', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const categorySlug = product?.category?.slug?.toLowerCase() || '';
          const name = product?.name?.toLowerCase() || '';
          const matched = data.data.find((g: any) =>
            g.categorySlug === categorySlug ||
            (name.includes('veste') && g.categorySlug === 'vestes') ||
            (name.includes('t-shirt') && g.categorySlug === 'tshirts') ||
            (name.includes('jogging') && g.categorySlug === 'pantalons') ||
            (name.includes('bonnet') && g.categorySlug === 'accessoires')
          );
          if (matched) setSizeGuideData(matched);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (product) fetchSizeGuide();
  }, [product]);

  // Check if product should show size guide (not for stickers/accessories)
  const shouldShowSizeGuide = () => {
    if (!product) return false;
    if (isSticker(product.name)) return false;
    const categorySlug = product.category?.slug?.toLowerCase() || '';
    if (categorySlug === 'accessoires' || categorySlug === 'stickers') return false;
    return true;
  };

  // Find variant product by color (for clothing)
  const findVariantByColor = (colorSlug: string) => {
    if (!product || !allProducts.length) return null;

    // Get base product name without color
    const productBase = product.name.toLowerCase()
      .replace(/\s*-\s*(noir|blanc|noire|blanche)e?$/i, '')
      .trim();

    return allProducts.find((p: any) => {
      const pBase = p.name.toLowerCase()
        .replace(/\s*-\s*(noir|blanc|noire|blanche)e?$/i, '')
        .trim();

      // Check if names match and has the target color
      const pNameLower = p.name.toLowerCase();
      const hasTargetColor = colorSlug === 'noir'
        ? (pNameLower.includes('noir') && !pNameLower.includes('blanc'))
        : (pNameLower.includes('blanc') && !pNameLower.includes('noir'));

      return pBase === productBase && hasTargetColor && p.id !== product.id;
    });
  };

  // Find sticker variant by color combo
  const findStickerVariant = (slug: string) => {
    if (!product || !allProducts.length) return null;
    return allProducts.find((p: any) => {
      const pName = p.name.toLowerCase();
      return pName.includes('sticker') && pName.includes(slug.replace('-', '/'));
    });
  };


  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const availableVariant = product.variants.find((v: any) => v.stock > 0);
      if (availableVariant) {
        setSelectedSize(availableVariant.size || '');
      }
    }
  }, [product]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>{t.productNotFound}</p>
          <Link href="/shop" className="mt-4 inline-block px-6 py-3 bg-primary text-white hover:bg-primary/90" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;

    // Find the selected variant
    const variant = product.variants?.find((v: any) => v.size === selectedSize);

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      size: selectedSize,
      color: variant?.color || '',
      quantity: quantity,
      image: product.images?.[0] || '',
    });
    setCartOpen(true);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Back button */}
          <Link
            href="/"
            className={`inline-flex items-center gap-2 mb-8 transition-colors ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={18} />
            {t.back}
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left - Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className={`aspect-square relative overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                {product.images[currentImage] ? (
                  <Image
                    src={product.images[currentImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-9xl font-black ${darkMode ? 'text-white/5' : 'text-black/5'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      TPL
                    </span>
                  </div>
                )}

                {/* Like button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center transition-all ${
                    isLiked ? 'bg-primary text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                </button>

                {/* Navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev + 1) % product.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all rotate-180"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-20 h-20 flex-shrink-0 relative overflow-hidden transition-all ${
                        currentImage === i
                          ? 'ring-2 ring-primary'
                          : darkMode ? 'opacity-50 hover:opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} - ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Streetwear decorative line */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-primary"></div>
                <span
                  className="text-xl tracking-[0.3em] text-black dark:text-white"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {language === 'en' ? 'WINTER DROP' : "DROP D'HIVER"}
                </span>
              </div>

              {/* NEW badge + Category */}
              <div className="flex items-center gap-4">
                {product.isNew !== false && (
                  <span
                    className="px-4 py-1.5 bg-primary text-white text-sm"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.newBadge}
                  </span>
                )}
                <p
                  className={`text-sm uppercase tracking-widest ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.category?.name || (language === 'fr' ? 'Produit' : 'Product')}
                </p>
              </div>

              {/* Name */}
              <h1
                className="text-4xl md:text-5xl uppercase leading-none"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span
                  className="text-3xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {Number(product.price).toFixed(2)}€
                </span>
              </div>

              {/* Color variants - Clothing (Noir/Blanc) */}
              {isClothing(product.name) && (
                <div>
                  <p
                    className={`text-xs mb-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    {t.color.toUpperCase()} — {isNoirVariant(product.name) ? 'NOIR' : 'BLANC'}
                  </p>
                  <div className="flex gap-3">
                    {clothingColorVariants.map((colorVariant) => {
                      const isCurrentColor = (colorVariant.slug === 'noir' && isNoirVariant(product.name)) ||
                                             (colorVariant.slug === 'blanc' && !isNoirVariant(product.name));
                      const variantProduct = !isCurrentColor ? findVariantByColor(colorVariant.slug) : null;

                      return (
                        <button
                          key={colorVariant.name}
                          onClick={() => {
                            if (!isCurrentColor && variantProduct) {
                              router.push(`/products/${variantProduct.id}`);
                            }
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            isCurrentColor
                              ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                              : variantProduct
                                ? 'border-black/20 hover:border-primary hover:scale-105 cursor-pointer'
                                : 'border-black/10 opacity-30 cursor-not-allowed'
                          } ${darkMode && !isCurrentColor ? 'border-white/20 ring-offset-black' : ''}`}
                          style={{ backgroundColor: colorVariant.hex }}
                          title={colorVariant.name}
                          disabled={!isCurrentColor && !variantProduct}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color variants - Stickers (6 bicolor variants) */}
              {isSticker(product.name) && (
                <div>
                  <p
                    className={`text-xs mb-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    {t.color.toUpperCase()}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {stickerColorVariants.map((variant) => {
                      const isCurrentVariant = product.name.toLowerCase().includes(variant.slug.replace('-', '/'));
                      const variantProduct = !isCurrentVariant ? findStickerVariant(variant.slug) : null;

                      return (
                        <button
                          key={variant.slug}
                          onClick={() => {
                            if (!isCurrentVariant && variantProduct) {
                              router.push(`/products/${variantProduct.id}`);
                            }
                          }}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                            isCurrentVariant
                              ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                              : variantProduct
                                ? 'border-black/20 hover:border-primary hover:scale-105 cursor-pointer'
                                : 'border-black/10 opacity-30 cursor-not-allowed'
                          } ${darkMode ? 'ring-offset-black' : ''}`}
                          title={variant.name}
                          disabled={!isCurrentVariant && !variantProduct}
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
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes from variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    {t.size.toUpperCase()}
                  </p>
                  {shouldShowSizeGuide() && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className={`text-sm uppercase tracking-wider hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.95rem' }}
                    >
                      {t.sizeGuide}
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.variants && (Array.from(new Set(product.variants.map((v: any) => v.size))).filter(Boolean) as string[]).map((size: string) => {
                    const variant = product.variants.find((v: any) => v.size === size);
                    const isAvailable = variant && variant.stock > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`w-14 h-14 flex items-center justify-center border transition-all ${
                          selectedSize === size
                            ? 'bg-primary border-primary text-white'
                            : darkMode
                              ? 'border-white/20 hover:border-white/50'
                              : 'border-black/20 hover:border-black/50'
                        } ${!isAvailable ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem' }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Add to cart */}
              <div className="flex gap-4">
                <div className={`flex items-center border ${darkMode ? 'border-white/20' : 'border-black/20'}`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-14 flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    className="w-12 text-center"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem' }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-14 flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex-1 h-14 bg-primary text-white flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <ShoppingBag size={20} />
                  {t.addToCartShort}
                </button>
              </div>

              {/* Viewer Count - How many people are viewing this product */}
              <ViewerCount productId={product.id} />

              {/* Description, Materials, Care - Collapsible sections */}
              <div className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                {/* Description */}
                <div className={`p-4 ${darkMode ? 'bg-white/5' : 'bg-black/[0.02]'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <FileText size={16} className="text-primary" />
                    <h3
                      className="text-sm"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.description.toUpperCase()}
                    </h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {product.description}
                  </p>
                  {product.modelInfo && (
                    <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                      <User size={12} className="text-primary" />
                      <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {product.modelInfo}
                      </p>
                    </div>
                  )}
                </div>

                {/* Materials Dropdown */}
                <div className={`border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <button
                    onClick={() => setShowMaterials(!showMaterials)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Shirt size={16} className="text-primary" />
                      <h3
                        className="text-sm"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                      >
                        {t.materials.toUpperCase()}
                      </h3>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${showMaterials ? 'rotate-180' : ''} ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      showMaterials ? 'max-h-40' : 'max-h-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pl-[44px]">
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                        {language === 'en' && product.materialsEn ? product.materialsEn :
                         product.materials ? product.materials :
                         isSticker(product.name) ? t.materialsSticker :
                         product.name.toLowerCase().includes('veste') ? t.materialsJacket :
                         product.name.toLowerCase().includes('t-shirt') ? t.materialsTshirt :
                         product.name.toLowerCase().includes('jogging') ? t.materialsJogging :
                         product.name.toLowerCase().includes('bonnet') ? t.materialsBonnet :
                         t.materialsJacket}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Care Instructions Dropdown */}
                <div className={`border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <button
                    onClick={() => setShowCare(!showCare)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <WashingMachine size={16} className="text-primary" />
                      <h3
                        className="text-sm"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                      >
                        {t.careInstructions.toUpperCase()}
                      </h3>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${showCare ? 'rotate-180' : ''} ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      showCare ? 'max-h-40' : 'max-h-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pl-[44px]">
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                        {language === 'en' && product.careInstructionsEn ? product.careInstructionsEn :
                         product.careInstructions ? product.careInstructions :
                         isSticker(product.name) ? t.careSticker :
                         product.name.toLowerCase().includes('veste') ? t.careJacket :
                         product.name.toLowerCase().includes('t-shirt') ? t.careTshirt :
                         product.name.toLowerCase().includes('jogging') ? t.careJogging :
                         product.name.toLowerCase().includes('bonnet') ? t.careBonnet :
                         t.careJacket}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className={`grid grid-cols-3 gap-4 py-6 border-t border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="text-center">
                  <RotateCcw size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {t.return14Days}
                  </p>
                </div>
                <div className="text-center">
                  <Truck size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {t.preparation72h}
                  </p>
                </div>
                <div className="text-center">
                  <Shield size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {t.securePaymentShort}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          <div className="mt-20">
            {/* Header with Temporal star - same as cart */}
            <div className="flex items-center gap-3 mb-8">
              <TemporalStar size={28} className="text-primary" />
              <h2
                className="text-2xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.youWillLove.toUpperCase()}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </main>

        <Footer />

        {/* Size Guide Modal - Dynamic Table */}
        {showSizeGuide && (
          <>
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowSizeGuide(false)}
            />
            <div className="fixed inset-4 md:inset-10 lg:inset-20 z-50 flex items-center justify-center">
              <div className={`relative max-w-3xl w-full max-h-full overflow-auto ${darkMode ? 'bg-black border border-white/20' : 'bg-white border border-black/20'}`}>
                {/* Header */}
                <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}>
                  <h3
                    className="text-xl"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.sizeGuide.toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  >
                    <X size={20} />
                  </button>
                </div>
                {/* Dynamic size table */}
                <div className="p-4">
                  {sizeGuideData ? (
                    <>
                      {(language === 'fr' ? sizeGuideData.tipsFr : sizeGuideData.tipsEn) && (
                        <p className={`mb-4 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                          {language === 'fr' ? sizeGuideData.tipsFr : sizeGuideData.tipsEn}
                        </p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={darkMode ? 'bg-primary/10' : 'bg-primary/5'}>
                              <th className="px-3 py-3 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'TAILLE' : 'SIZE'}
                              </th>
                              <th className="px-3 py-3 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'POITRINE' : 'CHEST'}
                              </th>
                              <th className="px-3 py-3 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'TAILLE' : 'WAIST'}
                              </th>
                              <th className="px-3 py-3 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'HANCHES' : 'HIPS'}
                              </th>
                              <th className="px-3 py-3 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'LONGUEUR' : 'LENGTH'}
                              </th>
                              <th className="px-3 py-3 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>
                                {language === 'fr' ? 'ÉPAULES' : 'SHOULDERS'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(sizeGuideData.sizes as any[]).map((row: any, index: number) => (
                              <tr
                                key={index}
                                className={`border-t ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/[0.02]'}`}
                              >
                                <td className="px-3 py-3">
                                  <span
                                    className="inline-flex items-center justify-center w-10 h-10 bg-primary text-white text-sm"
                                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                  >
                                    {row.size}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.chest || '-'}</td>
                                <td className="px-3 py-3 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.waist || '-'}</td>
                                <td className="px-3 py-3 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.hips || '-'}</td>
                                <td className="px-3 py-3 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.length || '-'}</td>
                                <td className="px-3 py-3 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.shoulders || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className={`mt-3 text-xs text-center ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {language === 'fr' ? `Mesures en ${sizeGuideData.unit}` : `Measurements in ${sizeGuideData.unit}`}
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {language === 'fr' ? 'Guide des tailles bientôt disponible' : 'Size guide coming soon'}
                      </p>
                      <Link
                        href="/size-guide"
                        className="inline-block mt-4 px-6 py-2 bg-primary text-white text-sm hover:bg-primary/90"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                      >
                        {language === 'fr' ? 'VOIR LE GUIDE COMPLET' : 'SEE FULL GUIDE'}
                      </Link>
                    </div>
                  )}
                </div>
                {/* Link to full guide + care guide */}
                <div className={`flex gap-3 p-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <Link
                    href="/size-guide"
                    className={`flex-1 text-center py-2 text-sm transition-colors ${darkMode ? 'text-white/60 hover:text-primary' : 'text-black/60 hover:text-primary'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {language === 'fr' ? 'GUIDE COMPLET DES TAILLES' : 'FULL SIZE GUIDE'}
                  </Link>
                  <Link
                    href="/care-guide"
                    className={`flex-1 text-center py-2 text-sm transition-colors ${darkMode ? 'text-white/60 hover:text-primary' : 'text-black/60 hover:text-primary'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {language === 'fr' ? 'GUIDE DE LAVAGE' : 'CARE GUIDE'}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
