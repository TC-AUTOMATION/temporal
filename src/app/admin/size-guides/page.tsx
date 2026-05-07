'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Ruler, Package, Check } from 'lucide-react';
import { useStore } from '@/stores/useStore';

interface SizeRow {
  size: string;
  chest: string;
  waist: string;
  hips: string;
  length: string;
  shoulders: string;
}

interface SizeGuide {
  id: string;
  categorySlug: string;
  nameFr: string;
  nameEn: string;
  tipsFr: string;
  tipsEn: string;
  sizes: SizeRow[];
  unit: string;
  sortOrder: number;
  isActive: boolean;
  products?: { id: string; name: string }[];
}

const emptySizeRow: SizeRow = { size: '', chest: '', waist: '', hips: '', length: '', shoulders: '' };

const emptyGuide: Omit<SizeGuide, 'id'> = {
  categorySlug: '',
  nameFr: '',
  nameEn: '',
  tipsFr: '',
  tipsEn: '',
  sizes: [{ ...emptySizeRow, size: 'S' }, { ...emptySizeRow, size: 'M' }, { ...emptySizeRow, size: 'L' }, { ...emptySizeRow, size: 'XL' }],
  unit: 'cm',
  sortOrder: 0,
  isActive: true,
};

export default function SizeGuidesAdminPage() {
  const { darkMode, language } = useStore();
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>(emptyGuide);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ nameFr?: boolean; nameEn?: boolean }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [assigningGuideId, setAssigningGuideId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string; sizeGuideId?: string | null }[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/admin/size-guides', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setGuides(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products?active=all&limit=200', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.data.products.map((p: any) => ({ id: p.id, name: p.name, sizeGuideId: p.sizeGuideId })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleSave = async () => {
    // Client-side validation
    const newErrors: { nameFr?: boolean; nameEn?: boolean } = {};
    if (!form.nameFr?.trim()) newErrors.nameFr = true;
    if (!form.nameEn?.trim()) newErrors.nameEn = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaveError(language === 'fr' ? 'Veuillez remplir les champs obligatoires en rouge' : 'Please fill in the required fields in red');
      return;
    }

    setErrors({});
    setSaveError(null);
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing, ...form } : form;
      const res = await fetch('/api/admin/size-guides', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await fetchGuides();
        setEditing(null);
        setCreating(false);
        setForm(emptyGuide);
      } else {
        setSaveError(data.error || 'Erreur');
      }
    } catch (err) {
      console.error(err);
      setSaveError(language === 'fr' ? 'Erreur réseau' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer ce guide ?' : 'Delete this guide?')) return;
    try {
      await fetch(`/api/admin/size-guides?id=${id}`, { method: 'DELETE' });
      await fetchGuides();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (guide: SizeGuide) => {
    setEditing(guide.id);
    setCreating(false);
    setErrors({});
    setSaveError(null);
    setForm({
      categorySlug: guide.categorySlug,
      nameFr: guide.nameFr,
      nameEn: guide.nameEn,
      tipsFr: guide.tipsFr || '',
      tipsEn: guide.tipsEn || '',
      sizes: guide.sizes,
      unit: guide.unit,
      sortOrder: guide.sortOrder,
      isActive: guide.isActive,
    });
  };

  const addSizeRow = () => {
    setForm({ ...form, sizes: [...form.sizes, { ...emptySizeRow }] });
  };

  const removeSizeRow = (index: number) => {
    setForm({ ...form, sizes: form.sizes.filter((_: any, i: number) => i !== index) });
  };

  const updateSizeRow = (index: number, field: string, value: string) => {
    const newSizes = [...form.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setForm({ ...form, sizes: newSizes });
  };

  const openAssignModal = async (guideId: string) => {
    setAssigningGuideId(guideId);
    await fetchAllProducts();
    const guide = guides.find(g => g.id === guideId);
    setSelectedProductIds(guide?.products?.map(p => p.id) || []);
  };

  const handleAssignProducts = async () => {
    if (!assigningGuideId) return;
    setAssignSaving(true);
    try {
      const guide = guides.find(g => g.id === assigningGuideId);
      const currentIds = guide?.products?.map(p => p.id) || [];

      const toAdd = selectedProductIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedProductIds.includes(id));

      const updates = [
        ...toAdd.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sizeGuideId: assigningGuideId }),
          })
        ),
        ...toRemove.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sizeGuideId: null }),
          })
        ),
      ];
      await Promise.all(updates);
      await fetchGuides();
      setAssigningGuideId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAssignSaving(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isFormOpen = editing || creating;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ruler size={28} className="text-primary" />
          <h1
            className="text-3xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {language === 'fr' ? 'GUIDES DES TAILLES' : 'SIZE GUIDES'}
          </h1>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setForm({ ...emptyGuide }); setErrors({}); setSaveError(null); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-all"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <Plus size={18} />
            {language === 'fr' ? 'AJOUTER UN GUIDE' : 'ADD GUIDE'}
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className={`p-6 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} space-y-6`}>
          <div className="flex items-center justify-between">
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {editing ? (language === 'fr' ? 'MODIFIER LE GUIDE' : 'EDIT GUIDE') : (language === 'fr' ? 'NOUVEAU GUIDE' : 'NEW GUIDE')}
            </h2>
            <button
              onClick={() => { setEditing(null); setCreating(false); }}
              className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                NOM (FR) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nameFr}
                onChange={(e) => { setForm({ ...form, nameFr: e.target.value }); if (errors.nameFr) setErrors({ ...errors, nameFr: false }); }}
                placeholder="Vestes"
                className={`w-full px-4 py-3 border ${
                  errors.nameFr
                    ? 'border-red-500 ring-1 ring-red-500/40'
                    : darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'
                }`}
              />
              {errors.nameFr && (
                <p className="text-xs text-red-400 mt-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                  {language === 'fr' ? 'CHAMP OBLIGATOIRE' : 'REQUIRED FIELD'}
                </p>
              )}
            </div>
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                NOM (EN) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => { setForm({ ...form, nameEn: e.target.value }); if (errors.nameEn) setErrors({ ...errors, nameEn: false }); }}
                placeholder="Jackets"
                className={`w-full px-4 py-3 border ${
                  errors.nameEn
                    ? 'border-red-500 ring-1 ring-red-500/40'
                    : darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'
                }`}
              />
              {errors.nameEn && (
                <p className="text-xs text-red-400 mt-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                  {language === 'fr' ? 'CHAMP OBLIGATOIRE' : 'REQUIRED FIELD'}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {language === 'fr' ? 'CONSEILS (FR)' : 'TIPS (FR)'} <span className={darkMode ? 'text-white/30' : 'text-black/30'}>({language === 'fr' ? 'facultatif' : 'optional'})</span>
              </label>
              <textarea
                value={form.tipsFr}
                onChange={(e) => setForm({ ...form, tipsFr: e.target.value })}
                placeholder={language === 'fr' ? 'Nos vestes ont une coupe regular...' : ''}
                rows={2}
                className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {language === 'fr' ? 'CONSEILS (EN)' : 'TIPS (EN)'} <span className={darkMode ? 'text-white/30' : 'text-black/30'}>({language === 'fr' ? 'facultatif' : 'optional'})</span>
              </label>
              <textarea
                value={form.tipsEn}
                onChange={(e) => setForm({ ...form, tipsEn: e.target.value })}
                placeholder="Our jackets have a regular fit..."
                rows={2}
                className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
              />
            </div>
          </div>

          {/* Size table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {language === 'fr' ? 'TABLEAU DES MESURES' : 'MEASUREMENTS TABLE'} (cm) <span className={darkMode ? 'text-white/30' : 'text-black/30'}>({language === 'fr' ? 'facultatif' : 'optional'})</span>
              </label>
              <button
                onClick={addSizeRow}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/20 text-primary hover:bg-primary/30"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <Plus size={14} />
                {language === 'fr' ? 'LIGNE' : 'ROW'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${darkMode ? 'text-white' : 'text-black'}`}>
                <thead>
                  <tr className={darkMode ? 'bg-white/10' : 'bg-black/5'}>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? 'TAILLE' : 'SIZE'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? 'POITRINE' : 'CHEST'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? 'TAILLE' : 'WAIST'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? 'HANCHES' : 'HIPS'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? 'LONGUEUR' : 'LENGTH'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                      {language === 'fr' ? '\u00c9PAULES' : 'SHOULDERS'}
                    </th>
                    <th className="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.sizes.map((row: SizeRow, index: number) => (
                    <tr key={index} className={`border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      {['size', 'chest', 'waist', 'hips', 'length', 'shoulders'].map((field) => (
                        <td key={field} className="px-1 py-1">
                          <input
                            type="text"
                            value={(row as any)[field]}
                            onChange={(e) => updateSizeRow(index, field, e.target.value)}
                            placeholder={field === 'size' ? 'M' : '0'}
                            className={`w-full px-2 py-2 text-sm border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
                          />
                        </td>
                      ))}
                      <td className="px-1 py-1">
                        <button
                          onClick={() => removeSizeRow(index)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {saveError && (
              <div className="px-4 py-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                {saveError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <Save size={18} />
                {saving ? (language === 'fr' ? 'SAUVEGARDE...' : 'SAVING...') : (language === 'fr' ? 'SAUVEGARDER' : 'SAVE')}
              </button>
              <button
                onClick={() => { setEditing(null); setCreating(false); setErrors({}); setSaveError(null); }}
                className={`px-8 py-3 border ${darkMode ? 'border-white/20 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'ANNULER' : 'CANCEL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guides list */}
      {loading ? (
        <div className="text-center py-12">
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {language === 'fr' ? 'CHARGEMENT...' : 'LOADING...'}
          </p>
        </div>
      ) : guides.length === 0 && !isFormOpen ? (
        <div className={`text-center py-16 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <Ruler size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {language === 'fr' ? 'AUCUN GUIDE DES TAILLES' : 'NO SIZE GUIDES'}
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
            {language === 'fr' ? 'Cr\u00e9ez votre premier guide des tailles' : 'Create your first size guide'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className={`border ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <Ruler size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3
                      className="text-lg"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {language === 'fr' ? guide.nameFr : guide.nameEn}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {guide.categorySlug} {'\u2022'} {(guide.sizes as SizeRow[]).length} {language === 'fr' ? 'tailles' : 'sizes'} {'\u2022'} {guide.unit}
                    </p>
                  </div>
                  {/* Product count badge */}
                  <button
                    onClick={() => setExpandedGuideId(expandedGuideId === guide.id ? null : guide.id)}
                    className={`relative group px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all ${
                      (guide.products?.length || 0) > 0
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-black/5 text-black/40 hover:bg-black/10'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <Package size={12} />
                    {guide.products?.length || 0} {language === 'fr' ? 'PRODUITS' : 'PRODUCTS'}
                  </button>
                  {!guide.isActive && (
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {language === 'fr' ? 'INACTIF' : 'INACTIVE'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openAssignModal(guide.id)}
                    className={`px-3 py-2 text-xs flex items-center gap-1.5 border transition-all ${darkMode ? 'border-white/10 hover:border-primary hover:text-primary' : 'border-gray-200 hover:border-primary hover:text-primary'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <Package size={14} />
                    {language === 'fr' ? 'ASSIGNER' : 'ASSIGN'}
                  </button>
                  <button
                    onClick={() => startEdit(guide)}
                    className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-400/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded product list */}
              {expandedGuideId === guide.id && guide.products && guide.products.length > 0 && (
                <div className={`mx-4 mb-4 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-xs mb-2 ${darkMode ? 'text-white/40' : 'text-black/40'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {language === 'fr' ? 'PRODUITS UTILISANT CE GUIDE :' : 'PRODUCTS USING THIS GUIDE:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guide.products.map(p => (
                      <span key={p.id} className={`px-2 py-1 text-xs ${darkMode ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/70'}`}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className={`overflow-x-auto border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={darkMode ? 'bg-white/5' : 'bg-black/[0.02]'}>
                      <th className="px-4 py-2 text-left text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? 'TAILLE' : 'SIZE'}
                      </th>
                      <th className="px-4 py-2 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? 'POITRINE' : 'CHEST'}
                      </th>
                      <th className="px-4 py-2 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? 'TAILLE' : 'WAIST'}
                      </th>
                      <th className="px-4 py-2 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? 'HANCHES' : 'HIPS'}
                      </th>
                      <th className="px-4 py-2 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? 'LONGUEUR' : 'LENGTH'}
                      </th>
                      <th className="px-4 py-2 text-center text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? '\u00c9PAULES' : 'SHOULDERS'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(guide.sizes as SizeRow[]).map((row, i) => (
                      <tr key={i} className={`border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <td className="px-4 py-2 font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{row.size}</td>
                        <td className="px-4 py-2 text-center">{row.chest || '-'}</td>
                        <td className="px-4 py-2 text-center">{row.waist || '-'}</td>
                        <td className="px-4 py-2 text-center">{row.hips || '-'}</td>
                        <td className="px-4 py-2 text-center">{row.length || '-'}</td>
                        <td className="px-4 py-2 text-center">{row.shoulders || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Products Modal */}
      {assigningGuideId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col ${darkMode ? 'bg-black border border-white/20' : 'bg-white border border-gray-200'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {language === 'fr' ? 'ASSIGNER AUX PRODUITS' : 'ASSIGN TO PRODUCTS'}
              </h2>
              <button
                onClick={() => setAssigningGuideId(null)}
                className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allProducts.length === 0 ? (
                <p className={`text-center py-8 text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </p>
              ) : (
                allProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isAssignedElsewhere = product.sizeGuideId && product.sizeGuideId !== assigningGuideId;
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : darkMode ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center border ${isSelected ? 'bg-primary border-primary' : darkMode ? 'border-white/30' : 'border-gray-300'}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="flex-1 text-sm">{product.name}</span>
                      {isAssignedElsewhere && (
                        <span className={`text-xs px-2 py-0.5 ${darkMode ? 'bg-white/10 text-white/40' : 'bg-black/5 text-black/40'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                          {language === 'fr' ? 'AUTRE GUIDE' : 'OTHER GUIDE'}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className={`flex gap-3 p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={() => setAssigningGuideId(null)}
                className={`flex-1 py-3 border ${darkMode ? 'border-white/20 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'ANNULER' : 'CANCEL'}
              </button>
              <button
                onClick={handleAssignProducts}
                disabled={assignSaving}
                className="flex-1 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {assignSaving
                  ? (language === 'fr' ? 'SAUVEGARDE...' : 'SAVING...')
                  : `${language === 'fr' ? 'ASSIGNER' : 'ASSIGN'} (${selectedProductIds.length})`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
