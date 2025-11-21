'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { products } from '@/lib/products';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const filteredProducts = query.length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <Dialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogTitle className="sr-only">Recherche</DialogTitle>
        {/* Search input */}
        <div className="flex items-center border-b border-border p-2">
          <Search size={20} className="ml-2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="border-0 focus-visible:ring-0 text-lg"
          />
        </div>

        <ScrollArea className="max-h-96">
          {/* Search results */}
          {query.length > 0 && (
            <div className="p-4">
              {filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery('');
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/40 to-primary/20"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-primary font-bold">{product.price} €</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun résultat pour "{query}"
                </p>
              )}
            </div>
          )}

          {/* Popular searches when empty */}
          {query.length === 0 && (
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-3">Recherches populaires</p>
              <div className="flex flex-wrap gap-2">
                {['Veste', 'T-shirt', 'Jogging', 'Bonnet'].map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
