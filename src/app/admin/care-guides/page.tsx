'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, WashingMachine } from 'lucide-react';
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
}

const WASH_SYMBOLS = [
  { symbol: 'wash-30', labelFr: 'Lavage 30°C', labelEn: 'Wash 30°C' },
  { symbol: 'wash-40', labelFr: 'Lavage 40°C', labelEn: 'Wash 40°C' },
  { symbol: 'hand-wash', labelFr: 'Lavage à la main', labelEn: 'Hand wash' },
  { symbol: 'no-bleach', labelFr: 'Ne pas blanchir', labelEn: 'Do not bleach' },
  { symbol: 'no-tumble-dry', labelFr: 'Ne pas sécher au sèche-linge', labelEn: 'Do not tumble dry' },
  { symbol: 'flat-dry', labelFr: 'Séchage à plat', labelEn: 'Flat dry' },
  { symbol: 'air-dry', labelFr: 'Séchage à l\'air libre', labelEn: 'Air dry' },
  { symbol: 'iron-low', labelFr: 'Repasser à basse température', labelEn: 'Iron at low temperature' },
  { symbol: 'no-iron', labelFr: 'Ne pas repasser', labelEn: 'Do not iron' },
  { symbol: 'iron-reverse', labelFr: 'Repasser à l\'envers', labelEn: 'Iron inside out' },
  { symbol: 'wash-reverse', labelFr: 'Retourner avant lavage', labelEn: 'Turn inside out before washing' },
  { symbol: 'no-softener', labelFr: 'Ne pas utiliser d\'adoucissant', labelEn: 'Do not use fabric softener' },
  { symbol: 'no-dry-clean', labelFr: 'Ne pas nettoyer à sec', labelEn: 'Do not dry clean' },
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
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>SLUG CATÉGORIE</label>
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
              <textarea value={form.instructionsFr} onChange={(e) => setForm({ ...form, instructionsFr: e.target.value })} rows={4} placeholder="Lavage machine 30°C..." className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`text-xs mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>INSTRUCTIONS (EN)</label>
              <textarea value={form.instructionsEn} onChange={(e) => setForm({ ...form, instructionsEn: e.target.value })} rows={4} placeholder="Machine wash 30°C..." className={`w-full px-4 py-3 border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`} />
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
                      {guide.categorySlug} • {(guide.iconSymbols as any[])?.length || 0} {language === 'fr' ? 'symboles' : 'symbols'}
                    </p>
                  </div>
                  {!guide.isActive && (
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {language === 'fr' ? 'INACTIF' : 'INACTIVE'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
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
              <p className={`mt-3 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr' ? guide.instructionsFr : guide.instructionsEn}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
