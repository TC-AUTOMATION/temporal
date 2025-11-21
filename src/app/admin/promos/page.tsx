'use client';

import { useState } from 'react';
import { useAdminStore, PromoCode } from '@/stores/useAdminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function PromosPage() {
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minPurchase: 0,
    maxUses: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minPurchase: 0,
      maxUses: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minPurchase: promo.minPurchase || 0,
      maxUses: promo.maxUses || 0,
      validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
      validUntil: new Date(promo.validUntil).toISOString().split('T')[0],
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const promoData = {
      ...formData,
      code: formData.code.toUpperCase(),
      minPurchase: formData.minPurchase || undefined,
      maxUses: formData.maxUses || undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
    };

    if (editingPromo) {
      updatePromoCode(editingPromo.id, promoData);
    } else {
      addPromoCode(promoData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePromoCode(id);
    setDeleteConfirm(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isNotStarted = (date: string) => new Date(date) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            {promoCodes.filter((p) => p.isActive).length} codes actifs sur {promoCodes.length}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau code promo
        </Button>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map((promo) => {
          const expired = isExpired(promo.validUntil);
          const notStarted = isNotStarted(promo.validFrom);
          const maxUsesReached = promo.maxUses && promo.usedCount >= promo.maxUses;

          return (
            <Card
              key={promo.id}
              className={`${!promo.isActive || expired || maxUsesReached ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold bg-gray-100 px-3 py-1 rounded">
                      {promo.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(promo.code)}
                    >
                      {copiedCode === promo.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {promo.isActive && !expired && !maxUsesReached && !notStarted ? (
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    ) : expired ? (
                      <Badge className="bg-red-100 text-red-800">Expiré</Badge>
                    ) : maxUsesReached ? (
                      <Badge className="bg-orange-100 text-orange-800">Limite atteinte</Badge>
                    ) : notStarted ? (
                      <Badge className="bg-blue-100 text-blue-800">À venir</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Réduction</span>
                    <span className="font-medium">
                      {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} €`}
                    </span>
                  </div>

                  {promo.minPurchase && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Minimum d'achat</span>
                      <span>{promo.minPurchase} €</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Utilisations</span>
                    <span>
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ' (illimité)'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Validité</span>
                    <span className="text-xs">
                      {new Date(promo.validFrom).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(promo.validUntil).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(promo)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePromoCode(promo.id, { isActive: !promo.isActive })}
                  >
                    {promo.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(promo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {promoCodes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun code promo. Créez-en un nouveau !
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Modifier le code promo' : 'Nouveau code promo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: SUMMER20"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type de réduction</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Valeur</label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Minimum d'achat (€)</label>
                <Input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                  min={0}
                  placeholder="0 = pas de minimum"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Utilisations max</label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                  min={0}
                  placeholder="0 = illimité"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date de début</label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm">Activer immédiatement</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!formData.code || formData.value <= 0}>
              {editingPromo ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce code promo ?</DialogTitle>
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
