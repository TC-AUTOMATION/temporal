'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, WashingMachine, Package, Check } from 'lucide-react';
import { useStore } from '@/stores/useStore';

interface CareGuide {
  id: string;
  categorySlug: string;
  nameFr: string;
  nameEn: string;
  instructionsFr: string;
  instructionsEn: string;
  iconSymbols: { symbol: string; labelFr: string; labelEn: string }[];
  sortOrder: number;
  isActive: boolean;
  products?: { id: string; name: string }[];
}

const WASH_SYMBOLS = [
  { symbol: 'wash-30', labelFr: 'Lavage 30\u00b0C', labelEn: 'Wash 30\u00b0C' },
  { symbol: 'wash-40', labelFr: 'Lavage 40\u00b0C', labelEn: 'Wash 40\u00b0C' },
  { symbol: 'hand-wash', labelFr: 'Lavage \u00e0 la main', labelEn: 'Hand wash' },
  { symbol: 'no-bleach', labelFr: 'Ne pas blanchir', labelEn: 'Do not bleach' },
  { symbol: 'no-tumble-dry', labelFr: 'Ne pas s\u00e9cher au s\u00e8che-linge', labelEn: 'Do not tumble dry' },
  { symbol: 'flat-dry', labelFr: 'S\u00e9chage \u00e0 plat', labelEn: 'Flat dry' },
  { symbol: 'air-dry', labelFr: 'S\u00e9chage \u00e0 l\'air libre', labelEn: 'Air dry' },
  { symbol: 'iron-low', labelFr: 'Repasser \u00e0 basse temp\u00e9rature', labelEn: 'Iron at low temperature' },
  { symbol: 'no-iron', labelFr: 'Ne pas repasser', labelEn: 'Do not iron' },
  { symbol: 'iron-reverse', labelFr: 'Repasser \u00e0 l\'envers', labelEn: 'Iron inside out' },
  { symbol: 'wash-reverse', labelFr: 'Retourner avant lavage', labelEn: 'Turn inside out before washing' },
  { symbol: 'no-softener', labelFr: 'Ne pas utiliser d\'adoucissant', labelEn: 'Do not use fabric softener' },
  { symbol: 'no-dry-clean', labelFr: 'Ne pas nettoyer \u00e0 sec', labelEn: 'Do not dry clean' },
];

const emptyGuide = {
  categorySlug: '',
  nameFr: '',
  nameEn: '',
  instructionsFr: '',
  instructionsEn: '',
  iconSymbols: [] as { symbol: string; labelFr: string; labelEn: string }[],
  sortOrder: 0,
  isActive: true,
};

