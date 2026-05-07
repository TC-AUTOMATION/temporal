'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Check,
  Gift,
  AlertTriangle,
  Upload,
  ChevronUp,
  ChevronDown,
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
  image: string | null;
  images: string[];
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
  image: '',
  images: [],
  showDelay: 5000,
  showOnce: true,
};

export default function AdminPopupsPage() {
  const { darkMode } = useStore();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<Popup> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  // Auto-clear error after 4s
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(''), 4000);
    }
    return () => { if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current); };
  }, [error]);

  // Auto-clear success after 3s
  useEffect(() => {
    if (successMessage) {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
    }
    return () => { if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current); };
  }, [successMessage]);

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewPopup) closePreview();
        else if (isEditing) closeEditModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, previewPopup]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
  };

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
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (popupData: Partial<Popup>) => {
    // Hydrate images: prefer images array, fallback to legacy image field
    const hydratedImages =
      popupData.images && popupData.images.length > 0
        ? popupData.images
        : popupData.image
          ? [popupData.image]
          : [];
    setEditingPopup({ ...popupData, images: hydratedImages });
    setIsEditing(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsModalVisible(true));
    });
  };

  const closeEditModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsEditing(false);
      setEditingPopup(null);
    }, 300);
  }, []);

  const openPreview = (popup: Popup) => {
    setPreviewPopup(popup);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsPreviewVisible(true));
    });
  };

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setTimeout(() => {
      setPreviewPopup(null);
    }, 300);
  }, []);

  const handleCreateNew = (type: 'NEWSLETTER' | 'DELIVERY_ISSUE' | 'NEW_DROP') => {
    openEditModal({
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
  };

  const handleEdit = (popup: Popup) => {
    openEditModal({ ...popup });
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

      closeEditModal();
      showSuccess(isUpdate ? 'Popup modifié avec succès' : 'Popup créé avec succès');
      fetchPopups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (popup: Popup) => {
    setTogglingId(popup.id);
    // Optimistic update
    const newActive = !popup.isActive;
    setPopups(prev => prev.map(p => {
      if (p.id === popup.id) return { ...p, isActive: newActive };
      if (newActive && p.type === popup.type && p.id !== popup.id) return { ...p, isActive: false };
      return p;
    }));

    try {
      const response = await fetch(`/api/popups/${popup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (response.ok) {
        showSuccess(newActive ? 'Popup activé' : 'Popup désactivé');
      } else {
        fetchPopups(); // Revert on error
        setError('Erreur lors de la modification');
      }
    } catch {
      fetchPopups(); // Revert on error
      setError('Erreur lors de la modification');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (popup: Popup) => {
    if (!confirm(`Supprimer ce popup "${popup.titleFr}" ?`)) return;

    setDeletingId(popup.id);

    try {
      const response = await fetch(`/api/popups/${popup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistic removal with animation delay
        setPopups(prev => prev.filter(p => p.id !== popup.id));
        showSuccess('Popup supprimé');
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
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

      {/* Success Toast */}
      <div
        className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 bg-green-500 text-white shadow-lg transition-all duration-300 ${
          successMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <Check size={18} />
        <span className="text-sm font-medium">{successMessage}</span>
      </div>

      {/* Error Toast */}
      <div
        className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 bg-red-500/90 text-white shadow-lg transition-all duration-300 ${
          error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <AlertCircle size={18} />
        <span className="text-sm font-medium">{error}</span>
        <button onClick={() => setError('')} className="ml-2 hover:opacity-70">
          <X size={14} />
        </button>
      </div>

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
                      className={`p-3 flex items-center justify-between transition-all duration-200 ${
                        deletingId === popup.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                      } ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{popup.titleFr}</p>
                        <p className={`text-xs transition-colors ${popup.isActive ? 'text-green-500' : (darkMode ? 'text-white/40' : 'text-black/40')}`}>
                          {popup.isActive ? 'Actif' : 'Inactif'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openPreview(popup)}
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
                          disabled={togglingId === popup.id}
                          className={`p-2 transition-colors disabled:opacity-50 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                          title={popup.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {togglingId === popup.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : popup.isActive ? (
                            <ToggleRight size={16} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(popup)}
                          disabled={deletingId === popup.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === popup.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isModalVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeEditModal}
          />
          {/* Modal */}
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${
            isModalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          } ${darkMode ? 'bg-black border border-white/10' : 'bg-white border border-black/10'}`}>
            <div className={`sticky top-0 z-10 p-6 border-b flex items-center justify-between ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}>
              <h2
                className="text-xl"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {editingPopup.id ? 'MODIFIER LE POPUP' : 'CRÉER UN POPUP'}
              </h2>
              <button
                onClick={closeEditModal}
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

              {/* Images (multi-upload, carrousel) */}
              <div>
                <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  Images (optionnel — {(editingPopup.images || []).length}/5, défilent automatiquement si plusieurs)
                </label>
                <label
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 cursor-pointer border-2 border-dashed transition-colors ${
                    darkMode
                      ? 'border-white/20 hover:border-primary/60 text-white'
                      : 'border-black/20 hover:border-primary/60 text-black'
                  }`}
                >
                  <Upload size={16} />
                  <span className="text-sm">Cliquez pour ajouter des images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const fd = new FormData();
                      for (let i = 0; i < files.length; i++) fd.append('files', files[i]);
                      try {
                        const res = await fetch('/api/admin/images/upload', {
                          method: 'POST',
                          credentials: 'include',
                          body: fd,
                        });
                        const json = await res.json();
                        const uploaded: string[] = json?.data?.uploaded || [];
                        if (uploaded.length === 0) throw new Error('No images uploaded');
                        setEditingPopup({
                          ...editingPopup,
                          images: [...(editingPopup.images || []), ...uploaded].slice(0, 5),
                        });
                      } catch {
                        setError("Échec de l'upload");
                      }
                      e.currentTarget.value = '';
                    }}
                    disabled={(editingPopup.images || []).length >= 5}
                  />
                </label>
                {(editingPopup.images || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {(editingPopup.images || []).map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="w-full aspect-video object-cover border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (editingPopup.images || []).filter((_, i) => i !== idx);
                            setEditingPopup({ ...editingPopup, images: next });
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(editingPopup.images || [])];
                              if (idx === 0) return;
                              [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                              setEditingPopup({ ...editingPopup, images: next });
                            }}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(editingPopup.images || [])];
                              if (idx === next.length - 1) return;
                              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                              setEditingPopup({ ...editingPopup, images: next });
                            }}
                            disabled={idx === (editingPopup.images || []).length - 1}
                            className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] bg-primary text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            PRINCIPALE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Délai d'affichage
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      value={editingPopup.showDelay || 5000}
                      onChange={(e) => setEditingPopup({ ...editingPopup, showDelay: parseInt(e.target.value) })}
                      min={0}
                      max={60000}
                      step={1000}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        Immédiat
                      </span>
                      <span className={`text-sm font-medium px-3 py-1 ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                        {((editingPopup.showDelay || 5000) / 1000).toFixed(0)}s
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        60s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setEditingPopup({ ...editingPopup, showOnce: !(editingPopup.showOnce ?? true) })}
                      className={`w-10 h-6 rounded-full transition-colors duration-200 relative cursor-pointer ${
                        (editingPopup.showOnce ?? true) ? 'bg-primary' : (darkMode ? 'bg-white/20' : 'bg-black/20')
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        (editingPopup.showOnce ?? true) ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
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
                  onClick={closeEditModal}
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

      {/* Preview Modal - matches DynamicPopup appearance */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
              isPreviewVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closePreview}
          />
          {/* Preview card */}
          <div className={`relative w-full max-w-md transition-all duration-300 ${
            isPreviewVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            {/* "APERÇU" badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 bg-primary text-white text-xs font-bold tracking-wider">
              APERÇU
            </div>

            <div className={`relative overflow-hidden ${darkMode ? 'bg-black border border-white/20' : 'bg-white border border-black/10'}`}>
              {/* Background decoration like DynamicPopup */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] opacity-20 blur-3xl"
                  style={{
                    background: previewPopup.type === 'DELIVERY_ISSUE'
                      ? 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.6) 0%, transparent 70%)'
                      : previewPopup.type === 'NEW_DROP'
                        ? 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.6) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, transparent 70%)',
                  }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={closePreview}
                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center z-10 transition-all hover:scale-110 ${
                  darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  previewPopup.type === 'DELIVERY_ISSUE' ? 'bg-orange-500/20' :
                  previewPopup.type === 'NEW_DROP' ? 'bg-green-500/20' : 'bg-primary/20'
                }`}>
                  {previewPopup.type === 'NEWSLETTER' ? (
                    <Gift size={32} className="text-primary" />
                  ) : previewPopup.type === 'DELIVERY_ISSUE' ? (
                    <AlertTriangle size={32} className="text-orange-500" />
                  ) : (
                    <Sparkles size={32} className="text-green-500" />
                  )}
                </div>

                {/* Title */}
                <h4
                  className="text-2xl md:text-3xl mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {previewPopup.titleFr}
                </h4>

                {/* Subtitle */}
                {previewPopup.subtitleFr && (
                  <p className={`mb-4 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {previewPopup.subtitleFr}
                  </p>
                )}

                {/* Content */}
                {previewPopup.contentFr && (
                  <p className={`mb-6 text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {previewPopup.contentFr}
                  </p>
                )}

                {/* Newsletter form preview */}
                {previewPopup.type === 'NEWSLETTER' && (
                  <div className="space-y-4 mt-4">
                    <div className={`w-full px-4 py-3 border-2 text-left ${
                      darkMode ? 'bg-white/5 border-white/20 text-white/40' : 'bg-black/5 border-black/10 text-black/40'
                    }`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      votre@email.com
                    </div>
                  </div>
                )}

                {/* Button */}
                {previewPopup.buttonTextFr && (
                  <button
                    className={`mt-4 w-full py-3 text-white font-bold ${
                      previewPopup.type === 'NEW_DROP' ? 'bg-green-500' :
                      previewPopup.type === 'DELIVERY_ISSUE' ? 'bg-orange-500' :
                      'bg-primary'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                  >
                    {previewPopup.buttonTextFr}
                  </button>
                )}
              </div>

              {/* Bottom accent */}
              <div className={`h-1 ${
                previewPopup.type === 'NEW_DROP'
                  ? 'bg-gradient-to-r from-green-500 via-green-500/50 to-transparent'
                  : previewPopup.type === 'DELIVERY_ISSUE'
                    ? 'bg-gradient-to-r from-orange-500 via-orange-500/50 to-transparent'
                    : 'bg-gradient-to-r from-primary via-primary/50 to-transparent'
              }`} />
            </div>

            {/* Info below preview */}
            <div className={`mt-3 flex items-center justify-center gap-4 text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
              <span>Délai : {((previewPopup.showDelay || 5000) / 1000).toFixed(0)}s</span>
              <span>|</span>
              <span>{previewPopup.showOnce ? 'Affiché 1 fois/session' : 'Affiché à chaque visite'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
