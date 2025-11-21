'use client';

import { useState } from 'react';
import { useAdminStore, Pack } from '@/stores/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Gift, Percent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function PacksPage() {
  const { packs, products, addPack, updatePack, deletePack } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    packPrice: 0,
    stock: 10,
    isActive: true,
    selectedProducts: [] as { productId: string; quantity: number }[],
  });

  const calculateOriginalPrice = (selectedProducts: { productId: string; quantity: number }[]) => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const openCreateModal = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      packPrice: 0,
      stock: 10,
      isActive: true,
      selectedProducts: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      packPrice: pack.packPrice,
      stock: pack.stock,
      isActive: pack.isActive,
      selectedProducts: pack.products,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const packData = {
      name: formData.name,
      description: formData.description,
      packPrice: formData.packPrice,
      stock: formData.stock,
      isActive: formData.isActive,
      products: formData.selectedProducts,
      images: [],
    };

    if (editingPack) {
      const originalPrice = calculateOriginalPrice(formData.selectedProducts);
      const discount = Math.round(((originalPrice - formData.packPrice) / originalPrice) * 100);
      updatePack(editingPack.id, { ...packData, originalPrice, discount });
    } else {
      addPack(packData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePack(id);
    setDeleteConfirm(null);
  };

  const addProductToPack = () => {
    if (products.length === 0) return;
    const firstProduct = products[0];
    setFormData({
      ...formData,
      selectedProducts: [
        ...formData.selectedProducts,
        { productId: firstProduct.id, quantity: 1 },
      ],
    });
  };

  const updateProductInPack = (index: number, field: string, value: string | number) => {
    const updated = [...formData.selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, selectedProducts: updated });
  };

  const removeProductFromPack = (index: number) => {
    setFormData({
      ...formData,
      selectedProducts: formData.selectedProducts.filter((_, i) => i !== index),
    });
  };

  const originalPrice = calculateOriginalPrice(formData.selectedProducts);
  const discount = originalPrice > 0 ? Math.round(((originalPrice - formData.packPrice) / originalPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            {packs.filter((p) => p.isActive).length} packs actifs sur {packs.length}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau pack
        </Button>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => {
          const packProducts = pack.products.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return { ...item, product };
          });

          return (
            <Card key={pack.id} className={!pack.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">{pack.name}</h3>
                      <p className="text-sm text-gray-500">
                        {pack.products.length} produit{pack.products.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge className={pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {pack.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pack.description}</p>

                {/* Products in pack */}
                <div className="space-y-1 mb-3">
                  {packProducts.map((item, index) => (
                    <div key={index} className="text-xs text-gray-500 flex justify-between">
                      <span>{item.quantity}x {item.product?.name || 'Produit inconnu'}</span>
                      <span>{item.product ? (item.product.price * item.quantity).toFixed(2) : 0} €</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-purple-600">{pack.packPrice} €</span>
                  <span className="text-sm text-gray-400 line-through">{pack.originalPrice} €</span>
                  <Badge className="bg-green-100 text-green-800">
                    <Percent className="h-3 w-3 mr-1" />
                    -{pack.discount}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Stock: {pack.stock}</span>
                  <span>Économie: {(pack.originalPrice - pack.packPrice).toFixed(2)} €</span>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(pack)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePack(pack.id, { isActive: !pack.isActive })}
                  >
                    {pack.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(pack.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {packs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun pack créé.</p>
          <p className="text-sm">Créez des packs pour offrir des réductions groupées !</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPack ? 'Modifier le pack' : 'Nouveau pack'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom du pack</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pack Essentiel"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du pack..."
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              />
            </div>

            {/* Products Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Produits inclus</label>
                <Button type="button" variant="outline" size="sm" onClick={addProductToPack}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-2">
                {formData.selectedProducts.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <select
                        value={item.productId}
                        onChange={(e) => updateProductInPack(index, 'productId', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {p.price} €
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Qté:</span>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateProductInPack(index, 'quantity', Number(e.target.value))}
                          className="w-16"
                          min={1}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {product ? (product.price * item.quantity).toFixed(2) : 0} €
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductFromPack(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                {formData.selectedProducts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Ajoutez des produits au pack
                  </p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prix original (calculé)</label>
                <div className="px-3 py-2 bg-gray-100 rounded-md font-medium">
                  {originalPrice.toFixed(2)} €
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Prix du pack</label>
                <Input
                  type="number"
                  value={formData.packPrice}
                  onChange={(e) => setFormData({ ...formData, packPrice: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            {originalPrice > 0 && formData.packPrice > 0 && (
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                <Percent className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Réduction de {discount}% ({(originalPrice - formData.packPrice).toFixed(2)} € d'économie)
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stock disponible</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm">Pack actif</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || formData.selectedProducts.length === 0 || formData.packPrice <= 0}
            >
              {editingPack ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce pack ?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
