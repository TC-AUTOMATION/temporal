'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingBag, RotateCcw, Truck, Zap, Shield, Eye, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { getProductById, products } from '@/lib/products';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const { language, addToCart, setCartOpen } = useStore();
  const t = translations[language];

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setViewersCount(Math.floor(Math.random() * 40) + 15);
    const interval = setInterval(() => {
      setViewersCount((prev) => Math.max(10, prev + Math.floor(Math.random() * 5) - 2));
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>PRODUIT NON TROUVÉ</p>
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

  const { darkMode } = useStore();

  return (
    <div className={darkMode ? 'dark' : ''}>
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBanner />
      <Header showLogo />
      <Sidebar />
      <CartDrawer />
      <SearchOverlay />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left - Images */}
          <div className="space-y-4">
            <div className="rounded-[2rem] overflow-hidden border-2 border-border/30 bg-card relative">
              <div className="relative aspect-square">
                {product.images[currentImage] ? (
                  <Image
                    src={product.images[currentImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <span className="text-9xl font-black text-foreground/5" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>T</span>
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setCurrentImage((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <ChevronRight size={24} />
                </Button>

                <Button
                  variant={isLiked ? "default" : "secondary"}
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`absolute top-4 right-4 rounded-full w-12 h-12 ${isLiked ? 'bg-primary' : 'bg-background/80 backdrop-blur-sm'}`}
                >
                  <Heart size={22} className={isLiked ? 'fill-current' : ''} />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentImage ? 'bg-primary w-8' : 'bg-foreground/30 w-2 hover:bg-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    currentImage === i ? 'border-primary ring-2 ring-primary/30' : 'border-border/30 hover:border-primary/50'
                  }`}
                >
                  <div className="w-full h-full relative">
                    <Image
                      src={img}
                      alt={`${product.name} - Vue ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="rounded-full px-4 py-2 bg-primary/10 border-primary/30 text-primary">
                <Zap size={14} className="mr-2" />
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}>LIMITED EDITION</span>
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted/50 rounded-full px-4 py-2">
                <Eye size={14} />
                <span>{viewersCount} personnes regardent</span>
              </div>
            </div>

            <div>
              <h1
                className="text-5xl md:text-6xl text-foreground mb-3 uppercase"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {product.name}
              </h1>
              <p className="text-muted-foreground mb-4 uppercase tracking-wider text-sm">
                Coloris : {product.colors[selectedColor]?.name || 'Noir'}
              </p>
              <div className="flex items-baseline gap-4">
                <span
                  className="text-5xl text-primary"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.price}€
                </span>
                <span className="text-muted-foreground line-through text-xl">{Math.round(product.price * 1.2)}€</span>
                <Badge className="bg-green-500/20 text-green-400 border-0 rounded-full px-3">
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>-20%</span>
                </Badge>
              </div>
            </div>

            {product.colors.length > 1 && (
              <div>
                <p
                  className="text-muted-foreground mb-3"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                >
                  COULEUR
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => color.available && setSelectedColor(i)}
                      disabled={!color.available}
                      className={`w-14 h-14 rounded-full border-2 transition-all ${
                        selectedColor === i
                          ? 'border-primary ring-4 ring-primary/30 scale-110'
                          : 'border-border/50 hover:border-primary/50'
                      } ${!color.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-muted-foreground"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
                >
                  TAILLE
                </p>
                <Button variant="link" className="text-primary p-0 h-auto uppercase tracking-wider text-xs">Guide des tailles</Button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={`w-16 h-16 rounded-full border-2 transition-all ${
                      selectedSize === size.name
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-transparent border-border/50 text-foreground hover:border-primary/50'
                    } ${!size.available ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.25rem', letterSpacing: '0.1em' }}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-full px-6 py-3 flex items-center gap-3">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span
                className="text-destructive"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                STOCK LIMITÉ — BIENTÔT ÉPUISÉ !
              </span>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center bg-muted/50 rounded-full border border-border/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-14 w-14 rounded-full"
                >
                  <Minus size={18} />
                </Button>
                <span
                  className="w-12 text-center text-foreground text-xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-14 w-14 rounded-full"
                >
                  <Plus size={18} />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1 h-14 rounded-full text-lg"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
              >
                <ShoppingBag size={22} className="mr-3" />
                AJOUTER AU PANIER
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center border border-border/20">
                <RotateCcw size={24} className="text-primary mb-2" />
                <span
                  className="text-muted-foreground text-center"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                >
                  RETOUR 14J
                </span>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center border border-border/20">
                <Truck size={24} className="text-primary mb-2" />
                <span
                  className="text-muted-foreground text-center"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                >
                  48-72H
                </span>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center border border-border/20">
                <Shield size={24} className="text-primary mb-2" />
                <span
                  className="text-muted-foreground text-center"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                >
                  PAIEMENT SÉCURISÉ
                </span>
              </div>
            </div>

            <Accordion type="single" collapsible defaultValue="description" className="space-y-2">
              <AccordionItem value="description" className="bg-muted/30 rounded-2xl border-border/20 px-5">
                <AccordionTrigger
                  className="text-foreground"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  DESCRIPTION
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">{product.description}</p>
                    {product.modelInfo && <p className="text-muted-foreground/70 text-sm">{product.modelInfo}</p>}
                    <div className="pt-2">
                      <p className="text-muted-foreground/70 text-sm font-medium mb-2">Détails :</p>
                      <ul className="text-muted-foreground/70 text-sm space-y-1">
                        <li>• Tissu premium 500 GSM</li>
                        <li>• 100% coton biologique</li>
                        <li>• Broderie logo signature</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sizes" className="bg-muted/30 rounded-2xl border-border/20 px-5">
                <AccordionTrigger
                  className="text-foreground"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  GUIDE DES TAILLES
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground text-sm">
                    <p>Notre modèle mesure 174cm et porte une taille L.</p>
                    <p className="mt-2">Pour un fit oversized, prenez votre taille habituelle.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care" className="bg-muted/30 rounded-2xl border-border/20 px-5">
                <AccordionTrigger
                  className="text-foreground"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  ENTRETIEN
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Lavage machine 30°C</li>
                    <li>• Ne pas sécher au sèche-linge</li>
                    <li>• Repassage température moyenne</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="bg-muted/30 rounded-2xl border-border/20 px-5">
                <AccordionTrigger
                  className="text-foreground"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  LIVRAISON & RETOURS
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground text-sm space-y-2">
                    <p>Livraison France : 48-72h (5,90€)</p>
                    <p>Livraison internationale : 5-7 jours</p>
                    <p>Retours gratuits sous 14 jours</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl text-foreground uppercase"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              Tu vas aussi aimer
            </h2>
            <Button variant="link" className="text-primary uppercase tracking-wider">Voir tout</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
