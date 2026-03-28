'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Save, Eye, EyeOff, ImageIcon, Plus, Trash2, Loader2, AlertCircle, Gauge, ArrowRight } from 'lucide-react';
import { useStore } from '@/stores/useStore';

interface Contest {
  id: string;
  number: string;
  prizeName: string;
  prizeNameEn: string | null;
  prizeValue: number;
  purchaseAmount: number;
  description: string | null;
  descriptionEn: string | null;
  prizeImage: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  winnerId: string | null;
  winnerOrderId: string | null;
  drawnAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
}

type ContestFormData = {
  number: string;
  prizeName: string;
  prizeNameEn: string;
  prizeValue: number;
  purchaseAmount: number;
  description: string;
  descriptionEn: string;
  prizeImage: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

const defaultFormData: ContestFormData = {
  number: '',
  prizeName: '',
  prizeNameEn: '',
  prizeValue: 0,
  purchaseAmount: 0,
  description: '',
  descriptionEn: '',
  prizeImage: '/clothes/bonnet-face-noir.webp',
  isActive: true,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
};

export default function AdminContestsPage() {
  const { darkMode, language } = useStore();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContestFormData>({ ...defaultFormData });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/contests');
      if (!res.ok) {
        throw new Error(`Failed to fetch contests (${res.status})`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch contests');
      }
      // Normalize Decimal fields coming as strings from Prisma
      const normalized = (json.data.contests as Contest[]).map((c) => ({
        ...c,
        prizeValue: Number(c.prizeValue),
        purchaseAmount: Number(c.purchaseAmount),
      }));
      setContests(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleEdit = (contest: Contest) => {
    setEditingId(contest.id);
    setCreating(false);
    setFormData({
      number: contest.number,
      prizeName: contest.prizeName,
      prizeNameEn: contest.prizeNameEn || '',
      prizeValue: Number(contest.prizeValue),
      purchaseAmount: Number(contest.purchaseAmount),
      description: contest.description || '',
      descriptionEn: contest.descriptionEn || '',
      prizeImage: contest.prizeImage || '/clothes/bonnet-face-noir.webp',
      isActive: contest.isActive,
      startDate: contest.startDate ? new Date(contest.startDate).toISOString().slice(0, 10) : '',
      endDate: contest.endDate ? new Date(contest.endDate).toISOString().slice(0, 10) : '',
    });
  };

  const handleSave = async () => {
    if ((!editingId && !creating) || saving) return;
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        number: formData.number,
        prizeName: formData.prizeName,
        prizeNameEn: formData.prizeNameEn || undefined,
        prizeValue: formData.prizeValue,
        purchaseAmount: formData.purchaseAmount,
        description: formData.description || undefined,
        descriptionEn: formData.descriptionEn || undefined,
        prizeImage: formData.prizeImage || undefined,
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || null,
      };

      let res: Response;
      if (creating) {
        res = await fetch('/api/admin/contests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/contests/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to ${creating ? 'create' : 'update'} contest`);
      }

      setEditingId(null);
      setCreating(false);
      setFormData({ ...defaultFormData });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Refresh the list
      await fetchContests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setCreating(false);
    setFormData({ ...defaultFormData });
    setError(null);
  };

  const handleCreate = () => {
    setCreating(true);
    setEditingId(null);
    setFormData({ ...defaultFormData });
  };

  const toggleActive = async (contest: Contest) => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/contests/${contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !contest.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to toggle contest');
      }
      // Optimistic update
      setContests((prev) =>
        prev.map((c) => (c.id === contest.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (contestId: string) => {
    if (deleting) return;
    if (!confirm(language === 'fr' ? 'Supprimer ce concours ?' : 'Delete this contest?')) return;

    setDeleting(contestId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contests/${contestId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete contest');
      }
      await fetchContests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeleting(null);
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Numéro du concours' : 'Contest number'}
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
            placeholder="ex: #001"
          />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Statut' : 'Status'}
          </label>
          <select
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <option value="true">{language === 'fr' ? 'Actif' : 'Active'}</option>
            <option value="false">{language === 'fr' ? 'Inactif' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Nom du prix (FR)' : 'Prize name (FR)'}
          </label>
          <input
            type="text"
            value={formData.prizeName}
            onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Nom du prix (EN)' : 'Prize name (EN)'}
          </label>
          <input
            type="text"
            value={formData.prizeNameEn}
            onChange={(e) => setFormData({ ...formData, prizeNameEn: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Valeur du prix (€)' : 'Prize value (€)'}
          </label>
          <input
            type="number"
            value={formData.prizeValue}
            onChange={(e) => setFormData({ ...formData, prizeValue: Number(e.target.value) })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {language === 'fr' ? 'Montant d\'achat requis (€)' : 'Required purchase amount (€)'}
          </label>
          <input
            type="number"
            value={formData.purchaseAmount}
            onChange={(e) => setFormData({ ...formData, purchaseAmount: Number(e.target.value) })}
            className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
              darkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
          {language === 'fr' ? 'Description (FR)' : 'Description (FR)'}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
            darkMode
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
          {language === 'fr' ? 'Description (EN)' : 'Description (EN)'}
        </label>
        <textarea
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          rows={2}
          className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
            darkMode
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}
        />
      </div>

      {/* Prize Image Selection */}
      <div>
        <label className={`block text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
          <span className="flex items-center gap-2">
            <ImageIcon size={16} />
            {language === 'fr' ? 'Image du prix' : 'Prize Image'}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            '/clothes/bonnet-face-noir.webp',
            '/clothes/veste-face-noire.webp',
          ].map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setFormData({ ...formData, prizeImage: img })}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                formData.prizeImage === img
                  ? 'border-primary ring-2 ring-primary/30 scale-105'
                  : darkMode
                    ? 'border-white/10 hover:border-white/30'
                    : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className={`absolute inset-0 ${formData.prizeImage === img ? 'bg-primary/10' : 'bg-black/10'}`} />
              <Image
                src={img}
                alt={img.split('/').pop() || ''}
                fill
                className="object-contain p-1 transition-transform group-hover:scale-110"
                sizes="80px"
              />
              {formData.prizeImage === img && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {creating
            ? (language === 'fr' ? 'Créer' : 'Create')
            : (language === 'fr' ? 'Enregistrer' : 'Save')}
        </button>
        <button
          onClick={handleCancel}
          className={`px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {language === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-3 text-lg">
          {language === 'fr' ? 'Chargement des concours...' : 'Loading contests...'}
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
            <Trophy className="text-primary" size={24} />
          </div>
          <div>
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'GESTION DES CONCOURS' : 'CONTESTS MANAGEMENT'}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {language === 'fr'
                ? 'Modifiez les concours affichés sur la page d\'accueil'
                : 'Edit the contests displayed on the homepage'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {language === 'fr' ? 'Modifications enregistrées !' : 'Changes saved!'}
            </div>
          )}

          <Link
            href="/admin/gauge"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-white/10 hover:bg-white/20 text-white/70' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Gauge size={18} />
            {language === 'fr' ? 'Jauge' : 'Gauge'}
            <ArrowRight size={14} />
          </Link>

          {!creating && !editingId && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              {language === 'fr' ? 'Nouveau concours' : 'New contest'}
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            ✕
          </button>
        </div>
      )}

      {/* Create Form */}
      {creating && (
        <div className={`rounded-2xl border overflow-hidden ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-4 ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {language === 'fr' ? 'NOUVEAU CONCOURS' : 'NEW CONTEST'}
            </h3>
          </div>
          <div className="p-6">
            {renderForm()}
          </div>
        </div>
      )}

      {/* Contests Grid */}
      <div className="grid gap-6">
        {contests.length === 0 && !creating && (
          <div className={`text-center py-12 rounded-2xl border ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <Trophy className="mx-auto mb-3 text-primary/40" size={40} />
            <p className={darkMode ? 'text-white/50' : 'text-gray-500'}>
              {language === 'fr' ? 'Aucun concours' : 'No contests yet'}
            </p>
          </div>
        )}

        {contests.map((contest) => (
          <div
            key={contest.id}
            className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {/* Contest Header with Prize Image */}
            <div
              className={`p-4 flex items-center justify-between ${
                contest.isActive ? 'bg-primary' : darkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Prize Image Preview */}
                {contest.prizeImage && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
                    <Image
                      src={contest.prizeImage}
                      alt={language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                      fill
                      className="object-contain p-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      sizes="80px"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={`text-4xl font-bold ${contest.isActive ? 'text-white/30' : 'text-primary/30'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest.number}
                  </span>
                  <div>
                    <h3
                      className={`text-lg font-bold ${contest.isActive ? 'text-white' : ''}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                    </h3>
                    <p className={`text-sm ${contest.isActive ? 'text-white/70' : darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      {language === 'fr' ? 'Valeur' : 'Value'}: {contest.prizeValue}€
                      {contest._count ? ` | ${contest._count.entries} ${language === 'fr' ? 'participations' : 'entries'}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(contest)}
                  className={`p-2 rounded-lg transition-colors ${
                    contest.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={contest.isActive ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                >
                  {contest.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(contest.id)}
                  disabled={deleting === contest.id}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  title={language === 'fr' ? 'Supprimer' : 'Delete'}
                >
                  {deleting === contest.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>

            {/* Contest Form */}
            <div className="p-6">
              {editingId === contest.id ? (
                renderForm()
              ) : (
                <div className="flex gap-6">
                  {/* Large Prize Image Display */}
                  {contest.prizeImage && (
                    <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden group">
                      <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-white/5 to-black/20' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Image
                        src={contest.prizeImage}
                        alt={language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}
                        fill
                        className="object-contain p-2 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                        sizes="160px"
                      />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className={`text-[10px] uppercase tracking-wider text-center py-1 rounded-full ${
                          darkMode ? 'bg-white/10 text-white/70' : 'bg-black/10 text-gray-600'
                        }`}>
                          {language === 'fr' ? 'Aperçu du prix' : 'Prize preview'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contest Details */}
                  <div className="flex-1 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Prix' : 'Prize'}
                        </p>
                        <p className="font-medium">{language === 'fr' ? contest.prizeName : (contest.prizeNameEn || contest.prizeName)}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Valeur' : 'Value'}
                        </p>
                        <p className="font-medium">{contest.prizeValue}€</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Montant requis' : 'Required amount'}
                        </p>
                        <p className="font-medium">{contest.purchaseAmount}€</p>
                      </div>
                    </div>

                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        Description
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? (contest.description || '-') : (contest.descriptionEn || contest.description || '-')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEdit(contest)}
                      className={`mt-2 px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview hint */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {language === 'fr'
            ? 'Les modifications sont automatiquement visibles sur la page d\'accueil après enregistrement.'
            : 'Changes are automatically visible on the homepage after saving.'}
        </p>
      </div>
    </div>
  );
}
