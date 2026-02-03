'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import {
  Mail,
  Users,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  source: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNewsletterPage() {
  const { darkMode } = useStore();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchSubscribers();
  }, [page, showInactive]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        active: (!showInactive).toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/newsletter?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.data.subscribers || []);
        setTotal(data.data.total || 0);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchSubscribers();
  };

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`Désinscrire ${email} ?`)) return;

    try {
      const response = await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      setError('Erreur lors de la désinscription');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/newsletter?limit=10000');
      const data = await response.json();

      if (response.ok) {
        const subs = data.data.subscribers || [];
        const csv = [
          ['Email', 'Prénom', 'Nom', 'Actif', 'Source', 'Date inscription'].join(','),
          ...subs.map((s: Subscriber) => [
            s.email,
            s.firstName || '',
            s.lastName || '',
            s.isActive ? 'Oui' : 'Non',
            s.source,
            new Date(s.createdAt).toLocaleDateString('fr-FR'),
          ].join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (err) {
      setError('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const activeCount = subscribers.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            NEWSLETTER
          </h1>
          <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
            Gérez les abonnés à la newsletter
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 flex items-center gap-2 border transition-colors ${
            darkMode
              ? 'border-white/20 hover:border-primary hover:text-primary'
              : 'border-black/20 hover:border-primary hover:text-primary'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          EXPORTER CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className={`p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                Total abonnés
              </p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className={`p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                Actifs
              </p>
              <p className="text-2xl font-bold text-green-500">{showInactive ? activeCount : total}</p>
            </div>
          </div>
        </div>
        <div className={`p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 flex items-center justify-center">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                Cette page
              </p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-black/40'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email, nom..."
              className={`w-full pl-12 pr-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
              }`}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            RECHERCHER
          </button>
        </form>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => { setShowInactive(e.target.checked); setPage(0); }}
              className="w-4 h-4"
            />
            <span className="text-sm">Afficher inactifs</span>
          </label>
          <button
            onClick={() => fetchSubscribers()}
            className={`p-3 border transition-colors ${
              darkMode
                ? 'border-white/20 hover:border-primary hover:text-primary'
                : 'border-black/20 hover:border-primary hover:text-primary'
            }`}
            title="Actualiser"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className={`p-12 text-center ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          <Mail size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
          <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
            Aucun abonné trouvé
          </p>
        </div>
      ) : (
        <div className={`border overflow-x-auto ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-white/5' : 'bg-black/5'}>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className={`border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      {subscriber.email}
                      {subscriber.userId && (
                        <span className={`px-2 py-0.5 text-xs ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                          Compte
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {subscriber.firstName || subscriber.lastName ? (
                      `${subscriber.firstName || ''} ${subscriber.lastName || ''}`
                    ) : (
                      <span className={darkMode ? 'text-white/30' : 'text-black/30'}>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {subscriber.isActive ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle size={14} />
                        Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={14} />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                      {subscriber.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(subscriber.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleUnsubscribe(subscriber.email)}
                      className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Désinscrire"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
            Page {page + 1} sur {totalPages} ({total} résultats)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`p-2 border transition-colors disabled:opacity-30 ${
                darkMode
                  ? 'border-white/20 hover:border-primary'
                  : 'border-black/20 hover:border-primary'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className={`p-2 border transition-colors disabled:opacity-30 ${
                darkMode
                  ? 'border-white/20 hover:border-primary'
                  : 'border-black/20 hover:border-primary'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