export default function CareGuidesAdminPage() {
  const { darkMode, language } = useStore();
  const [guides, setGuides] = useState<CareGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>(emptyGuide);
  const [saving, setSaving] = useState(false);
  const [assigningGuideId, setAssigningGuideId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string; careGuideId?: string | null }[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/admin/care-guides', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setGuides(data.data);
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
        setAllProducts(data.data.products.map((p: any) => ({ id: p.id, name: p.name, careGuideId: p.careGuideId })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing, ...form } : form;
      const res = await fetch('/api/admin/care-guides', {
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
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer ce guide ?' : 'Delete this guide?')) return;
    try {
      await fetch(`/api/admin/care-guides?id=${id}`, { method: 'DELETE' });
      await fetchGuides();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSymbol = (sym: typeof WASH_SYMBOLS[0]) => {
    const exists = form.iconSymbols.find((s: any) => s.symbol === sym.symbol);
    if (exists) {
      setForm({ ...form, iconSymbols: form.iconSymbols.filter((s: any) => s.symbol !== sym.symbol) });
    } else {
      setForm({ ...form, iconSymbols: [...form.iconSymbols, sym] });
    }
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
      // Get current products linked to this guide
      const guide = guides.find(g => g.id === assigningGuideId);
      const currentIds = guide?.products?.map(p => p.id) || [];

      // Products to add (newly selected)
      const toAdd = selectedProductIds.filter(id => !currentIds.includes(id));
      // Products to remove (deselected)
      const toRemove = currentIds.filter(id => !selectedProductIds.includes(id));

      // Update each product
      const updates = [
        ...toAdd.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ careGuideId: assigningGuideId }),
          })
        ),
        ...toRemove.map(id =>
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ careGuideId: null }),
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
          <WashingMachine size={28} className="text-primary" />
          <h1 className="text-3xl" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {language === 'fr' ? 'GUIDES DE LAVAGE' : 'CARE GUIDES'}
          </h1>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setForm({ ...emptyGuide, iconSymbols: [] }); }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90"
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
            <h2 className="text-xl" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {editing ? (language === 'fr' ? 'MODIFIER LE GUIDE' : 'EDIT GUIDE') : (language === 'fr' ? 'NOUVEAU GUIDE' : 'NEW GUIDE')}
            </h2>
            <button onClick={() => { setEditing(null); setCreating(false); }} className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>SLUG CAT&Eacute;GORIE</label>
              <input type="text" value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} placeholder="vestes, tshirts..." className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>ORDRE</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>NOM (FR)</label>
              <input type="text" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} placeholder="Vestes" className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>NOM (EN)</label>
              <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Jackets" className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>INSTRUCTIONS (FR)</label>
              <textarea value={form.instructionsFr} onChange={(e) => setForm({ ...form, instructionsFr: e.target.value })} rows={4} placeholder="Lavage machine 30\u00b0C..." className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>INSTRUCTIONS (EN)</label>
              <textarea value={form.instructionsEn} onChange={(e) => setForm({ ...form, instructionsEn: e.target.value })} rows={4} placeholder="Machine wash 30\u00b0C..." className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
          </div>

          {/* Wash symbols picker */}
          <div>
            <label className={`text-xs mb-3 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {language === 'fr' ? 'SYMBOLES D\'ENTRETIEN' : 'CARE SYMBOLS'}
            </label>
            <div className="flex flex-wrap gap-2">
              {WASH_SYMBOLS.map((sym) => {
                const isSelected = form.iconSymbols.some((s: any) => s.symbol === sym.symbol);
                return (
                  <button
                    key={sym.symbol}
                    onClick={() => toggleSymbol(sym)}
                    className={`px-3 py-2 text-xs border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : darkMode ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {language === 'fr' ? sym.labelFr : sym.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 accent-primary" />
            <label style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>{language === 'fr' ? 'ACTIF' : 'ACTIVE'}</label>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              <Save size={18} />
              {saving ? (language === 'fr' ? 'SAUVEGARDE...' : 'SAVING...') : (language === 'fr' ? 'SAUVEGARDER' : 'SAVE')}
            </button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className={`px-8 py-3 border ${darkMode ? 'border-white/20 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {language === 'fr' ? 'ANNULER' : 'CANCEL'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>{language === 'fr' ? 'CHARGEMENT...' : 'LOADING...'}</p>
        </div>
      ) : guides.length === 0 && !isFormOpen ? (
        <div className={`text-center py-16 border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <WashingMachine size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>{language === 'fr' ? 'AUCUN GUIDE DE LAVAGE' : 'NO CARE GUIDES'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => (
            <div key={guide.id} className={`border p-4 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <WashingMachine size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {language === 'fr' ? guide.nameFr : guide.nameEn}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {guide.categorySlug} {'\u2022'} {(guide.iconSymbols as any[])?.length || 0} {language === 'fr' ? 'symboles' : 'symbols'}
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
                    onClick={() => { setEditing(guide.id); setCreating(false); setForm({ categorySlug: guide.categorySlug, nameFr: guide.nameFr, nameEn: guide.nameEn, instructionsFr: guide.instructionsFr, instructionsEn: guide.instructionsEn, iconSymbols: guide.iconSymbols || [], sortOrder: guide.sortOrder, isActive: guide.isActive }); }}
                    className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(guide.id)} className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-400/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* Expanded product list */}
              {expandedGuideId === guide.id && guide.products && guide.products.length > 0 && (
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
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
              <p className={`mt-3 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr' ? guide.instructionsFr : guide.instructionsEn}
              </p>
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
                  const isAssignedElsewhere = product.careGuideId && product.careGuideId !== assigningGuideId;
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
