'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit, Trash2, Eye, EyeOff, X, Check, Search, Loader2, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';

// Types matching the backend API response
interface PackItemProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface PackItem {
  id: string;
  productId: string;
  quantity: number;
  product: PackItemProduct;
}

interface APIPack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: PackItem[];
  originalPrice: number;
  discount: number;
  discountPercent: number;
}

interface APIProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  sku: string;
  isActive: boolean;
}

interface FormItem {
  productId: string;
  quantity: number;
}

export default function PacksPage() {
  const { darkMode, language } = useStore();

  const [packs, setPacks] = useState<APIPack[]>([]);
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<APIPack | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchProduct, setSearchProduct] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    images: [] as string[],
    items: [] as FormItem[],
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);

  // Translations
  const t = {
    title: 'PACKS',
    subtitle: language === 'fr' ? 'Créez des lots de produits avec des réductions exclusives' : 'Create product bundles with exclusive discounts',
    activePacks: language === 'fr' ? 'packs actifs sur' : 'active packs out of',
    newPack: language === 'fr' ? 'Nouveau pack' : 'New pack',
    editPack: language === 'fr' ? 'Modifier le pack' : 'Edit pack',
    createPack: language === 'fr' ? 'Créer un pack' : 'Create pack',
    name: language === 'fr' ? 'Nom' : 'Name',
    slug: 'Slug',
    description: 'Description',
    price: language === 'fr' ? 'Prix du pack' : 'Pack price',
    products: language === 'fr' ? 'Produits' : 'Products',
    searchProducts: language === 'fr' ? 'Rechercher un produit...' : 'Search product...',
    addProduct: language === 'fr' ? 'Ajouter' : 'Add',
    selectedProducts: language === 'fr' ? 'Produits sélectionnés' : 'Selected products',
    noProducts: language === 'fr' ? 'Aucun produit sélectionné' : 'No products selected',
    activate: language === 'fr' ? 'Activer immédiatement' : 'Activate immediately',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    create: language === 'fr' ? 'Créer' : 'Create',
    edit: language === 'fr' ? 'Modifier' : 'Edit',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
    deleteTitle: language === 'fr' ? 'Supprimer ce pack ?' : 'Delete this pack?',
    deleteWarning: language === 'fr' ? 'Cette action est irréversible.' : 'This action is irreversible.',
    noPacks: language === 'fr' ? 'Aucun pack créé. Créez votre premier pack !' : 'No packs created. Create your first pack!',
    active: language === 'fr' ? 'Actif' : 'Active',
    inactive: language === 'fr' ? 'Inactif' : 'Inactive',
    originalPrice: language === 'fr' ? 'Prix original' : 'Original price',
    packPrice: language === 'fr' ? 'Prix pack' : 'Pack price',
    savings: language === 'fr' ? 'Économie' : 'Savings',
    qty: language === 'fr' ? 'Qté' : 'Qty',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    errorLoading: language === 'fr' ? 'Erreur lors du chargement' : 'Error loading data',
  };

  // Fetch packs from API
  const fetchPacks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/packs');
      if (!res.ok) throw new Error('Failed to fetch packs');
      const json = await res.json();
      // Normalize Decimal fields to numbers
      const normalized = (json.data?.packs || []).map((p: Record<string, unknown>) => ({
        ...p,
        price: Number(p.price),
        originalPrice: Number(p.originalPrice),
        discount: Number(p.discount),
        items: ((p.items as Record<string, unknown>[]) || []).map((item: Record<string, unknown>) => ({
          ...item,
          product: {
            ...(item.product as Record<string, unknown>),
            price: Number((item.product as Record<string, unknown>).price),
          },
        })),
      }));
      setPacks(normalized);
    } catch (err) {
      console.error('Failed to fetch packs:', err);
      setError(t.errorLoading);
    }
  }, [t.errorLoading]);

  // Fetch products for the product picker
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?active=all&limit=200');
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      const prods = (json.data?.products || []).map((p: Record<string, unknown>) => ({
        ...p,
        price: Number(p.price),
      }));
      setProducts(prods);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchPacks(), fetchProducts()]).finally(() => setLoading(false));
  }, [fetchPacks, fetchProducts]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      images: [],
      items: [],
      isActive: true,
    });
    setSearchProduct('');
  };

  const openCreateModal = () => {
    setEditingPack(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (pack: APIPack) => {
    setEditingPack(pack);
    // Hydrate images: prefer images array, fallback to legacy single image
    const hydratedImages =
      pack.images && pack.images.length > 0
        ? pack.images
        : pack.image
          ? [pack.image]
          : [];
    setFormData({
      name: pack.name,
      slug: pack.slug,
      description: pack.description || '',
      price: pack.price,
      images: hydratedImages,
      items: pack.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      isActive: pack.isActive,
    });
    setIsModalOpen(true);
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) fd.append('files', files[i]);
      const res = await fetch('/api/admin/images/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const json = await res.json();
      const uploaded: string[] = json?.data?.uploaded || [];
      if (uploaded.length === 0) throw new Error('No images uploaded');
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploaded].slice(0, 10) }));
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImageAt = (idx: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setFormData((prev) => {
      const next = [...prev.images];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, images: next };
    });
  };

  const handleSave = async () => {
    if (!formData.name || formData.items.length === 0 || formData.price <= 0) return;

    setSaving(true);
    setError(null);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      const payload = {
        name: formData.name,
        slug,
        description: formData.description || undefined,
        price: formData.price,
        images: formData.images,
        isActive: formData.isActive,
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      let res: Response;
      if (editingPack) {
        res = await fetch(`/api/admin/packs/${editingPack.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to save pack');
      }

      await fetchPacks();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save pack:', err);
      setError(err instanceof Error ? err.message : 'Failed to save pack');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/packs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete pack');
      await fetchPacks();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete pack:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete pack');
    }
  };

  const handleToggleActive = async (pack: APIPack) => {
    try {
      const res = await fetch(`/api/admin/packs/${pack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pack.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update pack');
      await fetchPacks();
    } catch (err) {
      console.error('Failed to toggle pack active:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pack');
    }
  };

  const addProductToPack = (productId: string) => {
    if (formData.items.some((p) => p.productId === productId)) return;
    setFormData({
      ...formData,
      items: [...formData.items, { productId, quantity: 1 }],
    });
    setSearchProduct('');
  };

  const removeProductFromPack = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((p) => p.productId !== productId),
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData({
      ...formData,
      items: formData.items.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      ),
    });
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  // Calculate original price from selected items (for the form preview)
  const calculateOriginalPrice = (items: FormItem[]) => {
    return items.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className={`ml-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-400 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Package className="text-primary" size={24} />
          </div>
          <div>
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.title}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
            {packs.filter((p) => p.isActive).length} {t.activePacks} {packs.length}
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <Plus size={18} />
            {t.newPack}
          </button>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const originalPrice = pack.originalPrice;
          const packPrice = pack.price;
          const savings = pack.discount;

          return (
            <div
              key={pack.id}
              className={`rounded-2xl border overflow-hidden ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              } ${!pack.isActive ? 'opacity-60' : ''}`}
            >
              {/* Pack Header */}
              <div className={`p-4 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-lg font-medium"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {pack.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      pack.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {pack.isActive ? t.active : t.inactive}
                  </span>
                </div>
                {pack.description && (
                  <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {pack.description}
                  </p>
                )}
                <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  /{pack.slug}
                </p>
              </div>

              {/* Pack Products */}
              <div className="p-4 space-y-2">
                {pack.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      darkMode ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                  >
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.product.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {item.product.price.toFixed(2)}&euro; &times; {item.quantity}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(item.product.price * item.quantity).toFixed(2)}&euro;
                    </span>
                  </div>
                ))}
              </div>

              {/* Pack Pricing */}
              <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.originalPrice}</span>
                    <span className={`line-through ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {originalPrice.toFixed(2)}&euro;
                    </span>
                  </div>
                  {pack.discountPercent > 0 && (
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>
                        {language === 'fr' ? 'Réduction' : 'Discount'}
                      </span>
                      <span className="text-green-400">
                        -{pack.discountPercent}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{t.packPrice}</span>
                    <span className="text-primary">{packPrice.toFixed(2)}&euro;</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs text-green-400 text-right">
                      {t.savings}: {savings.toFixed(2)}&euro;
                    </p>
                  )}
                </div>
              </div>

              {/* Pack Actions */}
              <div className={`flex gap-2 p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <button
                  onClick={() => openEditModal(pack)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Edit size={16} />
                  {t.edit}
                </button>
                <button
                  onClick={() => handleToggleActive(pack)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pack.isActive
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {pack.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(pack.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {packs.length === 0 && (
        <div className={`text-center py-16 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
          <Package size={64} className="mx-auto mb-4 opacity-50" />
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {t.noPacks}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl ${
              darkMode ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h2
                className="text-xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {editingPack ? t.editPack : t.createPack}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Name and Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.name} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: editingPack ? formData.slug : generateSlug(name),
                      });
                    }}
                    placeholder={language === 'fr' ? 'Ex: Pack Essentiel' : 'Ex: Essential Pack'}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.slug} *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="pack-essentiel"
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  {t.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'fr' ? 'Description du pack...' : 'Pack description...'}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Images (multi-upload) */}
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  {language === 'fr' ? 'Images' : 'Images'} ({formData.images.length}/10)
                </label>
                <label
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    darkMode
                      ? 'border-white/20 hover:border-primary/60 bg-white/5'
                      : 'border-gray-300 hover:border-primary/60 bg-gray-50'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">{language === 'fr' ? 'Téléchargement...' : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span className="text-sm">
                        {language === 'fr' ? 'Cliquez pour ajouter des images' : 'Click to add images'}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleUploadImages(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    disabled={uploading || formData.images.length >= 10}
                  />
                </label>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group">
                        <img src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            disabled={idx === formData.images.length - 1}
                            className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-primary text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {language === 'fr' ? 'PRINCIPALE' : 'MAIN'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Selection */}
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  {t.products} *
                </label>
                <div className="relative mb-3">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} size={18} />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder={t.searchProducts}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Product Search Results */}
                {searchProduct && (
                  <div className={`mb-4 rounded-lg border max-h-48 overflow-y-auto ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    {filteredProducts.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProductToPack(product.id)}
                        disabled={formData.items.some((p) => p.productId === product.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          formData.items.some((p) => p.productId === product.id)
                            ? 'opacity-50 cursor-not-allowed'
                            : darkMode
                              ? 'hover:bg-white/10'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        {product.images[0] && (
                          <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{product.price.toFixed(2)}&euro;</p>
                        </div>
                        {formData.items.some((p) => p.productId === product.id) ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Plus size={18} className="text-primary" />
                        )}
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className={`p-3 text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {language === 'fr' ? 'Aucun produit trouvé' : 'No products found'}
                      </p>
                    )}
                  </div>
                )}

                {/* Selected Products */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {t.selectedProducts} ({formData.items.length})
                  </p>
                  {formData.items.length === 0 ? (
                    <p className={`text-sm italic ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                      {t.noProducts}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.items.map((item) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;
                        return (
                          <div
                            key={item.productId}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              darkMode ? 'bg-white/5' : 'bg-gray-50'
                            }`}
                          >
                            {product.images[0] && (
                              <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                                {product.price.toFixed(2)}&euro;
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.qty}:</label>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 1)}
                                className={`w-16 px-2 py-1 rounded border text-center ${
                                  darkMode
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => removeProductFromPack(item.productId)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Pack Price */}
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  {t.price} (&euro;) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Preview Price */}
              {formData.items.length > 0 && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {language === 'fr' ? 'Aperçu du prix' : 'Price preview'}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={`line-through ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {calculateOriginalPrice(formData.items).toFixed(2)}&euro;
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formData.price.toFixed(2)}&euro;
                    </span>
                    {calculateOriginalPrice(formData.items) > 0 && formData.price > 0 && (
                      <span className="text-sm text-green-400">
                        -{Math.round(((calculateOriginalPrice(formData.items) - formData.price) / calculateOriginalPrice(formData.items)) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Activate */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.activate}</span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className={`flex gap-3 p-6 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`flex-1 py-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.slug || formData.items.length === 0 || formData.price <= 0 || saving}
                className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingPack ? t.save : t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl ${
              darkMode ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white'
            }`}
          >
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {t.deleteTitle}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              {t.deleteWarning}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
