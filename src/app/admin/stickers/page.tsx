'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/stores/useStore';
import { ArrowUp, ArrowDown, GripVertical, Save, Loader2, RotateCcw } from 'lucide-react';

interface Sticker {
  id: string;
  name: string;
  images: string[];
  sortOrder: number;
}

export default function StickersOrderPage() {
  const { darkMode } = useStore();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch stickers
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const response = await fetch('/api/products?category=accessoires');
        if (response.ok) {
          const data = await response.json();
          const stickerProducts = (data.data?.products || [])
            .filter((p: any) => p.name.toLowerCase().includes('sticker'))
            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setStickers(stickerProducts);
        }
      } catch (err) {
        console.error('Error fetching stickers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStickers();
  }, []);

  const moveSticker = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= stickers.length) return;

    const newStickers = [...stickers];
    const [moved] = newStickers.splice(fromIndex, 1);
    newStickers.splice(toIndex, 0, moved);

    // Update sortOrder
    newStickers.forEach((s, i) => {
      s.sortOrder = i + 1;
    });

    setStickers(newStickers);
    setHasChanges(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveSticker(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/stickers/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: stickers.map((s, i) => ({ id: s.id, sortOrder: i + 1 }))
        }),
      });

      if (response.ok) {
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error saving order:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetOrder = () => {
    const sorted = [...stickers].sort((a, b) => a.id.localeCompare(b.id));
    sorted.forEach((s, i) => {
      s.sortOrder = i + 1;
    });
    setStickers(sorted);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            ORDRE DES STICKERS
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
            Glisse-dépose ou utilise les flèches pour réorganiser l'ordre d'affichage sur la page d'accueil
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetOrder}
            className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
              darkMode ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <RotateCcw size={16} />
            RESET
          </button>

          <button
            onClick={saveOrder}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-6 py-2 transition-colors ${
              hasChanges
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-primary/30 text-white/50 cursor-not-allowed'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            SAUVEGARDER
          </button>
        </div>
      </div>

      {/* Preview info */}
      <div className={`p-4 border ${darkMode ? 'border-primary/30 bg-primary/10' : 'border-primary/30 bg-primary/5'}`}>
        <p
          className="text-primary text-sm"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          PRÉVISUALISATION : GRILLE 3x2
        </p>
        <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
          Ligne du haut : positions 1-3 • Ligne du bas : positions 4-6
        </p>
      </div>

      {/* Grid Preview */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {stickers.map((sticker, index) => (
          <div
            key={sticker.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative border-2 transition-all cursor-grab active:cursor-grabbing ${
              draggedIndex === index
                ? 'border-primary scale-105 shadow-lg shadow-primary/30'
                : darkMode
                  ? 'border-white/10 hover:border-white/30'
                  : 'border-black/10 hover:border-black/30'
            }`}
          >
            {/* Position badge */}
            <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-primary text-white flex items-center justify-center text-lg font-bold"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {index + 1}
            </div>

            {/* Drag handle */}
            <div className={`absolute top-2 right-2 z-10 p-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
              <GripVertical size={20} />
            </div>

            {/* Image */}
            <div className={`aspect-square relative ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              {sticker.images[0] ? (
                <Image
                  src={sticker.images[0]}
                  alt={sticker.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl ${darkMode ? 'text-white/10' : 'text-black/10'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    TPL
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={`p-3 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <p
                className="text-sm truncate"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {sticker.name.replace('Sticker Temporal - ', '')}
              </p>
            </div>

            {/* Move buttons */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveSticker(index, index - 1)}
                disabled={index === 0}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  index === 0
                    ? 'bg-white/20 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-primary hover:text-white'
                }`}
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveSticker(index, index + 1)}
                disabled={index === stickers.length - 1}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  index === stickers.length - 1
                    ? 'bg-white/20 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-primary hover:text-white'
                }`}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      {hasChanges && (
        <div className={`text-center p-4 border ${darkMode ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
          <p className="text-yellow-500 text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            ⚠️ MODIFICATIONS NON SAUVEGARDÉES
          </p>
        </div>
      )}
    </div>
  );
}
