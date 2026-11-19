'use client';

import { useState } from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useAdminStore, type AdminProduct } from '@/stores/useAdminStore';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'UNIQUE'];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 99 : i;
};

type Variant = NonNullable<AdminProduct['variants']>[number];

/** Met à jour le stock d'une variante dans le store admin (sans recharger). */
function patchStoreStock(productId: string, variantId: string, stock: number) {
  useAdminStore.setState((state) => ({
    products: state.products.map((p) => {
      if (p.id !== productId || !p.variants) return p;
      const variants = p.variants.map((v) => (v.id === variantId ? { ...v, stock } : v));
      // Recalcule les agrégats par taille utilisés par le formulaire d'édition
      const sizes = p.sizes.map((s) => {
        const total = variants.filter((v) => v.size === s.name).reduce((sum, v) => sum + v.stock, 0);
        return { ...s, stock: total, available: total > 0 };
      });
      return { ...p, variants, sizes, totalStock: variants.reduce((sum, v) => sum + v.stock, 0) };
    }),
  }));
}

/**
 * Ajustement rapide du stock directement sur la fiche produit (− / + / saisie).
 * Chaque changement est enregistré dans l'historique de stock (MANUEL).
 */
export default function QuickStock({ product, darkMode }: { product: AdminProduct; darkMode: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const variants = [...(product.variants || [])].sort(
    (a, b) => a.color.localeCompare(b.color) || sizeRank(a.size) - sizeRank(b.size)
  );
  if (variants.length === 0) return null;
  const multiColor = new Set(variants.map((v) => v.color)).size > 1;

  const send = async (v: Variant, mode: 'delta' | 'set', value: number) => {
    const target = mode === 'set' ? value : v.stock + value;
    if (target < 0 || target === v.stock) return;
    setBusy(v.id);
    setError(null);
    patchStoreStock(product.id, v.id, target); // optimiste
    try {
      const res = await fetch('/api/admin/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: v.id, mode, value, note: 'Ajustement rapide (page Produits)' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur');
      patchStoreStock(product.id, v.id, json.data.stock);
    } catch (e) {
      patchStoreStock(product.id, v.id, v.stock); // annule
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(null);
    }
  };

  const commitDraft = (v: Variant) => {
    setEditing(null);
    const n = Number(draft);
    if (draft.trim() !== '' && Number.isInteger(n) && n >= 0) send(v, 'set', n);
  };

  const btn = `w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-30 ${
    darkMode ? 'bg-white/10 hover:bg-white/25 text-white' : 'bg-black/5 hover:bg-black/15 text-black'
  }`;

  return (
    <div className={`mt-2 rounded-lg border p-2 space-y-1 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.02]'}`}>
      {variants.map((v) => {
        const color = v.stock === 0 ? 'text-red-400' : v.stock <= 3 ? 'text-orange-400' : darkMode ? 'text-white' : 'text-black';
        return (
          <div key={v.id} className="flex items-center gap-1.5">
            <span
              className={`flex-1 min-w-0 truncate text-xs flex items-center gap-1 ${darkMode ? 'text-white/60' : 'text-black/60'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {multiColor && v.colorHex && (
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
              )}
              {multiColor ? `${v.color} · ${v.size}` : v.size}
            </span>
            <button className={btn} disabled={busy === v.id || v.stock === 0} onClick={() => send(v, 'delta', -1)} title="Retirer 1">
              <Minus size={12} />
            </button>
            {editing === v.id ? (
              <input
                autoFocus
                type="number"
                min={0}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitDraft(v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitDraft(v);
                  if (e.key === 'Escape') setEditing(null);
                }}
                className={`w-10 text-center text-sm rounded border focus:outline-none focus:border-primary ${darkMode ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
              />
            ) : (
              <button
                className={`w-10 text-center text-sm ${color}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                onClick={() => {
                  setDraft(String(v.stock));
                  setEditing(v.id);
                }}
                title="Cliquer pour saisir le stock"
              >
                {busy === v.id ? <Loader2 size={12} className="animate-spin mx-auto" /> : v.stock}
              </button>
            )}
            <button className={btn} disabled={busy === v.id} onClick={() => send(v, 'delta', 1)} title="Ajouter 1">
              <Plus size={12} />
            </button>
          </div>
        );
      })}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
