'use client';

import { useState } from 'react';
import { useAdminStore } from '@/stores/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, FolderOpen } from 'lucide-react';

export default function SettingsPage() {
  const { categories, addCategory, deleteCategory, products } = useAdminStore();
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter((p) => p.category === category).length;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Gestion des catégories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nouvelle catégorie..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Categories list */}
          <div className="space-y-2">
            {categories.map((category) => {
              const productCount = getCategoryProductCount(category);
              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="outline">{productCount} produit{productCount > 1 ? 's' : ''}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category)}
                    disabled={productCount > 0}
                    title={productCount > 0 ? 'Impossible de supprimer une catégorie avec des produits' : ''}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de livraison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frais de livraison standard</label>
              <Input type="number" defaultValue={5.90} step={0.1} />
            </div>
            <div>
              <label className="text-sm font-medium">Livraison gratuite à partir de</label>
              <Input type="number" defaultValue={100} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Délai de livraison (jours)</label>
              <Input type="text" defaultValue="2-4" />
            </div>
            <div>
              <label className="text-sm font-medium">Pays de livraison</label>
              <Input type="text" defaultValue="France, Belgique, Suisse" />
            </div>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la boutique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom de la boutique</label>
            <Input defaultValue="Temporal" />
          </div>
          <div>
            <label className="text-sm font-medium">Email de contact</label>
            <Input type="email" defaultValue="contact@temporal.fr" />
          </div>
          <div>
            <label className="text-sm font-medium">Devise</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre (£)</option>
            </select>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes de stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Seuil d'alerte stock faible</label>
            <Input type="number" defaultValue={10} />
            <p className="text-sm text-gray-500 mt-1">
              Une alerte sera affichée quand le stock d'un produit passe en dessous de ce seuil
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="emailAlert" defaultChecked />
            <label htmlFor="emailAlert" className="text-sm">
              Recevoir une notification par email
            </label>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
