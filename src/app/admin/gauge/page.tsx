'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Gauge, Save, Plus, Trash2, Loader2, AlertCircle, Trophy, ArrowRight, Eye } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import TemporalStar from '@/components/ui/TemporalStar';

interface GaugeTier {
  id: string;
  threshold: number;
  labelFr: string;
  labelEn: string;
  contestId: string | null;
  sortOrder: number;
}

interface GaugeConfig {
  maxAmount: number;
  tiers: GaugeTier[];
}

interface ContestOption {
  id: string;
  number: string;
  prizeName: string;
  prizeNameEn: string | null;
  purchaseAmount: number;
}

const DEFAULT_CONFIG: GaugeConfig = {
  maxAmount: 250,
  tiers: [
    { id: 'tier-1', threshold: 80, labelFr: 'Livraison gratuite', labelEn: 'Free shipping', contestId: null, sortOrder: 0 },
    { id: 'tier-2', threshold: 150, labelFr: 'Bonnet', labelEn: 'Beanie', contestId: null, sortOrder: 1 },
    { id: 'tier-3', threshold: 200, labelFr: 'Veste', labelEn: 'Jacket', contestId: null, sortOrder: 2 },
  ],
};

function generateTierId() {
  return 'tier-' + Math.random().toString(36).substring(2, 10);
}

