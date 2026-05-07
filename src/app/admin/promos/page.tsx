'use client';

import { useState, useEffect } from 'react';
import { useAdminStore, PromoCode } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function PromosPage() {
  const { darkMode, language } = useStore();

  // Translations
  const t = {
    activeCodes: language === 'fr' ? 'codes actifs sur' : 'active codes out of',
    newPromoCode: language === 'fr' ? 'Nouveau code promo' : 'New promo code',
    active: language === 'fr' ? 'Actif' : 'Active',
    expired: language === 'fr' ? 'Expiré' : 'Expired',
    limitReached: language === 'fr' ? 'Limite atteinte' : 'Limit reached',
    comingSoon: language === 'fr' ? 'À venir' : 'Coming soon',
    inactive: language === 'fr' ? 'Inactif' : 'Inactive',
    discount: language === 'fr' ? 'Réduction' : 'Discount',
    minPurchase: language === 'fr' ? 'Achat minimum' : 'Minimum purchase',
    uses: language === 'fr' ? 'Utilisations' : 'Uses',
    validity: language === 'fr' ? 'Validité' : 'Validity',
    unlimited: language === 'fr' ? 'illimité' : 'unlimited',
    noLimit: language === 'fr' ? 'Sans limite' : 'No limit',
    edit: language === 'fr' ? 'Modifier' : 'Edit',
    disable: language === 'fr' ? 'Désactiver' : 'Disable',
    enable: language === 'fr' ? 'Activer' : 'Enable',
    noPromoCodes: language === 'fr' ? 'Aucun code promo. Créez-en un !' : 'No promo codes. Create a new one!',
    editPromoCode: language === 'fr' ? 'Modifier le code promo' : 'Edit promo code',
    createPromoCode: language === 'fr' ? 'Nouveau code promo' : 'New promo code',
    code: 'Code',
    discountType: language === 'fr' ? 'Type de réduction' : 'Discount type',
    value: language === 'fr' ? 'Valeur' : 'Value',
    minPurchaseLabel: language === 'fr' ? 'Achat minimum (€)' : 'Minimum purchase (€)',
    maxUses: language === 'fr' ? 'Utilisations max' : 'Max uses',
    startDate: language === 'fr' ? 'Date de début' : 'Start date',
    endDate: language === 'fr' ? 'Date de fin' : 'End date',
    percentage: language === 'fr' ? 'Pourcentage (%)' : 'Percentage (%)',
    fixedAmount: language === 'fr' ? 'Montant fixe (€)' : 'Fixed amount (€)',
    perTranche: language === 'fr' ? 'Par tranche (dynamique)' : 'Per tranche (dynamic)',
    trancheSizeLabel: language === 'fr' ? 'Taille de tranche (€)' : 'Tranche size (€)',
    activateNow: language === 'fr' ? 'Activer immédiatement' : 'Activate immediately',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    create: language === 'fr' ? 'Créer' : 'Create',
    deleteTitle: language === 'fr' ? 'Supprimer ce code promo ?' : 'Delete this promo code?',
    deleteWarning: language === 'fr' ? 'Cette action est irréversible.' : 'This action is irreversible.',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
    noMinimum: language === 'fr' ? '0 = pas de minimum' : '0 = no minimum',
    noMaxUses: language === 'fr' ? '0 = illimité' : '0 = unlimited',
  };
  const { promoCodes, fetchPromoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useAdminStore();

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const syncToStripe = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/stripe/sync-promos', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        setSyncResult(result.data.message);
        fetchPromoCodes();
      } else {
        setSyncResult(result.error || 'Erreur de synchronisation');
      }
    } catch {
      setSyncResult('Erreur de connexion');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping' | 'per_tranche',
    value: 10,
    trancheSize: 100,
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
      trancheSize: 100,
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
      trancheSize: promo.trancheSize || 100,
      minPurchase: promo.minPurchase || 0,
      maxUses: promo.maxUses || 0,
      validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const promoData = {
      ...formData,
      code: formData.code.toUpperCase(),
      trancheSize: formData.type === 'per_tranche' ? formData.trancheSize : undefined,
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
          <p className={darkMode ? 'text-white/50' : 'text-gray-500'}>
            {promoCodes.filter((p) => p.isActive).length} {t.activeCodes} {promoCodes.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={syncToStripe} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Stripe
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            {t.newPromoCode}
          </Button>
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className={`p-3 rounded-lg text-sm ${
          syncResult.includes('erreur') || syncResult.includes('Erreur')
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {syncResult}
        </div>
      )}

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map((promo) => {
          const expired = promo.validUntil ? isExpired(promo.validUntil) : false;
          const notStarted = isNotStarted(promo.validFrom);
          const maxUsesReached = promo.maxUses && promo.usedCount >= promo.maxUses;

          return (
            <Card
              key={promo.id}
              className={`${!promo.isActive || expired || maxUsesReached ? 'opacity-60' : ''} ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <code className={`text-lg font-bold px-3 py-1 rounded ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
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
                      <Badge className="bg-green-100 text-green-800">{t.active}</Badge>
                    ) : expired ? (
                      <Badge className="bg-red-100 text-red-800">{t.expired}</Badge>
                    ) : maxUsesReached ? (
                      <Badge className="bg-orange-100 text-orange-800">{t.limitReached}</Badge>
                    ) : notStarted ? (
                      <Badge className="bg-blue-100 text-blue-800">{t.comingSoon}</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">{t.inactive}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.discount}</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {promo.type === 'percentage'
                        ? `${promo.value}%`
                        : promo.type === 'per_tranche'
                          ? `-${promo.value}€ / ${promo.trancheSize ?? 100}€`
                          : `${promo.value} €`}
                    </span>
                  </div>

                  {promo.minPurchase && (
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.minPurchase}</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>{promo.minPurchase} €</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.uses}</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ` (${t.unlimited})`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>{t.validity}</span>
                    <span className={`text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(promo.validFrom).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} -{' '}
                      {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : t.noLimit}
                    </span>
                  </div>
                </div>

                <div className={`flex gap-2 mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(promo)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePromoCode(promo.id, { isActive: !promo.isActive })}
                  >
                    {promo.isActive ? t.disable : t.enable}
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
        <div className={`text-center py-12 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {t.noPromoCodes}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? t.editPromoCode : t.createPromoCode}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.code}</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: SUMMER20"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.discountType}</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' | 'free_shipping' | 'per_tranche' })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="percentage">{t.percentage}</option>
                  <option value="fixed">{t.fixedAmount}</option>
                  <option value="free_shipping">{language === 'fr' ? 'Livraison gratuite' : 'Free shipping'}</option>
                  <option value="per_tranche">{t.perTranche}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {formData.type === 'per_tranche'
                    ? (language === 'fr' ? 'Réduction par tranche (€)' : 'Discount per tranche (€)')
                    : t.value}
                </label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            {formData.type === 'per_tranche' && (
              <div>
                <label className="text-sm font-medium">{t.trancheSizeLabel}</label>
                <Input
                  type="number"
                  value={formData.trancheSize}
                  onChange={(e) => setFormData({ ...formData, trancheSize: Number(e.target.value) })}
                  min={1}
                  placeholder="100"
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  {language === 'fr'
                    ? `Ex: -${formData.value}€ par tranche de ${formData.trancheSize}€ d'achat`
                    : `Ex: -${formData.value}€ per ${formData.trancheSize}€ purchase tranche`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.minPurchaseLabel}</label>
                <Input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                  min={0}
                  placeholder={t.noMinimum}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.maxUses}</label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                  min={0}
                  placeholder={t.noMaxUses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.startDate}</label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.endDate}</label>
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
              <span className="text-sm">{t.activateNow}</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={!formData.code || formData.value <= 0}>
              {editingPromo ? t.save : t.create}
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
