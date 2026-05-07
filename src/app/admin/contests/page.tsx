'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Save, Eye, EyeOff, ImageIcon, Plus, Trash2, Loader2, AlertCircle, Gauge, ArrowRight, Users, X, Mail, Package, Sparkles, Crown, Upload, CheckCircle } from 'lucide-react';
import { useStore } from '@/stores/useStore';

// ==================== Image Browser Modal ====================
function ImageBrowserModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: string) => void;
}) {
  const [availableImages, setAvailableImages] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeFolder, setActiveFolder] = useState('clothes');
  const [customUrl, setCustomUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const res = await fetch('/api/admin/images/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const paths: string[] = data.data?.uploaded || [];
        setUploadedFiles((prev) => [...prev, ...paths]);
        if (paths.length > 0) setSelectedImage(paths[paths.length - 1]);
        setAvailableImages((prev) => ({
          ...prev,
          clothes: [...(prev.clothes || []), ...paths],
        }));
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de l'upload");
      }
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files);
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedImage('');
    setCustomUrl('');
    setUploadedFiles([]);
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/images');
        if (res.ok) {
          const data = await res.json();
          setAvailableImages(data.data || {});
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchImages();
  }, [isOpen]);

  const handleConfirm = () => {
    const chosen = customUrl.trim() || selectedImage;
    if (chosen) onSelect(chosen);
    onClose();
  };

  if (!isOpen) return null;

  const folders = Object.keys(availableImages);
  const images = availableImages[activeFolder] || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-zinc-950 border border-zinc-700/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 rounded-t-2xl">
          <h3 className="text-lg text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            CHOISIR UNE IMAGE
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Upload zone */}
        <div
          className={`mx-4 mt-4 mb-2 border-2 border-dashed rounded-xl transition-all ${dragOver ? 'border-primary bg-primary/10' : 'border-zinc-700 hover:border-zinc-500'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center gap-2 py-5 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-primary" />
                <span className="text-sm text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>UPLOAD EN COURS...</span>
              </>
            ) : (
              <>
                <Upload size={28} className={dragOver ? 'text-primary' : 'text-zinc-500'} />
                <span className="text-sm text-zinc-400" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>GLISSER UNE PHOTO ICI OU CLIQUER POUR PARCOURIR</span>
                <span className="text-[11px] text-zinc-600">PNG, JPG, WEBP, GIF, SVG - Max 10MB</span>
              </>
            )}
            <input type="file" accept="image/webp,image/png,image/jpeg,image/gif,image/svg+xml" className="hidden"
              onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }}
              disabled={uploading}
            />
          </label>
          {uploadedFiles.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((f) => (
                <span key={f} className="flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                  <CheckCircle size={12} />{f.split('/').pop()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Folder tabs */}
        <div className="flex border-b border-zinc-800 px-4 gap-1">
          {folders.map((folder) => (
            <button key={folder} onClick={() => setActiveFolder(folder)}
              className={`px-5 py-2.5 text-sm rounded-t-lg transition-colors ${activeFolder === folder ? 'bg-zinc-800 text-primary border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {folder.toUpperCase()} ({(availableImages[folder] || []).length})
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>AUCUNE IMAGE DISPONIBLE</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {images.map((img) => (
                <button key={img} type="button" onClick={() => setSelectedImage(img === selectedImage ? '' : img)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${selectedImage === img ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-zinc-700 hover:border-zinc-500'}`}
                >
                  <Image src={img} alt={img.split('/').pop() || ''} fill className="object-cover transition-transform group-hover:scale-110" sizes="100px" />
                  {selectedImage === img && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom URL + Confirm */}
        <div className="p-4 border-t border-zinc-800 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Ou entrer une URL d'image..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={handleConfirm} disabled={!selectedImage && !customUrl.trim()}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            CHOISIR
          </button>
        </div>
      </div>
    </div>
  );
}

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

interface ContestEntryRow {
  id: string;
  createdAt: string;
  orderTotal: number | string;
  isManual?: boolean;
  manualName?: string | null;
  manualEmail?: string | null;
  manualNote?: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
  order: { id: string; orderNumber: string; total: number | string; createdAt: string; status: string } | null;
}

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
  const [imageBrowserOpen, setImageBrowserOpen] = useState(false);

  // Entries modal
  const [entriesContest, setEntriesContest] = useState<Contest | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [entries, setEntries] = useState<ContestEntryRow[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<{
    user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
    order: { id: string; orderNumber: string; total: number | string } | null;
    drawnAt: string | null;
  } | null>(null);
  const [highlightWinnerId, setHighlightWinnerId] = useState<string | null>(null);

  // Manual entry form state
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleAddManualEntry = async () => {
    if (!entriesContest || !manualName.trim()) return;
    setManualSaving(true);
    setManualError(null);
    try {
      const res = await fetch(`/api/admin/contests/${entriesContest.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          manualName: manualName.trim(),
          manualEmail: manualEmail.trim(),
          manualNote: manualNote.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erreur');
      // Reload entries
      setManualName('');
      setManualEmail('');
      setManualNote('');
      setManualFormOpen(false);
      const reload = await fetch(`/api/admin/contests/${entriesContest.id}/entries`);
      const reloadJson = await reload.json();
      if (reloadJson.success) setEntries(reloadJson.data.entries || []);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setManualSaving(false);
    }
  };

  const handleDeleteManualEntry = async (entryId: string) => {
    if (!entriesContest) return;
    if (!confirm(language === 'fr' ? 'Supprimer cette participation ?' : 'Delete this entry?')) return;
    try {
      const res = await fetch(`/api/admin/contests/${entriesContest.id}/entries?entryId=${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      }
    } catch {
      /* ignore */
    }
  };

  const openEntries = async (contest: Contest) => {
    setEntriesContest(contest);
    setEntriesLoading(true);
    setEntriesError(null);
    setEntries([]);
    setDrawError(null);
    setHighlightWinnerId(null);
    setWinnerInfo(null);
    try {
      const res = await fetch(`/api/admin/contests/${contest.id}/entries`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erreur');
      const list: ContestEntryRow[] = json.data.entries || [];
      setEntries(list);
      // If contest already has a winner, reconstruct winner info from entries
      if (contest.winnerId) {
        const winnerEntry = list.find(e => e.user?.id === contest.winnerId);
        if (winnerEntry) {
          setWinnerInfo({
            user: winnerEntry.user,
            order: winnerEntry.order
              ? { id: winnerEntry.order.id, orderNumber: winnerEntry.order.orderNumber, total: winnerEntry.order.total }
              : null,
            drawnAt: contest.drawnAt,
          });
          setHighlightWinnerId(winnerEntry.id);
        }
      }
    } catch (err) {
      setEntriesError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setEntriesLoading(false);
    }
  };

  const closeEntries = () => {
    setEntriesContest(null);
    setEntries([]);
    setEntriesError(null);
    setDrawError(null);
    setWinnerInfo(null);
    setHighlightWinnerId(null);
  };

  const handleDraw = async () => {
    if (!entriesContest || drawing) return;
    const confirmMsg = language === 'fr'
      ? `Tirage au sort final pour le concours #${entriesContest.number} ?\n\nUn gagnant sera sélectionné aléatoirement parmi ${entries.length} participation(s). Cette action clôturera le concours et ne peut pas être annulée.`
      : `Final draw for contest #${entriesContest.number}?\n\nA winner will be randomly selected from ${entries.length} entry(ies). This action will close the contest and cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    setDrawing(true);
    setDrawError(null);
    try {
      const res = await fetch(`/api/admin/contests/${entriesContest.id}/draw`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Erreur ${res.status}`);
      }

      const data = json.data;
      setWinnerInfo({
        user: data.winner,
        order: data.winningOrder,
        drawnAt: data.contest?.drawnAt || new Date().toISOString(),
      });

      // Highlight the winning entry in the list
      const winnerEntry = entries.find(e => e.user?.id === data.winner?.id && e.order?.id === data.winningOrder?.id);
      if (winnerEntry) setHighlightWinnerId(winnerEntry.id);

      // Update local contest state
      setEntriesContest(prev => prev ? {
        ...prev,
        winnerId: data.winner?.id || null,
        winnerOrderId: data.winningOrder?.id || null,
        drawnAt: data.contest?.drawnAt || new Date().toISOString(),
        isActive: false,
      } : prev);

      // Refresh contests list in background
      fetchContests();
    } catch (err) {
      setDrawError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setDrawing(false);
    }
  };

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
        <div className="flex items-center gap-4">
          {formData.prizeImage && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/50 shrink-0">
              <Image
                src={formData.prizeImage}
                alt="Prize"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}
          <div className="flex flex-col gap-2 flex-1">
            <button
              type="button"
              onClick={() => setImageBrowserOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                darkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <ImageIcon size={16} />
              {language === 'fr' ? 'Choisir une image...' : 'Choose an image...'}
            </button>
            {formData.prizeImage && (
              <p className={`text-xs truncate ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {formData.prizeImage}
              </p>
            )}
          </div>
        </div>
        <ImageBrowserModal
          isOpen={imageBrowserOpen}
          onClose={() => setImageBrowserOpen(false)}
          onSelect={(img) => setFormData({ ...formData, prizeImage: img })}
        />
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
            href="/admin/jauge"
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
                {contest.winnerId && (
                  <div
                    className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center gap-2 text-sm font-medium"
                    title={language === 'fr' ? 'Gagnant tiré au sort' : 'Winner drawn'}
                  >
                    <Crown size={16} />
                    <span className="hidden sm:inline">{language === 'fr' ? 'Tiré' : 'Drawn'}</span>
                  </div>
                )}
                <button
                  onClick={() => openEntries(contest)}
                  className="px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center gap-2 text-sm font-medium"
                  title={language === 'fr' ? 'Voir les participations et tirer au sort' : 'View entries and draw winner'}
                >
                  <Users size={16} />
                  <span>{contest._count?.entries ?? 0}</span>
                  <span className="hidden sm:inline">{language === 'fr' ? 'Participants' : 'Entries'}</span>
                </button>
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

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(contest)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-white/10 hover:bg-white/20'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </button>

                      <button
                        onClick={() => openEntries(contest)}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Users size={16} />
                        {language === 'fr' ? 'Voir les participants' : 'View entries'}
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                          {contest._count?.entries ?? 0}
                        </span>
                      </button>

                      {contest.winnerId ? (
                        <div className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center gap-2 font-medium">
                          <Crown size={16} />
                          {language === 'fr' ? 'Gagnant tiré' : 'Winner drawn'}
                        </div>
                      ) : (
                        (contest._count?.entries ?? 0) > 0 && (
                          <button
                            onClick={() => openEntries(contest)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center gap-2 font-bold shadow-lg shadow-yellow-500/20"
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          >
                            <Sparkles size={16} />
                            {language === 'fr' ? 'Tirage au sort' : 'Draw winner'}
                          </button>
                        )
                      )}
                    </div>
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

      {/* Entries modal */}
      {entriesContest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border ${
            darkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    {language === 'fr' ? 'PARTICIPATIONS' : 'ENTRIES'} #{entriesContest.number}
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {language === 'fr' ? entriesContest.prizeName : (entriesContest.prizeNameEn || entriesContest.prizeName)}
                    {' · '}
                    {language === 'fr' ? 'Seuil' : 'Threshold'}: {entriesContest.purchaseAmount}€
                  </p>
                </div>
              </div>
              <button
                onClick={closeEntries}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {winnerInfo && winnerInfo.user && (
                <div className="mb-4 p-4 rounded-xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-amber-500/5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="text-yellow-400" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold mb-1" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                        {language === 'fr' ? '🎉 Gagnant' : '🎉 Winner'}
                      </p>
                      <p className="font-bold text-base">
                        {[winnerInfo.user.firstName, winnerInfo.user.lastName].filter(Boolean).join(' ') || winnerInfo.user.email}
                      </p>
                      {winnerInfo.user.email && (
                        <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                          <Mail size={11} />
                          {winnerInfo.user.email}
                        </p>
                      )}
                      {winnerInfo.order && (
                        <p className={`text-xs flex items-center gap-1 mt-0.5 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                          <Package size={11} />
                          {winnerInfo.order.orderNumber} · {Number(winnerInfo.order.total).toFixed(2)}€
                        </p>
                      )}
                      {winnerInfo.drawnAt && (
                        <p className={`text-[10px] mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Tiré le' : 'Drawn on'}{' '}
                          {new Date(winnerInfo.drawnAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {drawError && (
                <div className="mb-4 p-3 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{drawError}</p>
                </div>
              )}

              {entriesLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              )}

              {!entriesLoading && entriesError && (
                <div className="flex flex-col items-center py-16 gap-2">
                  <AlertCircle size={36} className="text-red-400" />
                  <p className="text-sm text-red-400">{entriesError}</p>
                </div>
              )}

              {!entriesLoading && !entriesError && entries.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-3">
                  <Users size={48} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                  <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {language === 'fr' ? 'Aucune participation pour ce concours.' : 'No entries for this contest yet.'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {language === 'fr'
                      ? `Chaque commande payée ≥ ${entriesContest.purchaseAmount}€ inscrit automatiquement le client.`
                      : `Every paid order ≥ ${entriesContest.purchaseAmount}€ automatically enters the customer.`}
                  </p>
                </div>
              )}

              {!entriesLoading && !entriesError && entries.length > 0 && (
                <div className="space-y-2">
                  {entries.map((entry, idx) => {
                    const name = entry.user
                      ? [entry.user.firstName, entry.user.lastName].filter(Boolean).join(' ') || entry.user.email
                      : entry.manualName
                        ? entry.manualName
                        : (language === 'fr' ? 'Utilisateur inconnu' : 'Unknown user');
                    const total = Number(entry.orderTotal || entry.order?.total || 0);
                    const date = new Date(entry.createdAt);
                    const isWinner = entry.id === highlightWinnerId;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                          isWinner
                            ? 'border-yellow-500/60 bg-yellow-500/10'
                            : darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          darkMode ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-600'
                        }`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-semibold text-sm truncate">{name}</p>
                            {entry.isManual && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                {language === 'fr' ? 'Manuel' : 'Manual'}
                              </span>
                            )}
                            {isWinner && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                                <Crown size={10} />
                                {language === 'fr' ? 'Gagnant' : 'Winner'}
                              </span>
                            )}
                          </div>
                          {entry.user?.email && name !== entry.user.email && (
                            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              <Mail size={11} />
                              <span className="truncate">{entry.user.email}</span>
                            </div>
                          )}
                          {!entry.user && entry.manualEmail && (
                            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              <Mail size={11} />
                              <span className="truncate">{entry.manualEmail}</span>
                            </div>
                          )}
                          {!entry.user && entry.manualNote && (
                            <div className={`text-xs italic ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                              {entry.manualNote}
                            </div>
                          )}
                          {entry.order && (
                            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              <Package size={11} />
                              <span>{entry.order.orderNumber}</span>
                              <span className={darkMode ? 'text-white/30' : 'text-gray-400'}>·</span>
                              <span>{entry.order.status}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-primary font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                              {total > 0 ? `${total.toFixed(2)}€` : '—'}
                            </p>
                            <p className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                              {date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {entry.isManual && !isWinner && (
                            <button
                              onClick={() => handleDeleteManualEntry(entry.id)}
                              className={`p-1.5 rounded ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                              title={language === 'fr' ? 'Supprimer' : 'Delete'}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual entry form (toggles open) */}
            {manualFormOpen && !entriesContest.winnerId && (
              <div className={`p-4 border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  {language === 'fr' ? 'Ajouter un participant manuellement' : 'Add participant manually'}
                </p>
                {manualError && (
                  <div className="mb-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    {manualError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder={language === 'fr' ? 'Nom complet *' : 'Full name *'}
                    className={`px-3 py-2 rounded text-sm ${
                      darkMode ? 'bg-white/10 border border-white/10 text-white' : 'bg-white border border-gray-200'
                    }`}
                  />
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder={language === 'fr' ? 'Email (optionnel)' : 'Email (optional)'}
                    className={`px-3 py-2 rounded text-sm ${
                      darkMode ? 'bg-white/10 border border-white/10 text-white' : 'bg-white border border-gray-200'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder={language === 'fr' ? 'Note (ex: achat DM)' : 'Note (e.g. DM purchase)'}
                  className={`w-full px-3 py-2 rounded text-sm mb-2 ${
                    darkMode ? 'bg-white/10 border border-white/10 text-white' : 'bg-white border border-gray-200'
                  }`}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setManualFormOpen(false);
                      setManualError(null);
                    }}
                    className={`px-3 py-1.5 rounded text-xs ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleAddManualEntry}
                    disabled={manualSaving || !manualName.trim()}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-primary hover:bg-primary/80 text-white disabled:opacity-50"
                  >
                    {manualSaving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      language === 'fr' ? 'Ajouter' : 'Add'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className={`flex items-center justify-between gap-3 p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {entries.length} {language === 'fr' ? 'participation(s)' : 'entry(ies)'}
              </p>
              <div className="flex items-center gap-2">
                {!entriesContest.winnerId && !manualFormOpen && (
                  <button
                    onClick={() => setManualFormOpen(true)}
                    className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {language === 'fr' ? '+ Ajouter manuellement' : '+ Add manually'}
                  </button>
                )}
                {!entriesContest.winnerId && entries.length > 0 && (
                  <button
                    onClick={handleDraw}
                    disabled={drawing}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {drawing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {language === 'fr' ? 'Tirage au sort' : 'Draw winner'}
                  </button>
                )}
                <button
                  onClick={closeEntries}
                  className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
