'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAdminStore, AdminProduct } from '@/stores/useAdminStore';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
} from 'lucide-react';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useAdminStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'tshirts',
    sku: '',
    isActive: true,
    isFeatured: false,
    sizes: [
      { name: 'S', stock: 0, available: true },
      { name: 'M', stock: 0, available: true },
      { name: 'L', stock: 0, available: true },
      { name: 'XL', stock: 0, available: true },
    ],
    colors: [{ name: 'Noir', hex: '#000000', available: true }],
    images: [''],
    modelImages: [] as string[],
    modelInfo: '',
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: 'tshirts',
      sku: `TPL-${Date.now().toString(36).toUpperCase()}`,
      isActive: true,
      isFeatured: false,
      sizes: [
        { name: 'S', stock: 0, available: true },
        { name: 'M', stock: 0, available: true },
        { name: 'L', stock: 0, available: true },
        { name: 'XL', stock: 0, available: true },
      ],
      colors: [{ name: 'Noir', hex: '#000000', available: true }],
      images: [''],
      modelImages: [],
      modelInfo: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images.length > 0 ? product.images : [''],
      modelImages: product.modelImages,
      modelInfo: product.modelInfo || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <option value="all">TOUTES</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
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
          NOUVEAU PRODUIT
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white/5 border border-white/10 ${!product.isActive ? 'opacity-50' : ''}`}
          >
            {/* Image */}
            <div className="aspect-square bg-white/5 relative overflow-hidden">
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
                    className="text-6xl text-white/10"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    TPL
                  </span>
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-2 left-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-white uppercase line-clamp-1"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
                >
                  {product.name}
                </h3>
              </div>

              <p className="text-xs text-white/40" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {product.sku}
              </p>

              <div className="flex items-center gap-3">
                <span
                  className="text-xl text-white"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.price}€
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-white/40 line-through">
                    {product.originalPrice}€
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs ${product.totalStock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  STOCK: {product.totalStock}
                </span>
                <span
                  className="px-2 py-1 text-xs bg-white/10 text-white/60"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {product.category.toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-white/20 text-white/80 hover:border-primary hover:text-primary transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.8rem' }}
                >
                  <Edit className="h-3 w-3" />
                  MODIFIER
                </button>
                <button
                  onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                  className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-primary hover:text-primary transition-colors"
                >
                  {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="w-10 h-10 flex items-center justify-center border border-white/20 text-red-400 hover:border-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div
          className="text-center py-12 text-white/40"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          AUCUN PRODUIT TROUVÉ
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2
                className="text-xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {editingProduct ? 'MODIFIER LE PRODUIT' : 'NOUVEAU PRODUIT'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs text-white/50 mb-2 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    NOM
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du produit"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-white/50 mb-2 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    SKU
                  </label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-xs text-white/50 mb-2 block"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className="text-xs text-white/50 mb-2 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    PRIX
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-white/50 mb-2 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    PRIX ORIGINAL
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-white/50 mb-2 block"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    CATÉGORIE
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-black">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <label
                  className="text-xs text-white/50 mb-2 block"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  URL IMAGE PRINCIPALE
                </label>
                <input
                  value={formData.images[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Sizes & Stock */}
              <div>
                <label
                  className="text-xs text-white/50 mb-3 block"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  TAILLES ET STOCK
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {formData.sizes.map((size, index) => (
                    <div key={size.name} className="flex items-center gap-2">
                      <span className="w-8 text-white/60" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {size.name}
                      </span>
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    className="text-xs text-white/50"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    COULEURS
                  </label>
                  <button
                    type="button"
                    onClick={addColor}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    <Plus className="h-3 w-3" />
                    AJOUTER
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        placeholder="Nom"
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-10 h-10 bg-transparent cursor-pointer"
                      />
                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-white/70">Actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-white/70">Mis en avant</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 border border-white/20 text-white/70 hover:border-white/40 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                ANNULER
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {editingProduct ? 'ENREGISTRER' : 'CRÉER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 w-full max-w-md p-6">
            <h2
              className="text-xl mb-4"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              SUPPRIMER LE PRODUIT ?
            </h2>
            <p className="text-white/60 mb-6">
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-white/20 text-white/70 hover:border-white/40 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                ANNULER
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
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
