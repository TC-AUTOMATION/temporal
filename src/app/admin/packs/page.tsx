'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye, EyeOff, X, Check, Search } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useAdminStore, Pack, PackProduct } from '@/stores/useAdminStore';

export default function PacksPage() {
  const { darkMode, language } = useStore();
  const { packs, products, addPack, updatePack, deletePack, fetchProducts } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchProduct, setSearchProduct] = useState('');

  const [formData, setFormData] = useState({
    nameFr: '',
    nameEn: '',
    descriptionFr: '',
    descriptionEn: '',
    products: [] as PackProduct[],
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    isActive: true,
  });

  // Translations
  const t = {
    title: 'PACKS',
    subtitle: language === 'fr' ? 'Créez des lots de produits avec des réductions exclusives' : 'Create product bundles with exclusive discounts',
    activePacks: language === 'fr' ? 'packs actifs sur' : 'active packs out of',
    newPack: language === 'fr' ? 'Nouveau pack' : 'New pack',
    editPack: language === 'fr' ? 'Modifier le pack' : 'Edit pack',
    createPack: language === 'fr' ? 'Créer un pack' : 'Create pack',
    nameFr: language === 'fr' ? 'Nom (Français)' : 'Name (French)',
    nameEn: language === 'fr' ? 'Nom (Anglais)' : 'Name (English)',
    descFr: language === 'fr' ? 'Description (Français)' : 'Description (French)',
    descEn: language === 'fr' ? 'Description (Anglais)' : 'Description (English)',
    products: language === 'fr' ? 'Produits' : 'Products',
    searchProducts: language === 'fr' ? 'Rechercher un produit...' : 'Search product...',
    addProduct: language === 'fr' ? 'Ajouter' : 'Add',
    selectedProducts: language === 'fr' ? 'Produits sélectionnés' : 'Selected products',
    noProducts: language === 'fr' ? 'Aucun produit sélectionné' : 'No products selected',
    discount: language === 'fr' ? 'Réduction' : 'Discount',
    discountType: language === 'fr' ? 'Type de réduction' : 'Discount type',
    percentage: language === 'fr' ? 'Pourcentage (%)' : 'Percentage (%)',
    fixedAmount: language === 'fr' ? 'Montant fixe (€)' : 'Fixed amount (€)',
    value: language === 'fr' ? 'Valeur' : 'Value',
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
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setFormData({
      nameFr: '',
      nameEn: '',
      descriptionFr: '',
      descriptionEn: '',
      products: [],
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
    });
    setSearchProduct('');
  };

  const openCreateModal = () => {
    setEditingPack(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      nameFr: pack.nameFr,
      nameEn: pack.nameEn,
      descriptionFr: pack.descriptionFr,
      descriptionEn: pack.descriptionEn,
      products: [...pack.products],
      discountType: pack.discountType,
      discountValue: pack.discountValue,
      isActive: pack.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nameFr || !formData.nameEn || formData.products.length === 0) return;

    if (editingPack) {
      updatePack(editingPack.id, formData);
    } else {
      addPack(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePack(id);
    setDeleteConfirm(null);
  };

  const addProductToPack = (productId: string) => {
    if (formData.products.some((p) => p.productId === productId)) return;
    setFormData({
      ...formData,
      products: [...formData.products, { productId, quantity: 1 }],
    });
    setSearchProduct('');
  };

  const removeProductFromPack = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter((p) => p.productId !== productId),
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData({
      ...formData,
      products: formData.products.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      ),
    });
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const calculatePackPrice = (packProducts: PackProduct[], discountType: string, discountValue: number) => {
    const originalPrice = packProducts.reduce((sum, pp) => {
      const product = getProductById(pp.productId);
      return sum + (product?.price || 0) * pp.quantity;
    }, 0);

    if (discountType === 'percentage') {
      return originalPrice * (1 - discountValue / 100);
    }
    return Math.max(0, originalPrice - discountValue);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
          const originalPrice = pack.products.reduce((sum, pp) => {
            const product = getProductById(pp.productId);
            return sum + (product?.price || 0) * pp.quantity;
          }, 0);
          const packPrice = calculatePackPrice(pack.products, pack.discountType, pack.discountValue);
          const savings = originalPrice - packPrice;

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
                    {language === 'fr' ? pack.nameFr : pack.nameEn}
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
                <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  {language === 'fr' ? pack.descriptionFr : pack.descriptionEn}
                </p>
              </div>

              {/* Pack Products */}
              <div className="p-4 space-y-2">
                {pack.products.map((pp) => {
                  const product = getProductById(pp.productId);
                  if (!product) return null;
                  return (
                    <div
                      key={pp.productId}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        darkMode ? 'bg-white/5' : 'bg-gray-50'
                      }`}
                    >
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {product.price.toFixed(2)}€ × {pp.quantity}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {(product.price * pp.quantity).toFixed(2)}€
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pack Pricing */}
              <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.originalPrice}</span>
                    <span className={`line-through ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {originalPrice.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.discount}</span>
                    <span className="text-green-400">
                      -{pack.discountType === 'percentage' ? `${pack.discountValue}%` : `${pack.discountValue}€`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{t.packPrice}</span>
                    <span className="text-primary">{packPrice.toFixed(2)}€</span>
                  </div>
                  <p className="text-xs text-green-400 text-right">
                    {t.savings}: {savings.toFixed(2)}€
                  </p>
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
                  onClick={() => updatePack(pack.id, { isActive: !pack.isActive })}
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
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.nameFr}
                  </label>
                  <input
                    type="text"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    placeholder="Ex: Pack Essentiel"
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.nameEn}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Ex: Essential Pack"
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.descFr}
                  </label>
                  <textarea
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    placeholder="Description du pack..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.descEn}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Pack description..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  {t.products}
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
                        disabled={formData.products.some((p) => p.productId === product.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          formData.products.some((p) => p.productId === product.id)
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
                          <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{product.price.toFixed(2)}€</p>
                        </div>
                        {formData.products.some((p) => p.productId === product.id) ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Plus size={18} className="text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Products */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {t.selectedProducts} ({formData.products.length})
                  </p>
                  {formData.products.length === 0 ? (
                    <p className={`text-sm italic ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                      {t.noProducts}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.products.map((pp) => {
                        const product = getProductById(pp.productId);
                        if (!product) return null;
                        return (
                          <div
                            key={pp.productId}
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
                                {product.price.toFixed(2)}€
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.qty}:</label>
                              <input
                                type="number"
                                min={1}
                                value={pp.quantity}
                                onChange={(e) => updateProductQuantity(pp.productId, parseInt(e.target.value) || 1)}
                                className={`w-16 px-2 py-1 rounded border text-center ${
                                  darkMode
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => removeProductFromPack(pp.productId)}
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

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.discountType}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="percentage" className={darkMode ? 'bg-black' : ''}>{t.percentage}</option>
                    <option value="fixed" className={darkMode ? 'bg-black' : ''}>{t.fixedAmount}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {t.value}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Preview Price */}
              {formData.products.length > 0 && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {language === 'fr' ? 'Aperçu du prix' : 'Price preview'}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={`line-through ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {formData.products.reduce((sum, pp) => {
                        const product = getProductById(pp.productId);
                        return sum + (product?.price || 0) * pp.quantity;
                      }, 0).toFixed(2)}€
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {calculatePackPrice(formData.products, formData.discountType, formData.discountValue).toFixed(2)}€
                    </span>
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
                disabled={!formData.nameFr || !formData.nameEn || formData.products.length === 0}
                className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
