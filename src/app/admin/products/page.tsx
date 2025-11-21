'use client';

import { useState } from 'react';
import { useAdminStore, AdminProduct } from '@/stores/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
    modelImages: [],
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
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={!product.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-300" />
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  {product.isFeatured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>

                <p className="text-sm text-gray-500">{product.sku}</p>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{product.price} €</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.originalPrice} €
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={product.totalStock > 10 ? 'default' : 'destructive'}>
                    Stock: {product.totalStock}
                  </Badge>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                  >
                    {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun produit trouvé
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du produit"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SKU"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit"
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Prix</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prix original</label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sizes & Stock */}
            <div>
              <label className="text-sm font-medium">Tailles et stock</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.sizes.map((size, index) => (
                  <div key={size.name} className="flex items-center gap-2">
                    <span className="w-8 font-medium">{size.name}</span>
                    <Input
                      type="number"
                      value={size.stock}
                      onChange={(e) => updateSize(index, 'stock', Number(e.target.value))}
                      className="w-20"
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Couleurs</label>
                <Button type="button" variant="outline" size="sm" onClick={addColor}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={color.name}
                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                      placeholder="Nom de la couleur"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(index, 'hex', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    {formData.colors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColor(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm">Actif</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span className="text-sm">Mis en avant</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit ?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Cette action est irréversible. Le produit sera définitivement supprimé.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