export default function AdminGaugePage() {
  const { darkMode, language } = useStore();
  const [config, setConfig] = useState<GaugeConfig>(DEFAULT_CONFIG);
  const [contests, setContests] = useState<ContestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAmount, setPreviewAmount] = useState(120);

  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/gauge');
      if (!res.ok) {
        throw new Error(`Failed to fetch gauge config (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data.config);
        if (json.data.contests) {
          setContests(json.data.contests);
        }
      } else {
        throw new Error(json.error || 'Unexpected response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gauge config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/gauge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save gauge config');
      }
      if (json.data?.config) {
        setConfig(json.data.config);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const addTier = () => {
    const maxThreshold = config.tiers.length > 0
      ? Math.max(...config.tiers.map(t => t.threshold))
      : 0;
    const newTier: GaugeTier = {
      id: generateTierId(),
      threshold: maxThreshold + 50,
      labelFr: 'Nouveau palier',
      labelEn: 'New tier',
      contestId: null,
      sortOrder: config.tiers.length,
    };
    setConfig({
      ...config,
      tiers: [...config.tiers, newTier],
    });
  };

  const removeTier = (tierId: string) => {
    if (config.tiers.length <= 1) return;
    setConfig({
      ...config,
      tiers: config.tiers.filter(t => t.id !== tierId),
    });
  };

  const updateTier = (tierId: string, updates: Partial<GaugeTier>) => {
    setConfig({
      ...config,
      tiers: config.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t),
    });
  };

  // Sort tiers by threshold for display
  const sortedTiers = [...config.tiers].sort((a, b) => a.threshold - b.threshold);

  // Preview gauge calculations
  const previewLevel = Math.min((previewAmount / config.maxAmount) * 100, 100);
  const getTierPosition = (threshold: number) => ((threshold / config.maxAmount) * 100);
  const isTierReached = (threshold: number) => previewAmount >= threshold;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-3 text-lg">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </span>
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
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'JAUGE CONCOURS' : 'CONTEST GAUGE'}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {language === 'fr'
                ? 'Configurez les paliers de la jauge affichée sur la page d\'accueil'
                : 'Configure the gauge tiers displayed on the homepage'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {language === 'fr' ? 'Enregistre !' : 'Saved!'}
            </div>
          )}
          <Link
            href="/admin/contests"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-white/10 hover:bg-white/20 text-white/70' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <Trophy size={18} />
            {language === 'fr' ? 'CONCOURS' : 'CONTESTS'}
            <ArrowRight size={14} />
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {language === 'fr' ? 'ENREGISTRER' : 'SAVE'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            &times;
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Tier configuration */}
        <div className="lg:col-span-2 space-y-4">
          {/* Max Amount */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3
              className="text-lg mb-4"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'CONFIGURATION GENERALE' : 'GENERAL CONFIGURATION'}
            </h3>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                {language === 'fr' ? 'Montant maximum de la jauge (€)' : 'Gauge maximum amount (€)'}
              </label>
              <input
                type="number"
                value={config.maxAmount}
                onChange={(e) => setConfig({ ...config, maxAmount: Number(e.target.value) })}
                min={1}
                className={`w-full max-w-xs px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                {language === 'fr'
                  ? 'Valeur qui correspond a 100% de remplissage de la jauge'
                  : 'Value that corresponds to 100% gauge fill'}
              </p>
            </div>
          </div>

          {/* Tiers */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'PALIERS' : 'TIERS'}
              </h3>
              <button
                onClick={addTier}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
              >
                <Plus size={16} />
                {language === 'fr' ? 'Ajouter' : 'Add'}
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
                      <span
                        className="text-2xl text-primary/50 font-bold"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        #{index + 1}
                      </span>
                      <span
                        className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {language === 'fr' ? 'PALIER' : 'TIER'} {tier.threshold}€
                      </span>
                    </div>
                    <button
                      onClick={() => removeTier(tier.id)}
                      disabled={config.tiers.length <= 1}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        darkMode ? 'hover:bg-red-500/20 text-white/50 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                      title={language === 'fr' ? 'Supprimer' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Threshold */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {language === 'fr' ? 'Seuil (€)' : 'Threshold (€)'}
                      </label>
                      <input
                        type="number"
                        value={tier.threshold}
                        onChange={(e) => updateTier(tier.id, { threshold: Number(e.target.value) })}
                        min={0}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Label FR */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {language === 'fr' ? 'Label (FR)' : 'Label (FR)'}
                      </label>
                      <input
                        type="text"
                        value={tier.labelFr}
                        onChange={(e) => updateTier(tier.id, { labelFr: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Label EN */}
                    <div>
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {language === 'fr' ? 'Label (EN)' : 'Label (EN)'}
                      </label>
                      <input
                        type="text"
                        value={tier.labelEn}
                        onChange={(e) => updateTier(tier.id, { labelEn: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Contest link */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={`block text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {language === 'fr' ? 'Concours associe' : 'Linked contest'}
                      </label>
                      <select
                        value={tier.contestId || ''}
                        onChange={(e) => updateTier(tier.id, { contestId: e.target.value || null })}
                        className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary text-sm ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <option value="">
                          {language === 'fr' ? '-- Aucun concours --' : '-- No contest --'}
                        </option>
                        {contests.map((contest) => (
                          <option key={contest.id} value={contest.id}>
                            {contest.number} - {language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)} ({contest.purchaseAmount}€)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Preview */}
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border sticky top-28 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-primary" />
              <h3
                className="text-lg"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'APERCU' : 'PREVIEW'}
              </h3>
            </div>

            {/* Preview amount slider */}
            <div className="mb-6">
              <label className={`block text-xs mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {language === 'fr' ? 'Montant simulé' : 'Simulated amount'}: {previewAmount}€
              </label>
              <input
                type="range"
                min={0}
                max={config.maxAmount}
                value={previewAmount}
                onChange={(e) => setPreviewAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={darkMode ? 'text-white/40' : 'text-gray-400'}>0€</span>
                <span className={darkMode ? 'text-white/40' : 'text-gray-400'}>{config.maxAmount}€</span>
              </div>
            </div>

            {/* Gauge preview */}
            <div className="flex justify-center">
              <div className="flex items-start gap-3">
                {/* Tier stars */}
                <div className="relative h-52 flex flex-col justify-end">
                  {sortedTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`absolute right-0 flex items-center justify-center transition-all duration-500 ${
                        isTierReached(tier.threshold)
                          ? 'opacity-100'
                          : 'opacity-50 grayscale'
                      }`}
                      style={{ bottom: `${getTierPosition(tier.threshold)}%`, transform: 'translateY(50%)' }}
                    >
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TemporalStar
                            size={56}
                            className={`transition-all duration-500 ${
                              isTierReached(tier.threshold) ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.9)]' : ''
                            }`}
                            color={isTierReached(tier.threshold) ? '#8b5cf6' : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                            strokeWidth={0}
                          />
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          <span
                            className={`text-sm font-bold transition-all duration-500 ${
                              isTierReached(tier.threshold)
                                ? 'text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]'
                                : darkMode
                                  ? 'text-white/40'
                                  : 'text-black/30'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {tier.threshold}€
                          </span>
                          <span
                            className={`text-[7px] uppercase tracking-wider transition-all duration-500 leading-tight ${
                              isTierReached(tier.threshold)
                                ? 'text-white/90 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                                : darkMode
                                  ? 'text-white/30'
                                  : 'text-black/20'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {language === 'fr' ? tier.labelFr : tier.labelEn}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gauge bar */}
                <div className="relative w-10 h-52">
                  <div className={`absolute inset-0 rounded-full border-[3px] border-primary backdrop-blur-sm ${darkMode ? 'bg-black/50' : 'bg-white/80'}`} />
                  <div className="absolute inset-[3px] rounded-full overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                      style={{ height: `${previewLevel}%`, backgroundColor: '#6D28D9' }}
                    />
                  </div>

                  {/* Tier markers */}
                  {sortedTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`absolute left-0 right-0 h-[2px] transition-all duration-500 ${
                        isTierReached(tier.threshold)
                          ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                          : darkMode
                            ? 'bg-white/70'
                            : 'bg-primary/50'
                      }`}
                      style={{ bottom: `${getTierPosition(tier.threshold)}%` }}
                    />
                  ))}

                  {/* Glass reflection */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-2 w-1.5 h-8 bg-white/30 rounded-full blur-[1px]" />
                </div>
              </div>
            </div>

            {/* Preview legend */}
            <div className="mt-6 space-y-2">
              {sortedTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                    isTierReached(tier.threshold)
                      ? 'bg-primary/20 text-primary'
                      : darkMode
                        ? 'bg-white/5 text-white/50'
                        : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    {language === 'fr' ? `Palier ${index + 1}` : `Tier ${index + 1}`}: {tier.threshold}€
                  </span>
                  <span>{language === 'fr' ? tier.labelFr : tier.labelEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {language === 'fr'
            ? 'Les modifications de la jauge sont immediatement visibles sur la page d\'accueil apres enregistrement. La jauge est affichee dans la section Hero.'
            : 'Gauge changes are immediately visible on the homepage after saving. The gauge is displayed in the Hero section.'}
        </p>
      </div>
    </div>
  );
}
