'use client';

import { Trash2, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { products } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function CartDrawer() {
  const {
    language,
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    addToCart,
  } = useStore();
  const t = translations[language];

  const total = cartTotal();

  // Get suggested products (not in cart)
  const cartIds = cart.map(item => item.id);
  const suggestedProducts = products.filter(p => !cartIds.includes(p.id)).slice(0, 2);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full max-w-md bg-card border-border p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ShoppingBag size={22} className="text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="text-foreground font-bold text-xl">Ton Panier</SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                {cart.length} article{cart.length > 1 ? 's' : ''}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <ShoppingBag size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">Ton panier est vide</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Ajoute des pièces pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="bg-secondary rounded-2xl p-4 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/40 to-primary/20">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            TPL
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-foreground font-bold truncate">{item.name}</h3>
                            <Badge variant="secondary" className="mt-1">Taille: {item.size}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="rounded-full h-8 w-8"
                          >
                            <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-background rounded-full">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center text-foreground font-bold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() =>
                                updateQuantity(item.id, item.size, item.quantity + 1)
                              }
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <p className="text-primary font-bold text-lg">{item.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && suggestedProducts.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-primary" />
                    <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Tu vas kiffer</h3>
                  </div>
                  <div className="space-y-3">
                    {suggestedProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 bg-secondary rounded-xl p-3 border border-border">
                        <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/40 to-primary/20" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{product.name}</p>
                          <p className="text-primary text-sm font-bold">{product.price.toFixed(2)} €</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            const availableSize = product.sizes.find(s => s.available);
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
                            }
                          }}
                        >
                          + ADD
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <SheetFooter className="p-6 border-t border-border flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="text-muted-foreground text-sm">Total</span>
                <p className="text-foreground text-3xl font-black">{total.toFixed(2)} €</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Livraison calculée au checkout</p>
                <p className="text-muted-foreground text-xs">Taxes incluses</p>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full rounded-2xl font-bold text-lg h-14"
            >
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                CHECKOUT
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
