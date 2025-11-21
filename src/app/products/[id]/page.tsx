'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Heart } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { getProductById, products } from '@/lib/products';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/product/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const { language, darkMode, addToCart, setCartOpen } = useStore();
  const t = translations[language];

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);

  useEffect(() => {
    setViewersCount(Math.floor(Math.random() * 40) + 15);
    const interval = setInterval(() => {
      setViewersCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (product) {
      const availableSize = product.sizes.find((s) => s.available);
      if (availableSize) setSelectedSize(availableSize.name);
    }
  }, [product]);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Produit non trouvé</div>;
  }

  const allImages = [...product.images, ...product.modelImages];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: product.colors[selectedColor]?.name || '',
      quantity: 1,
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

        <main className="px-4 py-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 mb-4 relative">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {product.name} - Image {currentImage + 1}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 bg-gray-100 flex-shrink-0 border-2 ${
                      currentImage === i ? 'border-[#5B2D8E]' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              {product.modelInfo && (
                <p className="mt-4 text-sm opacity-60">{product.modelInfo}</p>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-[#5B2D8E] text-xl font-medium mb-6">{product.price}€</p>

              {/* Colors */}
              {product.colors.length > 1 && (
                <div className="mb-6">
                  <p className="text-sm mb-2">{t.color}</p>
                  <div className="flex gap-2">
                    {product.colors.map((color, i) => (
                      <button
                        key={color.name}
                        onClick={() => color.available && setSelectedColor(i)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === i ? 'border-[#5B2D8E]' : 'border-gray-300'
                        } ${!color.available ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        disabled={!color.available}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-6">
                <p className="text-sm mb-2">{t.size}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => size.available && setSelectedSize(size.name)}
                      className={`px-4 py-2 border-2 transition-colors ${
                        selectedSize === size.name
                          ? 'border-[#5B2D8E] bg-[#5B2D8E] text-white'
                          : darkMode
                          ? 'border-white/30'
                          : 'border-black/30'
                      } ${!size.available ? 'line-through-custom cursor-not-allowed' : ''}`}
                      disabled={!size.available}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div className="flex items-center gap-4 mb-6 text-sm">
                <span className="text-red-500 font-medium">{t.limitedQuantity}</span>
                <span className="flex items-center gap-1 opacity-60">
                  <Eye size={16} />
                  {viewersCount} {t.peopleWatching}
                </span>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {t.addToCart}
              </button>

              <button className="w-full py-3 border border-current flex items-center justify-center gap-2 hover:opacity-70 transition-opacity">
                <Heart size={18} />
                Favoris
              </button>

              {/* Product details */}
              <div className="mt-8 space-y-4 border-t border-current/20 pt-6">
                <details className="group">
                  <summary className="cursor-pointer font-medium">{t.description}</summary>
                  <p className="mt-2 text-sm opacity-70">{product.description}</p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium">{t.sizeGuide}</summary>
                  <p className="mt-2 text-sm opacity-70">Guide des tailles bientôt disponible</p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium">{t.care}</summary>
                  <p className="mt-2 text-sm opacity-70">Lavage à 30°C, ne pas sécher au sèche-linge</p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium">{t.deliveryInfo}</summary>
                  <div className="mt-2 text-sm opacity-70 space-y-1">
                    <p>{t.returns}</p>
                    <p>{t.nationalShipping}</p>
                    <p>{t.internationalShipping}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Related products */}
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">{t.alsoLike}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
