'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gauge, Save, Plus, Trash2, Loader2, AlertCircle, Eye, Gift, Truck } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import TemporalStar from '@/components/ui/TemporalStar';

interface GaugeTier {
  id: string;
  threshold: number;
  labelFr: string;
  labelEn: string;
  contestId: string | null;
  type: 'gift' | 'shipping' | 'other';
  sortOrder: number;
}

interface GaugeConfig {
  maxAmount: number;
  tiers: GaugeTier[];
}

const DEFAULT_CONFIG: GaugeConfig = {
  maxAmount: 250,
  tiers: [
    { id: 'tier-1', threshold: 70, labelFr: 'Bonnet', labelEn: 'Beanie', contestId: null, type: 'gift', sortOrder: 0 },
    { id: 'tier-2', threshold: 100, labelFr: 'Livraison gratuite', labelEn: 'Free shipping', contestId: null, type: 'shipping', sortOrder: 1 },
    { id: 'tier-3', threshold: 150, labelFr: 'Veste', labelEn: 'Jacket', contestId: null, type: 'gift', sortOrder: 2 },
  ],
};

function generateTierId() {
  return 'tier-' + Math.random().toString(36).substring(2, 10);
}

export default function AdminGaugePage() {
  const { darkMode, language } = useStore();
  const [config, setConfig] = useState<GaugeConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAmount, setPreviewAmount] = useState(120);

  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/gauge');
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const cfg = json.data.config as GaugeConfig;
        // Add type field if missing (migration from old format)
        cfg.tiers = cfg.tiers.map(t => ({
          ...t,
          type: t.type || (t.labelFr?.toLowerCase().includes('livraison') ? 'shipping' : 'gift'),
        }));
        setConfig(cfg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      // Auto-calculate maxAmount: last tier + 30% padding
      const maxTier = Math.max(...config.tiers.map(t => t.threshold), 0);
      const autoMax = Math.ceil(maxTier * 1.3 / 10) * 10; // Round up to nearest 10

      const saveConfig = { ...config, maxAmount: autoMax };

      const res = await fetch('/api/admin/gauge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveConfig),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur');
      if (json.data?.config) setConfig(json.data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const addTier = () => {
    const maxThreshold = config.tiers.length > 0 ? Math.max(...config.tiers.map(t => t.threshold)) : 0;
    setConfig({
      ...config,
      tiers: [...config.tiers, {
        id: generateTierId(),
        threshold: maxThreshold + 50,
        labelFr: 'Nouveau palier',
        labelEn: 'New tier',
        contestId: null,
        type: 'gift',
        sortOrder: config.tiers.length,
      }],
    });
  };

  const removeTier = (tierId: string) => {
    if (config.tiers.length <= 1) return;
    setConfig({ ...config, tiers: config.tiers.filter(t => t.id !== tierId) });
  };

  const updateTier = (tierId: string, updates: Partial<GaugeTier>) => {
    setConfig({ ...config, tiers: config.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t) });
  };

  const sortedTiers = [...config.tiers].sort((a, b) => a.threshold - b.threshold);

  // Auto maxAmount for preview
  const autoMaxAmount = Math.max(...config.tiers.map(t => t.threshold), 100) * 1.3;
  const maxSlider = Math.ceil(autoMaxAmount / 10) * 10;

  // Preview: gauge fills up to the LAST reached tier, not to maxAmount
  const getGaugeFillPercent = (amount: number) => {
    const lastReachedTier = [...sortedTiers].reverse().find(t => amount >= t.threshold);
    if (!lastReachedTier) {
      // Not reached first tier yet - show proportional to first tier
      if (sortedTiers.length > 0) {
        return Math.min((amount / sortedTiers[0].threshold) * getTierPosition(sortedTiers[0].threshold), getTierPosition(sortedTiers[0].threshold));
      }
      return 0;
    }
    // Reached a tier - fill up to that tier's position
    const tierPos = getTierPosition(lastReachedTier.threshold);
    // If between two tiers, interpolate
    const tierIdx = sortedTiers.indexOf(lastReachedTier);
    const nextTier = sortedTiers[tierIdx + 1];
    if (nextTier && amount < nextTier.threshold) {
      const progress = (amount - lastReachedTier.threshold) / (nextTier.threshold - lastReachedTier.threshold);
      const nextPos = getTierPosition(nextTier.threshold);
      return tierPos + progress * (nextPos - tierPos);
    }
    return tierPos;
  };

  const getTierPosition = (threshold: number) => ((threshold / maxSlider) * 100);
  const isTierReached = (threshold: number) => previewAmount >= threshold;
  const previewLevel = getGaugeFillPercent(previewAmount);

  const t = {
    title: language === 'fr' ? 'JAUGE PANIER' : 'CART GAUGE',
    subtitle: language === 'fr' ? 'Configurez les paliers de recompenses affiches sur le site' : 'Configure reward tiers displayed on the site',
    tiers: language === 'fr' ? 'PALIERS' : 'TIERS',
    add: language === 'fr' ? 'Ajouter' : 'Add',
    save: language === 'fr' ? 'ENREGISTRER' : 'SAVE',
    saved: language === 'fr' ? 'Enregistre !' : 'Saved!',
    preview: language === 'fr' ? 'APERCU' : 'PREVIEW',
    simulated: language === 'fr' ? 'Montant simule' : 'Simulated amount',
    threshold: language === 'fr' ? 'Seuil (€)' : 'Threshold (€)',
    labelFr: 'Label (FR)',
    labelEn: 'Label (EN)',
    type: language === 'fr' ? 'Type' : 'Type',
    typeGift: language === 'fr' ? 'Cadeau' : 'Gift',
    typeShipping: language === 'fr' ? 'Livraison gratuite' : 'Free shipping',
    typeOther: language === 'fr' ? 'Autre' : 'Other',
    tier: language === 'fr' ? 'PALIER' : 'TIER',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gauge className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.title}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">{t.saved}</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {t.save}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">&times;</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tiers config */}
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {t.tiers}
              </h3>
              <button
                onClick={addTier}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
              >
                <Plus size={16} /> {t.add}
              </button>
            </div>

            <div className="space-y-4">
              {sortedTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`p-4 rounded-xl border ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-primary/50 font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {tier.type === 'shipping' ? (
                          <Truck size={14} className="text-blue-400" />
                        ) : (
                          <Gift size={14} className="text-primary" />
                        )}
                        <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                          {t.tier} {tier.threshold}€
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTier(tier.id)}
                      disabled={config.tiers.length <= 1}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                        darkMode ? 'hover:bg-red-500/20 text-white/50 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                      title={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Threshold */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.threshold}</label>
                      <input
                        type="number"
                        value={tier.threshold}
                        onChange={e => updateTier(tier.id, { threshold: Number(e.target.value) })}
                        min={0}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.type}</label>
                      <select
                        value={tier.type || 'gift'}
                        onChange={e => {
                          const type = e.target.value as GaugeTier['type'];
                          const updates: Partial<GaugeTier> = { type };
                          if (type === 'shipping') {
                            updates.labelFr = 'Livraison gratuite';
                            updates.labelEn = 'Free shipping';
                          }
                          updateTier(tier.id, updates);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <option value="gift" className={darkMode ? 'bg-zinc-900' : ''}>{t.typeGift}</option>
                        <option value="shipping" className={darkMode ? 'bg-zinc-900' : ''}>{t.typeShipping}</option>
                        <option value="other" className={darkMode ? 'bg-zinc-900' : ''}>{t.typeOther}</option>
                      </select>
                    </div>

                    {/* Label FR */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.labelFr}</label>
                      <input
                        type="text"
                        value={tier.labelFr}
                        onChange={e => updateTier(tier.id, { labelFr: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Label EN */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.labelEn}</label>
                      <input
                        type="text"
                        value={tier.labelEn}
                        onChange={e => updateTier(tier.id, { labelEn: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className={`p-6 rounded-2xl border sticky top-28 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-primary" />
              <h3 className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {t.preview}
              </h3>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <label className={`block text-xs mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.simulated}: <strong>{previewAmount}€</strong>
              </label>
              <input
                type="range"
                min={0}
                max={maxSlider}
                value={previewAmount}
                onChange={e => setPreviewAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Gauge preview */}
            <div className="flex justify-center">
              <div className="flex items-start gap-3">
                {/* Stars */}
                <div className="relative h-[28rem] flex flex-col justify-end">
                  {sortedTiers.map(tier => (
                    <div
                      key={tier.id}
                      className={`absolute right-0 flex items-center justify-center transition-all duration-500 ${
                        isTierReached(tier.threshold) ? 'opacity-100' : 'opacity-50 grayscale'
                      }`}
                      style={{ bottom: `${getTierPosition(tier.threshold)}%`, transform: 'translateY(50%)' }}
                    >
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TemporalStar
                            size={44}
                            className={`transition-all duration-500 ${isTierReached(tier.threshold) ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.9)]' : ''}`}
                            color={isTierReached(tier.threshold) ? '#8b5cf6' : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                            strokeWidth={0}
                          />
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          <span
                            className={`text-xs font-bold transition-all duration-500 ${
                              isTierReached(tier.threshold) ? 'text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]' : darkMode ? 'text-white/40' : 'text-black/30'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {tier.threshold}€
                          </span>
                          <span
                            className={`text-[6px] uppercase tracking-wider transition-all duration-500 leading-tight ${
                              isTierReached(tier.threshold) ? 'text-white/90 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]' : darkMode ? 'text-white/30' : 'text-black/20'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {tier.type === 'shipping' ? (
                              <span className="flex items-center gap-0.5">
                                <Truck size={6} />
                                {language === 'fr' ? tier.labelFr : tier.labelEn}
                              </span>
                            ) : (
                              <>{language === 'fr' ? tier.labelFr : tier.labelEn}</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar */}
                <div className="relative w-10 h-[28rem]">
                  <div className={`absolute inset-0 rounded-full border-[3px] border-primary backdrop-blur-sm ${darkMode ? 'bg-black/50' : 'bg-white/80'}`} />
                  <div className="absolute inset-[3px] rounded-full overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                      style={{ height: `${previewLevel}%`, backgroundColor: '#6D28D9' }}
                    />
                  </div>
                  {sortedTiers.map(tier => (
                    <div
                      key={tier.id}
                      className={`absolute left-0 right-0 h-[2px] transition-all duration-500 ${
                        isTierReached(tier.threshold) ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : darkMode ? 'bg-white/70' : 'bg-primary/50'
                      }`}
                      style={{ bottom: `${getTierPosition(tier.threshold)}%` }}
                    />
                  ))}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-2 w-1.5 h-8 bg-white/30 rounded-full blur-[1px]" />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2">
              {sortedTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                    isTierReached(tier.threshold) ? 'bg-primary/20 text-primary' : darkMode ? 'bg-white/5 text-white/50' : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <span className="flex items-center gap-1.5" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    {tier.type === 'shipping' ? <Truck size={12} /> : <Gift size={12} />}
                    {tier.threshold}€
                  </span>
                  <span>{language === 'fr' ? tier.labelFr : tier.labelEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
