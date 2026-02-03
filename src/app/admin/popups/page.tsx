'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import {
  MessageSquare,
  Bell,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface Popup {
  id: string;
  type: 'NEWSLETTER' | 'DELIVERY_ISSUE' | 'NEW_DROP';
  isActive: boolean;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  contentFr: string | null;
  contentEn: string | null;
  linkUrl: string | null;
  showDelay: number;
  showOnce: boolean;
  createdAt: string;
  updatedAt: string;
}

const POPUP_TYPES = [
  {
    type: 'NEWSLETTER' as const,
    label: 'Newsletter',
    labelFr: 'Newsletter',
    icon: MessageSquare,
    color: 'bg-purple-500',
    description: 'Inscription à la newsletter avec offre de bienvenue',
  },
  {
    type: 'DELIVERY_ISSUE' as const,
    label: 'Delivery Issue',
    labelFr: 'Problème de livraison',
    icon: Bell,
    color: 'bg-orange-500',
    description: 'Signaler un retard ou un problème de livraison',
  },
  {
    type: 'NEW_DROP' as const,
    label: 'New Drop',
    labelFr: 'Nouveau drop',
    icon: Sparkles,
    color: 'bg-green-500',
    description: 'Annoncer de nouveaux articles ou un nouveau drop',
  },
];

const defaultPopup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'NEWSLETTER',
  isActive: false,
  titleFr: '',
  titleEn: '',
  subtitleFr: '',
  subtitleEn: '',
  buttonTextFr: '',
  buttonTextEn: '',
  contentFr: '',
  contentEn: '',
  linkUrl: '',
  showDelay: 5000,
  showOnce: true,
};

