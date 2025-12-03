'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, RotateCcw, Truck, Shield, Minus, Plus, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { getProductById, products } from '@/lib/products';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const { language, addToCart, setCartOpen, darkMode } = useStore();
  const t = translations[language];

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (product) {
      const availableSize = product.sizes.find((s) => s.available);
      if (availableSize) setSelectedSize(availableSize.name);
    }
  }, [product]);

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>PRODUIT NON TROUVÉ</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: product.colors[selectedColor]?.name || '',
      quantity: quantity,
      image: product.images[0],
    });
    setCartOpen(true);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

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
            RETOUR
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
                  {product.images.map((img, i) => (
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
              {/* Category */}
              <p
                className={`text-xs uppercase tracking-widest ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {product.category}
              </p>

              {/* Name */}
              <h1
                className="text-4xl md:text-5xl uppercase"
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
                  {product.price}€
                </span>
              </div>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div>
                  <p
                    className={`text-xs mb-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    COULEUR — {product.colors[selectedColor]?.name}
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((color, i) => (
                      <button
                        key={color.name}
                        onClick={() => color.available && setSelectedColor(i)}
                        disabled={!color.available}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === i
                            ? 'border-primary scale-110'
                            : darkMode ? 'border-white/20' : 'border-black/20'
                        } ${!color.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                  >
                    TAILLE
                  </p>
                  <button
                    className="text-xs text-primary uppercase tracking-wider"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    Guide des tailles
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => size.available && setSelectedSize(size.name)}
                      disabled={!size.available}
                      className={`w-14 h-14 flex items-center justify-center border transition-all ${
                        selectedSize === size.name
                          ? 'bg-primary border-primary text-white'
                          : darkMode
                            ? 'border-white/20 hover:border-white/50'
                            : 'border-black/20 hover:border-black/50'
                      } ${!size.available ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem' }}
                    >
                      {size.name}
                    </button>
                  ))}
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
                  AJOUTER AU PANIER
                </button>
              </div>

              {/* Features */}
              <div className={`grid grid-cols-3 gap-4 py-6 border-t border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="text-center">
                  <RotateCcw size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    RETOUR 14J
                  </p>
                </div>
                <div className="text-center">
                  <Truck size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    EXPÉDITION RAPIDE
                  </p>
                </div>
                <div className="text-center">
                  <Shield size={20} className="mx-auto mb-2 text-primary" />
                  <p
                    className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    PAIEMENT SÉCURISÉ
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3
                  className="text-sm mb-3"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  DESCRIPTION
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                  {product.description}
                </p>
                {product.modelInfo && (
                  <p className={`text-xs mt-3 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {product.modelInfo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related products */}
          <div className="mt-20">
            <h2
              className="text-2xl mb-8"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              VOUS AIMEREZ AUSSI
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
