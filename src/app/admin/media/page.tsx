'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/stores/useStore';
import {
  Loader2,
  Trash2,
  Upload,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  RefreshCw,
  Replace,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';

interface ImageUser {
  type: string;
  id: string;
  label: string;
}

interface MediaImage {
  url: string;
  folder: string;
  name: string;
  size: number;
  modified: string;
  usedBy: ImageUser[];
  orphan: boolean;
}

interface MediaStats {
  total: number;
  used: number;
  orphan: number;
  totalSize: number;
}

type FilterMode = 'all' | 'used' | 'orphan';

const USER_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  product: { fr: 'Produit', en: 'Product' },
  pack: { fr: 'Pack', en: 'Pack' },
  popup: { fr: 'Popup', en: 'Popup' },
  upsell: { fr: 'Upsell', en: 'Upsell' },
  category: { fr: 'Catégorie', en: 'Category' },
  contest: { fr: 'Concours', en: 'Contest' },
  setting: { fr: 'Réglage', en: 'Setting' },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function MediaPage() {
  const { darkMode, language } = useStore();
  const t = (fr: string, en: string) => (language === 'fr' ? fr : en);

  const [images, setImages] = useState<MediaImage[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [folderFilter, setFolderFilter] = useState<'all' | 'clothes' | 'stickers'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [detail, setDetail] = useState<MediaImage | null>(null);

  const card = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const subText = darkMode ? 'text-white/50' : 'text-gray-500';

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/images/manage');
      const data = await res.json();
      if (res.ok && data.success) {
        setImages(data.data.images);
        setStats(data.data.stats);
        setSelected(new Set());
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filtered = useMemo(() => {
    return images.filter((img) => {
      if (filter === 'used' && img.orphan) return false;
      if (filter === 'orphan' && !img.orphan) return false;
      if (folderFilter !== 'all' && img.folder !== folderFilter) return false;
      if (search && !img.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [images, filter, folderFilter, search]);

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(filtered.map((i) => i.url)));
  };
  const selectOrphans = () => {
    setSelected(new Set(images.filter((i) => i.orphan).map((i) => i.url)));
  };
  const clearSelection = () => setSelected(new Set());

  const handleDelete = async (urls: string[]) => {
    if (urls.length === 0) return;
    const usedCount = urls.filter((u) => {
      const img = images.find((i) => i.url === u);
      return img && !img.orphan;
    }).length;

    let message = t(
      `Supprimer définitivement ${urls.length} image(s) du site ? Cette action est irréversible.`,
      `Permanently delete ${urls.length} image(s) from the site? This cannot be undone.`
    );
    if (usedCount > 0) {
      message += t(
        `\n\n⚠️ ${usedCount} de ces image(s) sont ENCORE UTILISÉES. Les supprimer cassera leur affichage sur le site.`,
        `\n\n⚠️ ${usedCount} of these image(s) are STILL IN USE. Deleting them will break their display on the site.`
      );
    }
    if (!confirm(message)) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/images/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data.failed?.length > 0) {
          alert(
            t('Certaines images n\'ont pas pu être supprimées : ', 'Some images could not be deleted: ') +
              data.data.failed.map((f: { url: string }) => f.url).join(', ')
          );
        }
        setDetail(null);
        await fetchImages();
      } else {
        alert(data.error || t('Erreur lors de la suppression', 'Delete error'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(t('Erreur lors de la suppression', 'Delete error'));
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const res = await fetch('/api/admin/images/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchImages();
      } else {
        alert(data.error || t("Erreur lors de l'upload", 'Upload error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(t("Erreur lors de l'upload", 'Upload error'));
    } finally {
      setUploading(false);
    }
  };

  // Replace an image everywhere: upload new file, then PATCH all references.
  const handleReplace = async (target: MediaImage, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const upRes = await fetch('/api/admin/images/upload', { method: 'POST', body: formData });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success || !upData.data?.uploaded?.[0]) {
        alert(upData.error || t("Erreur lors de l'upload", 'Upload error'));
        return;
      }
      const newUrl = upData.data.uploaded[0];

      const patchRes = await fetch('/api/admin/images/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: target.url, to: newUrl, deleteOld: true }),
      });
      const patchData = await patchRes.json();
      if (patchRes.ok && patchData.success) {
        alert(
          t(
            `Image remplacée dans ${patchData.data.updated} emplacement(s).`,
            `Image replaced in ${patchData.data.updated} location(s).`
          )
        );
        setDetail(null);
        await fetchImages();
      } else {
        alert(patchData.error || t('Erreur lors du remplacement', 'Replace error'));
      }
    } catch (err) {
      console.error('Replace error:', err);
      alert(t('Erreur lors du remplacement', 'Replace error'));
    } finally {
      setUploading(false);
    }
  };

  // Compress images (resize + WebP). Migrates png/jpg to webp and updates refs.
  const handleOptimize = async (payload: { urls?: string[]; all?: boolean }) => {
    const count = payload.all ? (stats?.total ?? 0) : payload.urls?.length ?? 0;
    const confirmMsg = payload.all
      ? t(
          `Optimiser TOUTES les images (${count}) ? Les PNG/JPG lourds seront convertis en WebP et les images redimensionnées. Cette opération peut prendre un moment.`,
          `Optimize ALL images (${count})? Heavy PNG/JPG files will be converted to WebP and images resized. This may take a while.`
        )
      : t(
          `Optimiser ${count} image(s) sélectionnée(s) ?`,
          `Optimize ${count} selected image(s)?`
        );
    if (!confirm(confirmMsg)) return;

    setOptimizing(true);
    try {
      const res = await fetch('/api/admin/images/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const savedMo = (data.data.saved / (1024 * 1024)).toFixed(1);
        alert(
          t(
            `${data.data.optimized} image(s) optimisée(s), ${data.data.skipped} ignorée(s). ${savedMo} Mo économisés.`,
            `${data.data.optimized} image(s) optimized, ${data.data.skipped} skipped. ${savedMo} MB saved.`
          )
        );
        setDetail(null);
        await fetchImages();
      } else {
        alert(data.error || t("Erreur lors de l'optimisation", 'Optimize error'));
      }
    } catch (err) {
      console.error('Optimize error:', err);
      alert(t("Erreur lors de l'optimisation", 'Optimize error'));
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {t('GESTION DES IMAGES', 'MEDIA LIBRARY')}
          </h2>
          <p className={`text-sm ${subText}`}>
            {t(
              'Voir, remplacer et supprimer définitivement toutes les photos du site',
              'View, replace and permanently delete all the site photos'
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOptimize({ all: true })}
            disabled={optimizing || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {optimizing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            <span className="text-sm">{t('Optimiser tout', 'Optimize all')}</span>
          </button>
          <button
            onClick={fetchImages}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${card} hover:border-primary/50`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm">{t('Actualiser', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('Total', 'Total'), value: stats.total, color: 'text-primary' },
            { label: t('Utilisées', 'In use'), value: stats.used, color: 'text-green-500' },
            { label: t('Orphelines', 'Orphans'), value: stats.orphan, color: 'text-amber-500' },
            { label: t('Poids total', 'Total size'), value: formatSize(stats.totalSize), color: '' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${card}`}>
              <p className={`text-xs uppercase tracking-wider ${subText}`}>{s.label}</p>
              <p className={`text-2xl mt-1 ${s.color}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl transition-all ${
          dragOver ? 'border-primary bg-primary/10' : darkMode ? 'border-zinc-700' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
        }}
      >
        <label className="flex flex-col items-center gap-2 py-6 cursor-pointer">
          {uploading ? (
            <Loader2 size={28} className="animate-spin text-primary" />
          ) : (
            <Upload size={28} className={dragOver ? 'text-primary' : subText} />
          )}
          <span className="text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {uploading
              ? t('UPLOAD EN COURS...', 'UPLOADING...')
              : t('GLISSER DES PHOTOS ICI OU CLIQUER', 'DROP PHOTOS HERE OR CLICK')}
          </span>
          <span className={`text-[11px] ${subText}`}>PNG, JPG, WEBP, GIF, SVG — max 25MB</span>
          <input
            type="file"
            accept="image/webp,image/png,image/jpeg,image/gif,image/svg+xml"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className={`flex rounded-xl border overflow-hidden ${card}`}>
          {(['all', 'used', 'orphan'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === f ? 'bg-primary text-white' : darkMode ? 'text-white/60 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}
            >
              {f === 'all' ? t('TOUTES', 'ALL') : f === 'used' ? t('UTILISÉES', 'IN USE') : t('ORPHELINES', 'ORPHANS')}
            </button>
          ))}
        </div>

        {/* Folder filter */}
        <div className={`flex rounded-xl border overflow-hidden ${card}`}>
          {(['all', 'clothes', 'stickers'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFolderFilter(f)}
              className={`px-4 py-2 text-sm transition-colors ${
                folderFilter === f ? 'bg-primary text-white' : darkMode ? 'text-white/60 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}
            >
              {f === 'all' ? t('TOUS', 'ALL') : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${card}`}>
          <Search size={16} className={subText} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Rechercher...', 'Search...')}
            className="bg-transparent border-none outline-none text-sm w-40"
          />
        </div>

        <div className="flex-1" />

        {/* Selection actions */}
        <button
          onClick={selectOrphans}
          disabled={!stats || stats.orphan === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors disabled:opacity-40 ${card} hover:border-amber-500/50`}
        >
          <CheckSquare size={16} className="text-amber-500" />
          {t('Sélectionner orphelines', 'Select orphans')}
        </button>
        <button
          onClick={selected.size === filtered.length && filtered.length > 0 ? clearSelection : selectAllVisible}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors ${card} hover:border-primary/50`}
        >
          {selected.size === filtered.length && filtered.length > 0 ? <Square size={16} /> : <CheckSquare size={16} />}
          {selected.size === filtered.length && filtered.length > 0 ? t('Désélectionner', 'Deselect') : t('Tout sélectionner', 'Select all')}
        </button>
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
          <span className="text-sm">
            {selected.size} {t('image(s) sélectionnée(s)', 'image(s) selected')}
          </span>
          <div className="flex gap-3">
            <button onClick={clearSelection} className="text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              {t('Annuler', 'Cancel')}
            </button>
            <button
              onClick={() => handleOptimize({ urls: Array.from(selected) })}
              disabled={optimizing}
              className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {optimizing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {t('Optimiser', 'Optimize')}
            </button>
            <button
              onClick={() => handleDelete(Array.from(selected))}
              disabled={deleting}
              className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {t('Supprimer définitivement', 'Delete permanently')}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${subText}`}>
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {t('AUCUNE IMAGE', 'NO IMAGES')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((img) => {
            const isSelected = selected.has(img.url);
            return (
              <div
                key={img.url}
                className={`group relative rounded-xl border overflow-hidden transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/30' : darkMode ? 'border-zinc-800' : 'border-gray-200'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(img.url)}
                  className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-white/70" />}
                </button>

                {/* Usage badge */}
                <span
                  className={`absolute top-2 right-2 z-10 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    img.orphan ? 'bg-amber-500/90 text-black' : 'bg-green-500/90 text-black'
                  }`}
                >
                  {img.orphan ? t('Orpheline', 'Orphan') : `${img.usedBy.length}×`}
                </span>

                {/* Image */}
                <button onClick={() => setDetail(img)} className="block w-full aspect-square relative bg-zinc-800">
                  <Image src={img.url} alt={img.name} fill className="object-cover" sizes="200px" unoptimized />
                </button>

                {/* Footer */}
                <div className={`px-2 py-1.5 ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                  <p className="text-[11px] truncate" title={img.name}>
                    {img.name}
                  </p>
                  <p className={`text-[10px] ${subText}`}>{formatSize(img.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <ImageDetailModal
          image={detail}
          darkMode={darkMode}
          t={t}
          onClose={() => setDetail(null)}
          onDelete={() => handleDelete([detail.url])}
          onReplace={(file) => handleReplace(detail, file)}
          onOptimize={() => handleOptimize({ urls: [detail.url] })}
          busy={deleting || uploading || optimizing}
        />
      )}
    </div>
  );
}

// ==================== Detail modal ====================
function ImageDetailModal({
  image,
  darkMode,
  t,
  onClose,
  onDelete,
  onReplace,
  onOptimize,
  busy,
}: {
  image: MediaImage;
  darkMode: boolean;
  t: (fr: string, en: string) => string;
  onClose: () => void;
  onDelete: () => void;
  onReplace: (file: File) => void;
  onOptimize: () => void;
  busy: boolean;
}) {
  const panel = darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const subText = darkMode ? 'text-white/50' : 'text-gray-500';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className={`rounded-2xl border w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl ${panel}`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
          <h3 className="text-lg truncate" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}>
            {image.name}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="relative w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden">
            <Image src={image.url} alt={image.name} fill className="object-contain" sizes="600px" unoptimized />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className={`text-xs ${subText}`}>{t('Dossier', 'Folder')}</p>
              <p>{image.folder}</p>
            </div>
            <div>
              <p className={`text-xs ${subText}`}>{t('Taille', 'Size')}</p>
              <p>{formatSize(image.size)}</p>
            </div>
            <div className="col-span-2">
              <p className={`text-xs ${subText}`}>{t('Chemin', 'Path')}</p>
              <p className="font-mono text-xs break-all">{image.url}</p>
            </div>
          </div>

          {/* Usage */}
          <div>
            <p className={`text-xs mb-2 ${subText}`}>{t('Utilisée par', 'Used by')}</p>
            {image.orphan ? (
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertTriangle size={16} />
                {t('Aucune utilisation — vieille photo / orpheline', 'Not used anywhere — old / orphan photo')}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {image.usedBy.map((u) => (
                  <span
                    key={`${u.type}-${u.id}`}
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-green-500/15 text-green-500"
                  >
                    <CheckCircle size={12} />
                    {USER_TYPE_LABELS[u.type]?.[t('fr', 'en') as 'fr' | 'en'] || u.type}: {u.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center justify-between gap-3 p-4 border-t ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 cursor-pointer transition-colors text-sm">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Replace size={16} />}
            {t('Remplacer partout', 'Replace everywhere')}
            <input
              type="file"
              accept="image/webp,image/png,image/jpeg,image/gif,image/svg+xml"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                if (e.target.files?.[0]) onReplace(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </label>
          <button
            onClick={onOptimize}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors text-sm disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {t('Optimiser', 'Optimize')}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {t('Supprimer définitivement', 'Delete permanently')}
          </button>
        </div>
      </div>
    </div>
  );
}