export default function AdminPopupsPage() {
  const { darkMode } = useStore();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<Popup> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/popups');
      const data = await response.json();
      if (response.ok) {
        setPopups(data.data || []);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = (type: 'NEWSLETTER' | 'DELIVERY_ISSUE' | 'NEW_DROP') => {
    setEditingPopup({
      ...defaultPopup,
      type,
      titleFr: type === 'NEWSLETTER' ? 'Rejoignez notre newsletter' :
               type === 'DELIVERY_ISSUE' ? 'Information importante' :
               'Nouveau Drop disponible !',
      titleEn: type === 'NEWSLETTER' ? 'Join our newsletter' :
               type === 'DELIVERY_ISSUE' ? 'Important Notice' :
               'New Drop Available!',
      subtitleFr: type === 'NEWSLETTER' ? 'Recevez 10% de réduction sur votre première commande' :
                  type === 'DELIVERY_ISSUE' ? 'Nous rencontrons des délais de livraison' :
                  'Découvrez notre nouvelle collection',
      subtitleEn: type === 'NEWSLETTER' ? 'Get 10% off your first order' :
                  type === 'DELIVERY_ISSUE' ? 'We are experiencing delivery delays' :
                  'Discover our new collection',
      buttonTextFr: type === 'NEWSLETTER' ? "S'inscrire" :
                    type === 'DELIVERY_ISSUE' ? 'Compris' :
                    'Découvrir',
      buttonTextEn: type === 'NEWSLETTER' ? 'Subscribe' :
                    type === 'DELIVERY_ISSUE' ? 'Got it' :
                    'Shop Now',
    });
    setIsEditing(true);
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup({ ...popup });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingPopup) return;

    setIsSaving(true);
    setError('');

    try {
      const isUpdate = 'id' in editingPopup && editingPopup.id;
      const url = isUpdate ? `/api/popups/${editingPopup.id}` : '/api/popups';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPopup),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setIsEditing(false);
      setEditingPopup(null);
      fetchPopups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (popup: Popup) => {
    try {
      const response = await fetch(`/api/popups/${popup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !popup.isActive }),
      });

      if (response.ok) {
        fetchPopups();
      }
    } catch (err) {
      setError('Erreur lors de la modification');
    }
  };

  const handleDelete = async (popup: Popup) => {
    if (!confirm(`Supprimer ce popup "${popup.titleFr}" ?`)) return;

    try {
      const response = await fetch(`/api/popups/${popup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPopups();
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getPopupTypeInfo = (type: string) => {
    return POPUP_TYPES.find(t => t.type === type) || POPUP_TYPES[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            GESTION DES POPUPS
          </h1>
          <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
            Configurez les popups affichés sur le site
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Popup Types Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {POPUP_TYPES.map((typeInfo) => {
          const Icon = typeInfo.icon;
          const existingPopups = popups.filter(p => p.type === typeInfo.type);
          const activePopup = existingPopups.find(p => p.isActive);

          return (
            <div
              key={typeInfo.type}
              className={`p-6 border ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${typeInfo.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3
                    className="text-lg"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {typeInfo.labelFr}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {typeInfo.description}
                  </p>
                </div>
              </div>

              {/* Active Status */}
              {activePopup ? (
                <div className={`p-3 mb-4 ${darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-green-500 text-sm font-medium">Popup actif</span>
                    <button
                      onClick={() => handleToggleActive(activePopup)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <ToggleRight size={24} />
                    </button>
                  </div>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                    {activePopup.titleFr}
                  </p>
                </div>
              ) : (
                <div className={`p-3 mb-4 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                  <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    Aucun popup actif
                  </p>
                </div>
              )}

              {/* Existing popups for this type */}
              {existingPopups.length > 0 && (
                <div className="space-y-2 mb-4">
                  {existingPopups.map((popup) => (
                    <div
                      key={popup.id}
                      className={`p-3 flex items-center justify-between ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{popup.titleFr}</p>
                        <p className={`text-xs ${popup.isActive ? 'text-green-500' : (darkMode ? 'text-white/40' : 'text-black/40')}`}>
                          {popup.isActive ? 'Actif' : 'Inactif'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewPopup(popup)}
                          className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                          title="Aperçu"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(popup)}
                          className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(popup)}
                          className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                          title={popup.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {popup.isActive ? (
                            <ToggleRight size={16} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(popup)}
                          className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create new button */}
              <button
                onClick={() => handleCreateNew(typeInfo.type)}
                className={`w-full py-3 flex items-center justify-center gap-2 border transition-colors ${
                  darkMode
                    ? 'border-white/20 hover:border-primary hover:text-primary'
                    : 'border-black/20 hover:border-primary hover:text-primary'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                <Plus size={18} />
                CRÉER UN POPUP
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isEditing && editingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-black border border-white/10' : 'bg-white border border-black/10'}`}>
            <div className={`sticky top-0 p-6 border-b flex items-center justify-between ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}>
              <h2
                className="text-xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {editingPopup.id ? 'MODIFIER LE POPUP' : 'CRÉER UN POPUP'}
              </h2>
              <button
                onClick={() => { setIsEditing(false); setEditingPopup(null); }}
                className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type */}
              <div>
                <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  Type de popup
                </label>
                <div className="flex gap-2">
                  {POPUP_TYPES.map((typeInfo) => {
                    const Icon = typeInfo.icon;
                    return (
                      <button
                        key={typeInfo.type}
                        onClick={() => setEditingPopup({ ...editingPopup, type: typeInfo.type })}
                        className={`flex-1 p-3 flex flex-col items-center gap-2 border transition-colors ${
                          editingPopup.type === typeInfo.type
                            ? 'border-primary bg-primary/10'
                            : darkMode
                              ? 'border-white/10 hover:border-white/30'
                              : 'border-black/10 hover:border-black/30'
                        }`}
                      >
                        <Icon size={20} className={editingPopup.type === typeInfo.type ? 'text-primary' : ''} />
                        <span className="text-xs">{typeInfo.labelFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Titles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Titre (FR) *
                  </label>
                  <input
                    type="text"
                    value={editingPopup.titleFr || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, titleFr: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Titre en français"
                  />
                </div>
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Titre (EN) *
                  </label>
                  <input
                    type="text"
                    value={editingPopup.titleEn || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, titleEn: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Title in English"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Sous-titre (FR)
                  </label>
                  <input
                    type="text"
                    value={editingPopup.subtitleFr || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, subtitleFr: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Sous-titre en français"
                  />
                </div>
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Sous-titre (EN)
                  </label>
                  <input
                    type="text"
                    value={editingPopup.subtitleEn || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, subtitleEn: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Subtitle in English"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Contenu (FR)
                  </label>
                  <textarea
                    value={editingPopup.contentFr || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, contentFr: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary resize-none ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Contenu additionnel en français"
                  />
                </div>
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Contenu (EN)
                  </label>
                  <textarea
                    value={editingPopup.contentEn || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, contentEn: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary resize-none ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Additional content in English"
                  />
                </div>
              </div>

              {/* Button text */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Texte du bouton (FR)
                  </label>
                  <input
                    type="text"
                    value={editingPopup.buttonTextFr || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, buttonTextFr: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="S'inscrire"
                  />
                </div>
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Texte du bouton (EN)
                  </label>
                  <input
                    type="text"
                    value={editingPopup.buttonTextEn || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, buttonTextEn: e.target.value })}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                    placeholder="Subscribe"
                  />
                </div>
              </div>

              {/* Link URL */}
              <div>
                <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  Lien du bouton (optionnel)
                </label>
                <input
                  type="url"
                  value={editingPopup.linkUrl || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, linkUrl: e.target.value })}
                  className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                  }`}
                  placeholder="https://..."
                />
              </div>

              {/* Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Délai d'affichage (ms)
                  </label>
                  <input
                    type="number"
                    value={editingPopup.showDelay || 5000}
                    onChange={(e) => setEditingPopup({ ...editingPopup, showDelay: parseInt(e.target.value) || 5000 })}
                    min={0}
                    max={60000}
                    className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    5000 = 5 secondes
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPopup.showOnce ?? true}
                      onChange={(e) => setEditingPopup({ ...editingPopup, showOnce: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Afficher une seule fois par session</span>
                  </label>
                </div>
              </div>

              {/* Active toggle */}
              <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                <div>
                  <p className="font-medium">Activer ce popup</p>
                  <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    Les autres popups du même type seront désactivés
                  </p>
                </div>
                <button
                  onClick={() => setEditingPopup({ ...editingPopup, isActive: !editingPopup.isActive })}
                  className="text-2xl"
                >
                  {editingPopup.isActive ? (
                    <ToggleRight className="text-green-500" size={32} />
                  ) : (
                    <ToggleLeft size={32} />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => { setIsEditing(false); setEditingPopup(null); }}
                  className={`flex-1 py-3 border transition-colors ${
                    darkMode
                      ? 'border-white/20 hover:border-white/40'
                      : 'border-black/20 hover:border-black/40'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editingPopup.titleFr || !editingPopup.titleEn}
                  className="flex-1 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      SAUVEGARDER
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md ${darkMode ? 'bg-black border border-white/10' : 'bg-white border border-black/10'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3
                  className="text-xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  APERÇU
                </h3>
                <button
                  onClick={() => setPreviewPopup(null)}
                  className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={`p-6 text-center ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                <h4 className="text-2xl mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  {previewPopup.titleFr}
                </h4>
                {previewPopup.subtitleFr && (
                  <p className={darkMode ? 'text-white/70' : 'text-black/70'}>
                    {previewPopup.subtitleFr}
                  </p>
                )}
                {previewPopup.contentFr && (
                  <p className={`mt-4 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {previewPopup.contentFr}
                  </p>
                )}
                {previewPopup.buttonTextFr && (
                  <button
                    className="mt-6 px-6 py-3 bg-primary text-white"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {previewPopup.buttonTextFr}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
