'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Plus, Save, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';

interface MarqueeMessage {
  id: string;
  textFr: string;
  textEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMarqueePage() {
  const { darkMode, language } = useStore();
  const [marqueeItems, setMarqueeItems] = useState<MarqueeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MarqueeMessage>>({});
  const [saved, setSaved] = useState(false);
  const [newItem, setNewItem] = useState({ textFr: '', textEn: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/marquee');
      if (!res.ok) {
        throw new Error(`Failed to fetch marquee messages (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data?.messages) {
        setMarqueeItems(json.data.messages);
      } else {
        throw new Error(json.error || 'Unexpected response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marquee messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = (item: MarqueeMessage) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    if (!editingId || !formData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/marquee/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textFr: formData.textFr,
          textEn: formData.textEn,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Failed to update message (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data?.message) {
        setMarqueeItems((prev) =>
          prev.map((m) => (m.id === editingId ? json.data.message : m))
        );
      }
      setEditingId(null);
      setFormData({});
      showSavedMessage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleAdd = async () => {
    if (!newItem.textFr.trim() || !newItem.textEn.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/marquee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textFr: newItem.textFr.trim(),
          textEn: newItem.textEn.trim(),
          isActive: true,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Failed to create message (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data?.message) {
        setMarqueeItems((prev) => [...prev, json.data.message]);
      }
      setNewItem({ textFr: '', textEn: '' });
      setShowAddForm(false);
      showSavedMessage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add message');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (marqueeItems.length <= 2) {
      alert(language === 'fr' ? 'Minimum 2 éléments requis' : 'Minimum 2 items required');
      return;
    }
    if (!confirm(language === 'fr' ? 'Supprimer ce message ?' : 'Delete this message?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/marquee/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Failed to delete message (${res.status})`);
      }
      setMarqueeItems((prev) => prev.filter((m) => m.id !== id));
      showSavedMessage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: MarqueeMessage) => {
    const activeCount = marqueeItems.filter((m) => m.isActive).length;
    if (item.isActive && activeCount <= 2) {
      alert(language === 'fr' ? 'Minimum 2 éléments actifs requis' : 'Minimum 2 active items required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/marquee/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Failed to update message (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data?.message) {
        setMarqueeItems((prev) =>
          prev.map((m) => (m.id === item.id ? json.data.message : m))
        );
      }
      showSavedMessage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle active state');
    } finally {
      setSaving(false);
    }
  };

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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchMessages();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <ScrollText className="text-primary" size={24} />
          </div>
          <div>
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'BANDEAU DÉFILANT' : 'MARQUEE BANNER'}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {language === 'fr'
                ? 'Gérez les messages du bandeau défilant'
                : 'Manage the scrolling banner messages'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {language === 'fr' ? 'Enregistré !' : 'Saved!'}
            </div>
          )}
          {saving && (
            <Loader2 className="animate-spin text-primary" size={20} />
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <Plus size={18} />
            {language === 'fr' ? 'AJOUTER' : 'ADD'}
          </button>
        </div>
      </div>

      {/* Add new item form */}
      {showAddForm && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <h3
            className="text-lg mb-4"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {language === 'fr' ? 'NOUVEAU MESSAGE' : 'NEW MESSAGE'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                {language === 'fr' ? 'Texte français' : 'French text'}
              </label>
              <input
                type="text"
                value={newItem.textFr}
                onChange={(e) => setNewItem({ ...newItem, textFr: e.target.value })}
                placeholder="Ex: VIVEZ L'EXPÉRIENCE TEMPORAL"
                className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                {language === 'fr' ? 'Texte anglais' : 'English text'}
              </label>
              <input
                type="text"
                value={newItem.textEn}
                onChange={(e) => setNewItem({ ...newItem, textEn: e.target.value })}
                placeholder="Ex: LIVE THE TEMPORAL EXPERIENCE"
                className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!newItem.textFr.trim() || !newItem.textEn.trim() || saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {language === 'fr' ? 'Ajouter' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewItem({ textFr: '', textEn: '' });
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {marqueeItems.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            } ${!item.isActive ? 'opacity-50' : ''}`}
          >
            {/* Item Header */}
            <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <GripVertical size={16} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                </div>
                <span
                  className="text-2xl text-primary/50 font-bold"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  #{index + 1}
                </span>
                <p
                  className="text-sm truncate max-w-[300px]"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {language === 'fr' ? item.textFr : item.textEn}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(item)}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors ${
                    item.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={item.isActive ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                >
                  {item.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-red-500/20 text-white/50 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                  }`}
                  title={language === 'fr' ? 'Supprimer' : 'Delete'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Item Content */}
            <div className="p-4">
              {editingId === item.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Texte français' : 'French text'}
                      </label>
                      <input
                        type="text"
                        value={formData.textFr || ''}
                        onChange={(e) => setFormData({ ...formData, textFr: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Texte anglais' : 'English text'}
                      </label>
                      <input
                        type="text"
                        value={formData.textEn || ''}
                        onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {language === 'fr' ? 'Enregistrer' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        Français
                      </p>
                      <p
                        className="font-medium"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {item.textFr}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        English
                      </p>
                      <p
                        className="font-medium"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {item.textEn}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className={`mt-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'fr' ? 'Modifier' : 'Edit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {language === 'fr'
            ? `${marqueeItems.length} message(s) configuré(s). Minimum 2 messages actifs requis. Les modifications sont immédiatement visibles sur le site.`
            : `${marqueeItems.length} message(s) configured. Minimum 2 active messages required. Changes are immediately visible on the site.`}
        </p>
      </div>
    </div>
  );
}
