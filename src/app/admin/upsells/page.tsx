'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  ShoppingCart,
  CreditCard,
  Eye,
  TrendingUp,
  Search,
  Loader2,
  X,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UpsellProduct {
  id: string;
  name: string;
  nameEn: string | null;
  price: string | number;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
}

interface Upsell {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  productId: string;
  product: UpsellProduct;
  triggerType: string;
  triggerValue: string;
  displayLocation: string;
  discountType: string | null;
  discountValue: number | null;
  freeThreshold: number | null;
  message: string | null;
  messageEn: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductOption {
  id: string;
  name: string;
  nameEn: string | null;
  price: number;
  images: string[];
  category: { name: string; slug: string };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const defaultFormData = {
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  productId: '',
  triggerType: 'cart_total' as string,
  triggerValue: '50',
  displayLocation: 'cart' as string,
  discountType: '' as string,
  discountValue: 0,
  freeThreshold: 0,
  message: '',
  messageEn: '',
  image: '',
  isActive: true,
  sortOrder: 0,
};

export default function UpsellsPage() {
  const { darkMode, language } = useStore();

  const t = {
    pageTitle: language === 'fr' ? 'GESTION DES UPSELLS' : 'UPSELL MANAGEMENT',
    activeCount: language === 'fr' ? 'actifs sur' : 'active out of',
    newUpsell: language === 'fr' ? 'Nouvel upsell' : 'New upsell',
    editUpsell: language === 'fr' ? 'Modifier l\'upsell' : 'Edit upsell',
    createUpsell: language === 'fr' ? 'Nouvel upsell' : 'New upsell',
    name: language === 'fr' ? 'Nom (FR)' : 'Name (FR)',
    nameEn: language === 'fr' ? 'Nom (EN)' : 'Name (EN)',
    description: language === 'fr' ? 'Description (FR)' : 'Description (FR)',
    descriptionEn: language === 'fr' ? 'Description (EN)' : 'Description (EN)',
    product: language === 'fr' ? 'Produit' : 'Product',
    selectProduct: language === 'fr' ? 'Sélectionner un produit' : 'Select a product',
    searchProducts: language === 'fr' ? 'Rechercher un produit...' : 'Search product...',
    triggerType: language === 'fr' ? 'Type de déclencheur' : 'Trigger type',
    cartTotal: language === 'fr' ? 'Total panier' : 'Cart total',
    productInCart: language === 'fr' ? 'Produit dans le panier' : 'Product in cart',
    categoryInCart: language === 'fr' ? 'Catégorie dans le panier' : 'Category in cart',
    triggerValue: language === 'fr' ? 'Valeur du déclencheur' : 'Trigger value',
    minimumAmount: language === 'fr' ? 'Montant minimum' : 'Minimum amount',
    selectTriggerProduct: language === 'fr' ? 'Produit déclencheur' : 'Trigger product',
    selectCategory: language === 'fr' ? 'Catégorie' : 'Category',
    displayLocation: language === 'fr' ? 'Emplacement d\'affichage' : 'Display location',
    cart: language === 'fr' ? 'Panier' : 'Cart',
    checkout: language === 'fr' ? 'Checkout' : 'Checkout',
    productPage: language === 'fr' ? 'Page produit' : 'Product page',
    discountConfig: language === 'fr' ? 'Configuration de la remise' : 'Discount configuration',
    discountType: language === 'fr' ? 'Type de remise' : 'Discount type',
    noDiscount: language === 'fr' ? 'Aucune remise' : 'No discount',
    percentage: language === 'fr' ? 'Pourcentage' : 'Percentage',
    fixedAmount: language === 'fr' ? 'Montant fixe' : 'Fixed amount',
    freeGift: language === 'fr' ? 'Cadeau gratuit' : 'Free gift',
    discountValue: language === 'fr' ? 'Valeur de la remise' : 'Discount value',
    freeThreshold: language === 'fr' ? 'Seuil cadeau gratuit' : 'Free gift threshold',
    freeThresholdHelp: language === 'fr'
      ? 'Panier minimum pour que l\'article devienne gratuit'
      : 'Minimum cart total for the item to become free',
    messageFr: language === 'fr' ? 'Message (FR)' : 'Message (FR)',
    messageEn: language === 'fr' ? 'Message (EN)' : 'Message (EN)',
    imageUrl: language === 'fr' ? 'URL de l\'image' : 'Image URL',
    active: language === 'fr' ? 'Actif' : 'Active',
    inactive: language === 'fr' ? 'Inactif' : 'Inactive',
    activate: language === 'fr' ? 'Activer' : 'Activate',
    deactivate: language === 'fr' ? 'Désactiver' : 'Deactivate',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    create: language === 'fr' ? 'Créer' : 'Create',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
    deleteTitle: language === 'fr' ? 'Supprimer cet upsell ?' : 'Delete this upsell?',
    deleteWarning: language === 'fr' ? 'Cette action est irréversible.' : 'This action is irreversible.',
    noUpsells: language === 'fr' ? 'Aucun upsell. Créez-en un !' : 'No upsells. Create one!',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    trigger: language === 'fr' ? 'Déclencheur' : 'Trigger',
    threshold: language === 'fr' ? 'Seuil' : 'Threshold',
    discount: language === 'fr' ? 'Remise' : 'Discount',
    status: language === 'fr' ? 'Statut' : 'Status',
    actions: language === 'fr' ? 'Actions' : 'Actions',
    location: language === 'fr' ? 'Emplacement' : 'Location',
    freeAbove: language === 'fr' ? 'Gratuit dès' : 'Free above',
    sortOrder: language === 'fr' ? 'Ordre d\'affichage' : 'Sort order',
    activateNow: language === 'fr' ? 'Activer immédiatement' : 'Activate immediately',
  };

  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpsell, setEditingUpsell] = useState<Upsell | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const fetchUpsells = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/upsells');
      if (res.ok) {
        const data = await res.json();
        setUpsells(data.data.upsells);
      }
    } catch (err) {
      console.error('Error fetching upsells:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(
          (data.data?.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            price: Number(p.price),
            images: p.images,
            category: p.category,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchUpsells();
    fetchProducts();
    fetchCategories();
  }, [fetchUpsells, fetchProducts, fetchCategories]);

  const openCreateModal = () => {
    setEditingUpsell(null);
    setFormData(defaultFormData);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (upsell: Upsell) => {
    setEditingUpsell(upsell);
    setFormData({
      name: upsell.name,
      nameEn: upsell.nameEn || '',
      description: upsell.description || '',
      descriptionEn: upsell.descriptionEn || '',
      productId: upsell.productId,
      triggerType: upsell.triggerType as any,
      triggerValue: upsell.triggerValue,
      displayLocation: upsell.displayLocation as any,
      discountType: upsell.discountType || '',
      discountValue: upsell.discountValue ? Number(upsell.discountValue) : 0,
      freeThreshold: upsell.freeThreshold ? Number(upsell.freeThreshold) : 0,
      message: upsell.message || '',
      messageEn: upsell.messageEn || '',
      image: upsell.image || '',
      isActive: upsell.isActive,
      sortOrder: upsell.sortOrder,
    });
    setProductSearch(upsell.product.name);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountType: formData.discountType || null,
        discountValue: formData.discountValue || null,
        freeThreshold: formData.freeThreshold || null,
        nameEn: formData.nameEn || null,
        description: formData.description || null,
        descriptionEn: formData.descriptionEn || null,
        message: formData.message || null,
        messageEn: formData.messageEn || null,
        image: formData.image || null,
      };

      if (editingUpsell) {
        const res = await fetch('/api/admin/upsells', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingUpsell.id, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/admin/upsells', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create');
      }

      setIsModalOpen(false);
      fetchUpsells();
    } catch (err) {
      console.error('Error saving upsell:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/upsells?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUpsells((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error('Error deleting upsell:', err);
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (upsell: Upsell) => {
    try {
      const res = await fetch('/api/admin/upsells', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: upsell.id, isActive: !upsell.isActive }),
      });
      if (res.ok) {
        setUpsells((prev) =>
          prev.map((u) => (u.id === upsell.id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      console.error('Error toggling upsell:', err);
    }
  };

  const moveUpsell = async (upsell: Upsell, direction: 'up' | 'down') => {
    const index = upsells.findIndex((u) => u.id === upsell.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === upsells.length - 1) return;

    const newUpsells = [...upsells];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const tempOrder = newUpsells[index].sortOrder;
    newUpsells[index].sortOrder = newUpsells[swapIndex].sortOrder;
    newUpsells[swapIndex].sortOrder = tempOrder;
    [newUpsells[index], newUpsells[swapIndex]] = [newUpsells[swapIndex], newUpsells[index]];
    setUpsells(newUpsells);

    // Persist both
    try {
      await Promise.all([
        fetch('/api/admin/upsells', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newUpsells[index].id, sortOrder: newUpsells[index].sortOrder }),
        }),
        fetch('/api/admin/upsells', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newUpsells[swapIndex].id, sortOrder: newUpsells[swapIndex].sortOrder }),
        }),
      ]);
    } catch (err) {
      console.error('Error reordering:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'cart_total': return t.cartTotal;
      case 'product_in_cart': return t.productInCart;
      case 'category_in_cart': return t.categoryInCart;
      default: return type;
    }
  };

  const getLocationIcon = (loc: string) => {
    switch (loc) {
      case 'cart': return <ShoppingCart size={14} />;
      case 'checkout': return <CreditCard size={14} />;
      case 'product_page': return <Eye size={14} />;
      default: return <Package size={14} />;
    }
  };

  const getLocationLabel = (loc: string) => {
    switch (loc) {
      case 'cart': return t.cart;
      case 'checkout': return t.checkout;
      case 'product_page': return t.productPage;
      default: return loc;
    }
  };

  const getDiscountLabel = (upsell: Upsell) => {
    if (!upsell.discountType) {
      if (upsell.freeThreshold) {
        return `${t.freeAbove} ${Number(upsell.freeThreshold)}€`;
      }
      return '-';
    }
    switch (upsell.discountType) {
      case 'percentage': return `-${Number(upsell.discountValue)}%`;
      case 'fixed': return `-${Number(upsell.discountValue)}€`;
      case 'free': return t.freeGift;
      default: return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className={darkMode ? 'text-white/50' : 'text-gray-500'}>
            {upsells.filter((u) => u.isActive).length} {t.activeCount} {upsells.length}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          {t.newUpsell}
        </Button>
      </div>

      {/* Upsells Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {upsells.map((upsell, index) => (
          <Card
            key={upsell.id}
            className={`transition-all ${!upsell.isActive ? 'opacity-60' : ''} ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <CardContent className="p-4">
              {/* Top row: Image, Name, Badge */}
              <div className="flex items-start gap-3 mb-3">
                {/* Reorder handle */}
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => moveUpsell(upsell, 'up')}
                    disabled={index === 0}
                    className={`p-0.5 rounded transition-colors disabled:opacity-20 ${
                      darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ArrowUpDown size={14} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => moveUpsell(upsell, 'down')}
                    disabled={index === upsells.length - 1}
                    className={`p-0.5 rounded transition-colors disabled:opacity-20 ${
                      darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ArrowUpDown size={14} />
                  </button>
                </div>

                {/* Product image */}
                <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${
                  darkMode ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  {(upsell.image || upsell.product.images[0]) ? (
                    <img
                      src={upsell.image || upsell.product.images[0]}
                      alt={upsell.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift size={20} className="text-primary/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {upsell.name}
                    </h3>
                    <Badge
                      className={`text-[10px] ${
                        upsell.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {upsell.isActive ? t.active : t.inactive}
                    </Badge>
                  </div>
                  <p className={`text-xs truncate ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {upsell.product.name} - {Number(upsell.product.price).toFixed(2)}€
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className={`flex items-center gap-1.5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    <TrendingUp size={12} />
                    {t.trigger}
                  </span>
                  <span className={darkMode ? 'text-white/80' : 'text-gray-700'}>
                    {getTriggerLabel(upsell.triggerType)}: {upsell.triggerValue}{upsell.triggerType === 'cart_total' ? '€' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`flex items-center gap-1.5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    {getLocationIcon(upsell.displayLocation)}
                    {t.location}
                  </span>
                  <span className={darkMode ? 'text-white/80' : 'text-gray-700'}>
                    {getLocationLabel(upsell.displayLocation)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`flex items-center gap-1.5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    <Gift size={12} />
                    {t.discount}
                  </span>
                  <span className={`font-medium ${
                    upsell.discountType === 'free' || upsell.freeThreshold
                      ? 'text-green-500'
                      : darkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    {getDiscountLabel(upsell)}
                  </span>
                </div>

                {upsell.freeThreshold && upsell.discountType !== 'free' && (
                  <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-1.5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {t.threshold}
                    </span>
                    <span className="text-green-500 font-medium">
                      {t.freeAbove} {Number(upsell.freeThreshold)}€
                    </span>
                  </div>
                )}

                {upsell.message && (
                  <p className={`mt-2 italic text-[11px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    &quot;{upsell.message}&quot;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className={`flex gap-2 mt-4 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(upsell)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(upsell)}
                >
                  {upsell.isActive ? t.deactivate : t.activate}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm(upsell.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {upsells.length === 0 && (
        <div className={`text-center py-16 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          <Gift size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {t.noUpsells}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {editingUpsell ? t.editUpsell : t.createUpsell}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.name}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sac de lavage"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.nameEn}</label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Washing bag"
                />
              </div>
            </div>

            {/* Description fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.description}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none h-20"
                  placeholder={language === 'fr' ? 'Description en francais...' : 'French description...'}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.descriptionEn}</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none h-20"
                  placeholder="English description..."
                />
              </div>
            </div>

            {/* Product selector */}
            <div>
              <label className="text-sm font-medium mb-1 block">{t.product}</label>
              <div className="relative">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder={t.searchProducts}
                    className="pl-9"
                  />
                  {formData.productId && (
                    <button
                      onClick={() => {
                        setFormData({ ...formData, productId: '' });
                        setProductSearch('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className={`absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-xl ${
                    darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
                  }`}>
                    {filteredProducts.slice(0, 20).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setFormData({ ...formData, productId: product.id });
                          setProductSearch(product.name);
                          setShowProductDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                          formData.productId === product.id
                            ? 'bg-primary/10 text-primary'
                            : darkMode
                              ? 'hover:bg-white/5'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded overflow-hidden flex-shrink-0 ${
                          darkMode ? 'bg-white/10' : 'bg-gray-100'
                        }`}>
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              TPL
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{product.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                            {product.price}€ - {product.category.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <div className={`mt-2 flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  darkMode ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'
                }`}>
                  <Package size={12} />
                  {selectedProduct.name} - {selectedProduct.price}€
                </div>
              )}
            </div>

            {/* Trigger type & value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.triggerType}</label>
                <select
                  value={formData.triggerType}
                  onChange={(e) => {
                    const val = e.target.value as typeof formData.triggerType;
                    setFormData({
                      ...formData,
                      triggerType: val,
                      triggerValue: val === 'cart_total' ? '50' : '',
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="cart_total">{t.cartTotal}</option>
                  <option value="product_in_cart">{t.productInCart}</option>
                  <option value="category_in_cart">{t.categoryInCart}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.triggerValue}</label>
                {formData.triggerType === 'cart_total' && (
                  <Input
                    type="number"
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                    placeholder={t.minimumAmount}
                    min={0}
                  />
                )}
                {formData.triggerType === 'product_in_cart' && (
                  <select
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">{t.selectTriggerProduct}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
                {formData.triggerType === 'category_in_cart' && (
                  <select
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">{t.selectCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Display location */}
            <div>
              <label className="text-sm font-medium mb-1 block">{t.displayLocation}</label>
              <div className="flex gap-2">
                {(['cart', 'checkout', 'product_page'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setFormData({ ...formData, displayLocation: loc })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm ${
                      formData.displayLocation === loc
                        ? 'border-primary bg-primary/10 text-primary'
                        : darkMode
                          ? 'border-white/10 hover:border-white/20'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getLocationIcon(loc)}
                    <span>{getLocationLabel(loc)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount configuration */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Gift size={16} className="text-primary" />
                {t.discountConfig}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">{t.discountType}</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">{t.noDiscount}</option>
                    <option value="percentage">{t.percentage} (%)</option>
                    <option value="fixed">{t.fixedAmount} (€)</option>
                    <option value="free">{t.freeGift}</option>
                  </select>
                </div>

                {formData.discountType && formData.discountType !== 'free' && (
                  <div>
                    <label className="text-xs font-medium mb-1 block">{t.discountValue}</label>
                    <Input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      min={0}
                      placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium mb-1 block">{t.freeThreshold}</label>
                <Input
                  type="number"
                  value={formData.freeThreshold}
                  onChange={(e) => setFormData({ ...formData, freeThreshold: Number(e.target.value) })}
                  min={0}
                  placeholder="100"
                />
                <p className={`text-[11px] mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  {t.freeThresholdHelp}
                </p>
              </div>
            </div>

            {/* Message FR/EN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.messageFr}</label>
                <Input
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Protegez vos vetements..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.messageEn}</label>
                <Input
                  value={formData.messageEn}
                  onChange={(e) => setFormData({ ...formData, messageEn: e.target.value })}
                  placeholder="Protect your clothes..."
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-sm font-medium mb-1 block">{t.imageUrl}</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/upsell.webp"
              />
              {formData.image && (
                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Sort order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.sortOrder}</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-primary"
                  />
                  <span className="text-sm">{t.activateNow}</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.productId || !formData.triggerValue}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUpsell ? t.save : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteTitle}</DialogTitle>
          </DialogHeader>
          <p className={darkMode ? 'text-white/60' : 'text-gray-600'}>{t.deleteWarning}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
