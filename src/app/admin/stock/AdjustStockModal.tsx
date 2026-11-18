'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Minus, Plus, Loader2 } from 'lucide-react';

export interface AdjustableVariant {
  variantId: string;
  productId: string;
  productName: string;
  color: string;
  size: string;
  stock: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  variants: AdjustableVariant[];
  initialVariantId?: string | null;
  darkMode: boolean;
}

const bebas = { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' };

export default function AdjustStockModal({ open, onClose, onDone, variants, initialVariantId, darkMode }: Props) {
  const products = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variants) map.set(v.productId, v.productName);
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [variants]);

  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [mode, setMode] = useState<'delta' | 'set'>('delta');
  const [value, setValue] = useState(1);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initial = variants.find((v) => v.variantId === initialVariantId);
    setProductId(initial?.productId || '');
    setVariantId(initial?.variantId || '');
    setMode('delta');
    setValue(1);
    setNote('');
    setError(null);
  }, [open, initialVariantId, variants]);

  const productVariants = variants.filter((v) => v.productId === productId);
  const selected = variants.find((v) => v.variantId === variantId);
  const delta = selected ? (mode === 'set' ? value - selected.stock : value) : 0;
  const newStock = selected ? selected.stock + delta : 0;

  if (!open) return null;

  const submit = async () => {
    if (!selected || delta === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, mode, value, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erreur');
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const input = `w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:border-primary ${
    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
  }`;
  const label = `block text-xs mb-1.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl border p-5 space-y-4 ${darkMode ? 'bg-neutral-900 border-white/10' : 'bg-white border-gray-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={bebas}>
            AJUSTEMENT MANUEL DU STOCK
          </h3>
          <button onClick={onClose} className={darkMode ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-900'}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label className={label}>Produit</label>
          <select
            className={input}
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId('');
            }}
          >
            <option value="">— Choisir —</option>
            {products.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Couleur / taille</label>
          <select className={input} value={variantId} onChange={(e) => setVariantId(e.target.value)} disabled={!productId}>
            <option value="">— Choisir —</option>
            {productVariants.map((v) => (
              <option key={v.variantId} value={v.variantId}>
                {v.color} · {v.size} (stock : {v.stock})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {(['delta', 'set'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setValue(m === 'set' ? selected?.stock ?? 0 : 1);
              }}
              className={`flex-1 py-2 rounded-xl border text-sm ${
                mode === m
                  ? 'bg-primary text-white border-primary'
                  : darkMode
                    ? 'bg-white/5 border-white/10 text-white/60'
                    : 'bg-white border-gray-200 text-gray-600'
              }`}
              style={bebas}
            >
              {m === 'delta' ? 'AJOUTER / RETIRER' : 'DÉFINIR LE STOCK À'}
            </button>
          ))}
        </div>

        <div>
          <label className={label}>{mode === 'delta' ? 'Quantité (+ pour ajouter, − pour retirer)' : 'Nouveau stock'}</label>
          <div className="flex items-center gap-2">
            {mode === 'delta' && (
              <>
                <button className={`px-2.5 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-700'}`} onClick={() => setValue((v) => v - 5)}>−5</button>
                <button className={`p-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-700'}`} onClick={() => setValue((v) => v - 1)}><Minus size={16} /></button>
              </>
            )}
            <input
              type="number"
              className={`${input} text-center`}
              value={value}
              onChange={(e) => setValue(Math.trunc(Number(e.target.value) || 0))}
            />
            {mode === 'delta' && (
              <>
                <button className={`p-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-700'}`} onClick={() => setValue((v) => v + 1)}><Plus size={16} /></button>
                <button className={`px-2.5 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-700'}`} onClick={() => setValue((v) => v + 5)}>+5</button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className={label}>Note (optionnel)</label>
          <input
            className={input}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : réassort fournisseur, vente en main propre, article abîmé…"
            maxLength={500}
          />
        </div>

        {selected && (
          <div className={`rounded-xl p-3 text-sm flex items-center justify-between ${darkMode ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-600'}`}>
            <span>
              {selected.stock} → <strong className={newStock < 0 ? 'text-red-400' : darkMode ? 'text-white' : 'text-gray-900'}>{newStock}</strong>
            </span>
            <span className={`font-bold ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : ''}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={submit}
          disabled={!selected || delta === 0 || newStock < 0 || saving}
          className="w-full py-3 rounded-xl bg-primary text-white disabled:opacity-40 flex items-center justify-center gap-2"
          style={bebas}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          ENREGISTRER
        </button>
      </div>
    </div>
  );
}
