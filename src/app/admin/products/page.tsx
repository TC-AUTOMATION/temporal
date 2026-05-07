'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAdminStore, AdminProduct } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Loader2,
  Ruler,
  WashingMachine,
  ExternalLink,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Crown,
  Link as LinkIcon,
  Upload,
  CheckCircle,
} from 'lucide-react';

// ==================== Image Browser Modal ====================
function ImageBrowserModal({
  isOpen,
  onClose,
  onSelect,
  currentImages,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: string[]) => void;
  currentImages: string[];
}) {
  const [availableImages, setAvailableImages] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState('clothes');
  const [customUrl, setCustomUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const paths = data.data?.uploaded || [];
        setUploadedFiles((prev) => [...prev, ...paths]);
        setSelectedImages((prev) => [...prev, ...paths]);
        // Also add to available images so they show in the grid
        setAvailableImages((prev) => ({
          ...prev,
          clothes: [...(prev.clothes || []), ...paths],
        }));
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedImages([]);
    setCustomUrl('');
    setUploadedFiles([]);
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/images');
        if (res.ok) {
          const data = await res.json();
          setAvailableImages(data.data || {});
        }
      } catch (err) {
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [isOpen]);

  const toggleImage = (img: string) => {
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const handleConfirm = () => {
    const all = [...selectedImages];
    if (customUrl.trim()) {
      all.push(customUrl.trim());
    }
    if (all.length > 0) {
      onSelect(all);
    }
    onClose();
  };

  if (!isOpen) return null;

  const folders = Object.keys(availableImages);
  const images = availableImages[activeFolder] || [];
  const filteredImages = images.filter((img) => !currentImages.includes(img));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-zinc-950 border border-zinc-700/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 rounded-t-2xl">
          <h3
            className="text-lg text-white"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            CHOISIR DES IMAGES
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload zone */}
        <div
          className={`mx-4 mt-4 mb-2 border-2 border-dashed rounded-xl transition-all ${
            dragOver
              ? 'border-primary bg-primary/10'
              : 'border-zinc-700 hover:border-zinc-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center gap-2 py-5 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-primary" />
                <span
                  className="text-sm text-primary"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  UPLOAD EN COURS...
                </span>
              </>
            ) : (
              <>
                <Upload size={28} className={dragOver ? 'text-primary' : 'text-zinc-500'} />
                <span
                  className="text-sm text-zinc-400"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  GLISSER DES PHOTOS ICI OU CLIQUER POUR PARCOURIR
                </span>
                <span className="text-[11px] text-zinc-600">
                  PNG, JPG, WEBP, GIF, SVG - Max 10MB par fichier
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/webp,image/png,image/jpeg,image/gif,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFileUpload(e.target.files);
                e.target.value = '';
              }}
              disabled={uploading}
            />
          </label>
          {uploadedFiles.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((f) => (
                <span key={f} className="flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                  <CheckCircle size={12} />
                  {f.split('/').pop()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Folder tabs */}
        <div className="flex border-b border-zinc-800 px-4 gap-1">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-5 py-2.5 text-sm rounded-t-lg transition-colors ${
                activeFolder === folder
                  ? 'bg-zinc-800 text-primary border-b-2 border-primary'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {folder.toUpperCase()} ({(availableImages[folder] || []).length})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                TOUTES LES IMAGES SONT DEJA UTILISEES
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredImages.map((img) => {
                const isSelected = selectedImages.includes(img);
                return (
                  <button
                    key={img}
                    onClick={() => toggleImage(img)}
                    className={`aspect-square relative border-2 rounded-lg transition-all overflow-hidden group ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 scale-[0.97]'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={img}
                      fill
                      className="object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {selectedImages.indexOf(img) + 1}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white/70 truncate">
                        {img.split('/').pop()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom URL input */}
        <div className="px-4 pb-3 border-t border-zinc-800 pt-3">
          <div className="flex gap-2 items-center">
            <LinkIcon size={16} className="text-zinc-500 flex-shrink-0" />
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Ou coller une URL personnalisee..."
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-900/50 rounded-b-2xl">
          <span className="text-sm text-zinc-400">
            {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selectionnee{selectedImages.length !== 1 ? 's' : ''}
            {customUrl.trim() ? ' + 1 URL' : ''}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              ANNULER
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedImages.length === 0 && !customUrl.trim()}
              className={`px-5 py-2 rounded-lg transition-all ${
                selectedImages.length > 0 || customUrl.trim()
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              AJOUTER ({selectedImages.length + (customUrl.trim() ? 1 : 0)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Image Manager Grid ====================
function ImageManagerGrid({
  images,
  onImagesChange,
}: {
  images: string[];
  onImagesChange: (images: string[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imageBrowserOpen, setImageBrowserOpen] = useState(false);

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return;
      const newImages = [...images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange]
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddImages = (newImages: string[]) => {
    onImagesChange([...images, ...newImages]);
  };

  const validImages = images.filter((img) => img.trim() !== '');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="text-xs text-zinc-400"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          IMAGES ({validImages.length})
        </label>
        <button
          type="button"
          onClick={() => setImageBrowserOpen(true)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary/60 hover:bg-primary/5"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
        >
          <Plus size={14} />
          AJOUTER
        </button>
      </div>

      {/* Image info banner */}
      {validImages.length > 0 && (
        <div className="p-2.5 border border-primary/20 bg-primary/5 rounded-lg">
          <p className="text-[11px] text-primary/80" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
            IMAGE 1 = IMAGE PRINCIPALE &bull; GLISSE-DEPOSE OU FLECHES POUR REORDONNER
          </p>
        </div>
      )}

      {/* Images Grid */}
      {validImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {validImages.map((img, index) => (
            <div
              key={`${img}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group/imgcard relative border-2 rounded-xl transition-all cursor-grab active:cursor-grabbing overflow-hidden ${
                draggedIndex === index
                  ? 'border-primary scale-[1.03] shadow-lg shadow-primary/30 z-10'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {/* Position badge */}
              <div
                className={`absolute top-1.5 left-1.5 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-primary text-white'
                    : 'bg-black/70 text-white/80 border border-zinc-600'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                {index + 1}
              </div>

              {/* Principal badge for first image */}
              {index === 0 && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-[10px]"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <Crown size={10} />
                    PRINCIPAL
                  </div>
                </div>
              )}

              {/* Drag handle */}
              {index !== 0 && (
                <div className="absolute top-1.5 right-1.5 z-10 p-0.5 text-white/30 group-hover/imgcard:text-white/60 transition-colors">
                  <GripVertical size={16} />
                </div>
              )}

              {/* Image thumbnail */}
              <div className="aspect-square relative bg-white/5 overflow-hidden">
                <Image
                  src={img}
                  alt={`Image ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity ${
                    draggedIndex === index ? 'opacity-80' : 'opacity-100'
                  }`}
                />
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between bg-zinc-900 border-t border-zinc-800">
                {/* Move arrows */}
                <div className="flex">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    disabled={index === 0}
                    className={`w-8 h-8 flex items-center justify-center transition-colors ${
                      index === 0
                        ? 'text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white hover:bg-primary/30'
                    }`}
                    title="Deplacer a gauche"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    disabled={index === validImages.length - 1}
                    className={`w-8 h-8 flex items-center justify-center transition-colors ${
                      index === validImages.length - 1
                        ? 'text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white hover:bg-primary/30'
                    }`}
                    title="Deplacer a droite"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* File name tooltip */}
              <div className="absolute bottom-9 left-0 right-0 px-1.5 opacity-0 group-hover/imgcard:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-zinc-900/90 border border-zinc-700 rounded px-2 py-1">
                  <p className="text-[9px] text-zinc-400 truncate">{img.split('/').pop()}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add more button (inline) */}
          <button
            type="button"
            onClick={() => setImageBrowserOpen(true)}
            className="aspect-square border-2 border-dashed border-zinc-700 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary/5 group/addbtn"
          >
            <Plus size={24} className="text-zinc-600 group-hover/addbtn:text-primary/60 transition-colors" />
            <span
              className="text-[10px] text-zinc-600 group-hover/addbtn:text-primary/60 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              AJOUTER
            </span>
          </button>
        </div>
      ) : (
        /* Empty state */
        <button
          type="button"
          onClick={() => setImageBrowserOpen(true)}
          className="w-full py-12 border-2 border-dashed border-zinc-700 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all hover:bg-primary/5 group/empty"
        >
          <ImageIcon size={36} className="text-zinc-600 group-hover/empty:text-primary/40 transition-colors" />
          <div className="text-center">
            <p
              className="text-sm text-zinc-500 group-hover/empty:text-primary/60 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              AUCUNE IMAGE
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Cliquez pour parcourir les images disponibles
            </p>
          </div>
        </button>
      )}

      {/* Preview section */}
      {validImages.length > 0 && (
        <div className="mt-4 p-3 border border-zinc-800 bg-zinc-900/50 rounded-xl">
          <p
            className="text-[10px] text-zinc-500 mb-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            APERCU PAGE PRODUIT
          </p>
          <div className="flex gap-2">
            {/* Main image preview */}
            <div className="w-24 h-24 relative border border-primary/30 rounded-lg flex-shrink-0 overflow-hidden">
              <Image
                src={validImages[0]}
                alt="Image principale"
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-1.5 overflow-x-auto">
              {validImages.slice(1).map((img, i) => (
                <div
                  key={`preview-${i}`}
                  className="w-12 h-12 relative border border-zinc-700 rounded-md flex-shrink-0 overflow-hidden"
                >
                  <Image src={img} alt={`Miniature ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Browser Modal */}
      <ImageBrowserModal
        isOpen={imageBrowserOpen}
        onClose={() => setImageBrowserOpen(false)}
        onSelect={handleAddImages}
        currentImages={validImages}
      />
    </div>
  );
}

// ==================== Main Products Page ====================
export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories, fetchProducts, fetchCategories, isLoading } = useAdminStore();
  const { darkMode, language } = useStore();

  const [sizeGuides, setSizeGuides] = useState<{ id: string; nameFr: string; nameEn: string }[]>([]);
  const [careGuides, setCareGuides] = useState<{ id: string; nameFr: string; nameEn: string }[]>([]);
  const [upsellProductIds, setUpsellProductIds] = useState<Set<string>>(new Set());

  // Fetch products, categories, and guides on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Fetch size guides
    fetch('/api/admin/size-guides', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.success) setSizeGuides(data.data); })
      .catch(console.error);
    // Fetch care guides
    fetch('/api/admin/care-guides', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.success) setCareGuides(data.data); })
      .catch(console.error);
    // Fetch upsells to know which products are upsells
    fetch('/api/admin/upsells', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const upsells = data?.data?.upsells || data?.data || [];
        if (Array.isArray(upsells)) {
          const ids = new Set<string>(upsells.map((u: any) => u.productId).filter(Boolean));
          setUpsellProductIds(ids);
        }
      })
      .catch(console.error);
  }, [fetchProducts, fetchCategories]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'vetements' | 'stickers' | 'upsells'>('vetements');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    nameEn: '',
    description: '',
    descriptionFr: '',
    descriptionEn: '',
    materials: '',
    materialsFr: '',
    materialsEn: '',
    careInstructions: '',
    careInstructionsFr: '',
    careInstructionsEn: '',
    price: 0,
    originalPrice: 0,
    category: 'tshirts',
    categoryFr: '',
    categoryEn: '',
    sku: '',
    isActive: true,
    isFeatured: false,
    isNew: true,
    sizes: [
      { name: 'S', stock: 0, available: true },
      { name: 'M', stock: 0, available: true },
      { name: 'L', stock: 0, available: true },
      { name: 'XL', stock: 0, available: true },
    ],
    colors: [{ name: 'Noir', hex: '#000000', available: true }],
    images: [] as string[],
    modelImages: [] as string[],
    modelInfo: '',
    modelInfoFr: '',
    modelInfoEn: '',
    sizeGuideId: '' as string,
    careGuideId: '' as string,
  });

  // Tab classifiers
  const isStickerProduct = (p: AdminProduct) =>
    p.category === 'stickers' ||
    p.sku.toUpperCase().includes('STICKER') ||
    p.name.toLowerCase().includes('sticker');
  const isUpsellProduct = (p: AdminProduct) => upsellProductIds.has(p.id);

  const tabCounts = {
    vetements: products.filter((p) => !isStickerProduct(p) && !isUpsellProduct(p)).length,
    stickers: products.filter(isStickerProduct).length,
    upsells: products.filter(isUpsellProduct).length,
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    let matchesTab = false;
    if (activeTab === 'stickers') matchesTab = isStickerProduct(p);
    else if (activeTab === 'upsells') matchesTab = isUpsellProduct(p);
    else matchesTab = !isStickerProduct(p) && !isUpsellProduct(p);
    return matchesSearch && matchesCategory && matchesTab;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameFr: '',
      nameEn: '',
      description: '',
      descriptionFr: '',
      descriptionEn: '',
      materials: '',
      materialsFr: '',
      materialsEn: '',
      careInstructions: '',
      careInstructionsFr: '',
      careInstructionsEn: '',
      price: 0,
      originalPrice: 0,
      category: 'tshirts',
      categoryFr: '',
      categoryEn: '',
      sku: `TPL-${Date.now().toString(36).toUpperCase()}`,
      isActive: true,
      isFeatured: false,
      isNew: true,
      sizes: [
        { name: 'S', stock: 0, available: true },
        { name: 'M', stock: 0, available: true },
        { name: 'L', stock: 0, available: true },
        { name: 'XL', stock: 0, available: true },
      ],
      colors: [{ name: 'Noir', hex: '#000000', available: true }],
      images: [],
      modelImages: [],
      modelInfo: '',
      modelInfoFr: '',
      modelInfoEn: '',
      sizeGuideId: '',
      careGuideId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameFr: product.nameFr || '',
      nameEn: product.nameEn || '',
      description: product.description,
      descriptionFr: product.descriptionFr || '',
      descriptionEn: product.descriptionEn || '',
      materials: (product as any).materials || '',
      materialsFr: (product as any).materialsFr || '',
      materialsEn: (product as any).materialsEn || '',
      careInstructions: (product as any).careInstructions || '',
      careInstructionsFr: (product as any).careInstructionsFr || '',
      careInstructionsEn: (product as any).careInstructionsEn || '',
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      categoryFr: product.categoryFr || '',
      categoryEn: product.categoryEn || '',
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNew: (product as any).isNew !== false,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images.filter((img) => img.trim() !== ''),
      modelImages: product.modelImages,
      modelInfo: product.modelInfo || '',
      modelInfoFr: product.modelInfoFr || '',
      modelInfoEn: product.modelInfoEn || '',
      sizeGuideId: product.sizeGuideId || '',
      careGuideId: product.careGuideId || '',
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    const cleanedFormData = {
      ...formData,
      images: formData.images.filter((img) => img.trim() !== ''),
    };
    setIsSaving(true);
    setSaveError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, cleanedFormData);
      } else {
        await addProduct(cleanedFormData);
      }
      setIsModalOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
  };

  const updateSize = (index: number, field: string, value: number | boolean) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    if (field === 'stock') {
      newSizes[index].available = (value as number) > 0;
    }
    setFormData({ ...formData, sizes: newSizes });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', hex: '#000000', available: true }],
    });
  };

  const updateColor = (index: number, field: string, value: string | boolean) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const tabsConfig: { key: 'vetements' | 'stickers' | 'upsells'; label: string; labelEn: string }[] = [
    { key: 'vetements', label: 'VETEMENTS', labelEn: 'CLOTHES' },
    { key: 'stickers', label: 'STICKERS', labelEn: 'STICKERS' },
    { key: 'upsells', label: 'UPSELLS', labelEn: 'UPSELLS' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className={`flex gap-1 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        {tabsConfig.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 -mb-px border-b-2 transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-primary text-primary'
                  : darkMode
                    ? 'border-transparent text-white/50 hover:text-white/80'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? tab.label : tab.labelEn}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? 'bg-primary/20 text-primary' : darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
              }`}>
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border focus:outline-none focus:border-primary ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-4 py-3 border focus:outline-none focus:border-primary ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <option value="all">{language === 'fr' ? 'TOUS' : 'ALL'}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          <Plus className="h-4 w-4" />
          {language === 'fr' ? 'NOUVEAU PRODUIT' : 'NEW PRODUCT'}
        </button>
      </div>

      {/* Products Grid - Same style as Shop but with dynamic admin data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`group ${!product.isActive ? 'opacity-50' : ''}`}>
            <div className="relative">
              {/* Image container - same as ProductCard */}
              <div className={`aspect-[3/4] relative overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                {/* Product image */}
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-8xl font-black ${darkMode ? 'text-white/5' : 'text-black/5'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        TPL
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

                {/* Featured star */}
                {product.isFeatured && (
                  <div className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-yellow-500 text-white">
                    <Star size={16} className="fill-current" />
                  </div>
                )}

                {/* Admin actions on hover */}
                <div className="absolute bottom-3 left-3 right-3 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 py-3 bg-white text-black flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      <Edit size={16} />
                      {language === 'fr' ? 'MODIFIER' : 'EDIT'}
                    </button>
                    <button
                      onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                      className="w-12 py-3 bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    >
                      {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="w-12 py-3 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.isActive ? (
                    <span
                      className="px-3 py-1 bg-primary text-white text-xs"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      ACTIVE
                    </span>
                  ) : (
                    <span
                      className="px-3 py-1 bg-gray-500 text-white text-xs"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      INACTIVE
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-xs ${product.totalStock > 10 ? 'bg-green-500' : product.totalStock > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    STOCK: {product.totalStock}
                  </span>
                  {product.images.length > 1 && (
                    <span
                      className="px-3 py-1 text-xs bg-white/20 text-white backdrop-blur-sm"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {product.images.length} IMG
                    </span>
                  )}
                </div>
              </div>

              {/* Product info - same as ProductCard */}
              <div className="pt-4 space-y-2">
                {/* Category */}
                <p
                  className={`text-xs uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/40'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.category}
                </p>

                {/* Name and price row */}
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-base uppercase leading-tight group-hover:text-primary transition-colors ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-lg flex-shrink-0 ${darkMode ? 'text-white' : 'text-black'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {product.price}€
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className={`text-sm line-through ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {product.originalPrice}€
                      </span>
                    )}
                  </div>
                </div>

                {/* SKU */}
                <p
                  className={`text-xs ${darkMode ? 'text-white/30' : 'text-black/30'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.sku}
                </p>

                {/* Colors */}
                <div className="flex items-center gap-1 pt-1">
                  {product.colors.slice(0, 4).map((color) => (
                    <div
                      key={color.name}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        darkMode ? 'border-white/20' : 'border-black/10'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className={`text-xs ml-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                      +{product.colors.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <div
          className={`text-center py-12 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          NO PRODUCT FOUND
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/50">
              <h2
                className="text-xl text-white"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {editingProduct ? (language === 'fr' ? 'MODIFIER LE PRODUIT' : 'EDIT PRODUCT') : (language === 'fr' ? 'NOUVEAU PRODUIT' : 'NEW PRODUCT')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs text-zinc-400 mb-1.5 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    NOM (ID)
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom interne du produit"
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-zinc-400 mb-1.5 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    SKU
                  </label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU"
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Bilingual Names */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium flex items-center gap-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  NOMS BILINGUES
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      NOM (FR)
                    </label>
                    <input
                      value={formData.nameFr}
                      onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                      placeholder="Nom en francais"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      NOM (EN)
                    </label>
                    <input
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="Name in English"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bilingual Descriptions */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  DESCRIPTION
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      DESCRIPTION (FR)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description en francais"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      DESCRIPTION (EN)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Description in English"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bilingual Materials */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  MATERIAUX
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      MATERIAUX (FR)
                    </label>
                    <textarea
                      value={formData.materials}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                      placeholder="100% Coton biologique"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      MATERIALS (EN)
                    </label>
                    <textarea
                      value={formData.materialsEn}
                      onChange={(e) => setFormData({ ...formData, materialsEn: e.target.value })}
                      placeholder="100% Organic Cotton"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bilingual Care Instructions */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  ENTRETIEN
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      ENTRETIEN (FR)
                    </label>
                    <textarea
                      value={formData.careInstructions}
                      onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                      placeholder="Lavage machine 30C"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      CARE (EN)
                    </label>
                    <textarea
                      value={formData.careInstructionsEn}
                      onChange={(e) => setFormData({ ...formData, careInstructionsEn: e.target.value })}
                      placeholder="Machine wash 30C"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm min-h-[72px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Linked Guides */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {language === 'fr' ? 'GUIDES LIES' : 'LINKED GUIDES'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      <Ruler size={11} />
                      {language === 'fr' ? 'GUIDE DES TAILLES' : 'SIZE GUIDE'}
                    </label>
                    <select
                      value={formData.sizeGuideId}
                      onChange={(e) => setFormData({ ...formData, sizeGuideId: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    >
                      <option value="" className="bg-zinc-900">{language === 'fr' ? '-- Aucun --' : '-- None --'}</option>
                      {sizeGuides.map((g) => (
                        <option key={g.id} value={g.id} className="bg-zinc-900">
                          {language === 'fr' ? g.nameFr : g.nameEn}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-3 mt-1.5">
                      {formData.sizeGuideId && (
                        <Link href="/admin/size-guides" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                          <ExternalLink size={10} /> {language === 'fr' ? 'MODIFIER' : 'EDIT'}
                        </Link>
                      )}
                      <Link href="/admin/size-guides" className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        <Plus size={10} /> {language === 'fr' ? 'CREER' : 'CREATE'}
                      </Link>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      <WashingMachine size={11} />
                      {language === 'fr' ? 'GUIDE DE LAVAGE' : 'CARE GUIDE'}
                    </label>
                    <select
                      value={formData.careGuideId}
                      onChange={(e) => setFormData({ ...formData, careGuideId: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    >
                      <option value="" className="bg-zinc-900">{language === 'fr' ? '-- Aucun --' : '-- None --'}</option>
                      {careGuides.map((g) => (
                        <option key={g.id} value={g.id} className="bg-zinc-900">
                          {language === 'fr' ? g.nameFr : g.nameEn}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-3 mt-1.5">
                      {formData.careGuideId && (
                        <Link href="/admin/care-guides" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                          <ExternalLink size={10} /> {language === 'fr' ? 'MODIFIER' : 'EDIT'}
                        </Link>
                      )}
                      <Link href="/admin/care-guides" className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        <Plus size={10} /> {language === 'fr' ? 'CREER' : 'CREATE'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    PRIX
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">EUR</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    ANCIEN PRIX
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">EUR</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    CATEGORIE
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-zinc-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visual Image Manager */}
              <ImageManagerGrid
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              />

              {/* Sizes & Stock */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  TAILLES & STOCK
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {formData.sizes.map((size, index) => (
                    <div key={size.name} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-medium text-zinc-300" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {size.name}
                      </span>
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-primary font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    COULEURS
                  </p>
                  <button
                    type="button"
                    onClick={addColor}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    <Plus className="h-3 w-3" />
                    AJOUTER
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border border-zinc-700 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <input
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        placeholder="Nom de la couleur"
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                      />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-8 h-8 bg-transparent cursor-pointer rounded"
                      />
                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Options - Modern toggle style */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { key: 'isActive', label: 'Actif', checked: formData.isActive },
                  { key: 'isFeatured', label: 'Vedette', checked: formData.isFeatured },
                  { key: 'isNew', label: 'Badge NEW', checked: formData.isNew },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, [opt.key]: !opt.checked })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                      opt.checked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <div className={`w-3 h-3 rounded-full transition-colors ${opt.checked ? 'bg-primary' : 'bg-zinc-700'}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 space-y-3">
              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {saveError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setIsModalOpen(false); setSaveError(null); }}
                  disabled={isSaving}
                  className="flex-1 py-3 border border-zinc-700 rounded-xl text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-50"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-primary rounded-xl text-white font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'SAUVEGARDE...' : editingProduct ? 'SAUVEGARDER' : 'CREER'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2
              className="text-xl mb-3 text-white"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              SUPPRIMER LE PRODUIT ?
            </h2>
            <p className="text-zinc-400 mb-6 text-sm">
              Cette action est irreversible. Le produit sera definitivement supprime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                ANNULER
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                SUPPRIMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
