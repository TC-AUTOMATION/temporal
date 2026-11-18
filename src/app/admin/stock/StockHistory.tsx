'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, Bot, User, History, ChevronLeft, ChevronRight, DatabaseZap, Plus } from 'lucide-react';

interface Movement {
  id: string;
  variantId: string | null;
  productId: string | null;
  productName: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  delta: number;
  stockBefore: number | null;
  stockAfter: number | null;
  source: 'AUTO' | 'MANUAL';
  reason: 'ORDER' | 'ORDER_CANCELLED' | 'ORDER_REFUNDED' | 'MANUAL_ADJUSTMENT' | 'PRODUCT_EDIT' | 'INITIAL';
  orderId: string | null;
  orderNumber: string | null;
  userName: string | null;
  note: string | null;
  isBackfill: boolean;
  createdAt: string;
}

interface HistoryResponse {
  movements: Movement[];
  total: number;
  page: number;
  totalPages: number;
  summary: { AUTO: { count: number; net: number }; MANUAL: { count: number; net: number } };
}

const REASON_LABELS: Record<Movement['reason'], string> = {
  ORDER: 'Commande',
  ORDER_CANCELLED: 'Commande annulée',
  ORDER_REFUNDED: 'Remboursement',
  MANUAL_ADJUSTMENT: 'Ajustement manuel',
  PRODUCT_EDIT: 'Fiche produit',
  INITIAL: 'Stock de départ',
};

const bebas = { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' };

interface Props {
  darkMode: boolean;
  onAdjust: () => void;
  refreshKey: number;
  onStockChanged: () => void;
}

export default function StockHistory({ darkMode, onAdjust, refreshKey, onStockChanged }: Props) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'all' | 'AUTO' | 'MANUAL'>('all');
  const [reason, setReason] = useState<string>('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => setPage(1), [source, reason, debouncedQ]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50', hideInitial: '0' });
      if (source !== 'all') params.set('source', source);
      if (reason) params.set('reason', reason);
      if (debouncedQ) params.set('q', debouncedQ);
      const res = await fetch(`/api/admin/stock/history?${params}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, [page, source, reason, debouncedQ]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const runBackfill = async () => {
    setBackfillMsg(null);
    const dry = await fetch('/api/admin/stock/backfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: true }),
    }).then((r) => r.json());
    if (!dry.success) {
      setBackfillMsg('Erreur lors de l\'analyse des commandes');
      return;
    }
    const d = dry.data;
    const ok = window.confirm(
      `Importer l'historique depuis toutes les commandes ?\n\n` +
        `• ${d.ordersScanned} commandes en base (${d.ordersImported} à importer)\n` +
        `• ${d.movementsCreated} lignes d'historique seront créées\n` +
        (d.unmatchedItems ? `• ${d.unmatchedItems} article(s) dont la variante n'existe plus\n` : '') +
        `\nLe stock actuel n'est PAS modifié. Relancer l'import remplace simplement les lignes importées précédemment.`
    );
    if (!ok) return;
    setBackfilling(true);
    try {
      const res = await fetch('/api/admin/stock/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).then((r) => r.json());
      setBackfillMsg(
        res.success
          ? `✓ ${res.data.movementsCreated} lignes importées depuis ${res.data.ordersImported} commandes`
          : 'Erreur lors de l\'import'
      );
      fetchHistory();
      onStockChanged();
    } finally {
      setBackfilling(false);
    }
  };

  const card = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const muted = darkMode ? 'text-white/40' : 'text-gray-400';
  const strong = darkMode ? 'text-white' : 'text-gray-900';
  const pill = (active: boolean) =>
    `px-4 py-2.5 rounded-xl border transition-colors text-sm ${
      active
        ? 'bg-primary text-white border-primary'
        : darkMode
          ? 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
    }`;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Summary + actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-2 mb-1">
            <Bot size={14} className="text-blue-400" />
            <span className={`text-xs ${muted}`} style={bebas}>AUTO (COMMANDES)</span>
          </div>
          <p className={`text-2xl ${strong}`} style={bebas}>
            {data ? (data.summary.AUTO.net > 0 ? `+${data.summary.AUTO.net}` : data.summary.AUTO.net) : '—'}
          </p>
          <p className={`text-xs ${muted}`}>{data?.summary.AUTO.count ?? 0} mouvements</p>
        </div>
        <div className={`p-4 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-purple-400" />
            <span className={`text-xs ${muted}`} style={bebas}>MANUEL (TOI)</span>
          </div>
          <p className={`text-2xl ${strong}`} style={bebas}>
            {data ? (data.summary.MANUAL.net > 0 ? `+${data.summary.MANUAL.net}` : data.summary.MANUAL.net) : '—'}
          </p>
          <p className={`text-xs ${muted}`}>{data?.summary.MANUAL.count ?? 0} mouvements</p>
        </div>
        <button onClick={onAdjust} className={`p-4 rounded-2xl border text-left flex flex-col justify-center gap-1 bg-primary/10 border-primary/40 hover:bg-primary/20`}>
          <Plus size={18} className="text-primary" />
          <span className={`text-sm ${strong}`} style={bebas}>AJUSTEMENT MANUEL</span>
          <span className={`text-xs ${muted}`}>+1, −2, réassort…</span>
        </button>
        <button onClick={runBackfill} disabled={backfilling} className={`p-4 rounded-2xl border text-left flex flex-col justify-center gap-1 ${card} disabled:opacity-50`}>
          {backfilling ? <Loader2 size={18} className="animate-spin text-primary" /> : <DatabaseZap size={18} className="text-primary" />}
          <span className={`text-sm ${strong}`} style={bebas}>IMPORTER LES COMMANDES</span>
          <span className={`text-xs ${muted}`}>Historique depuis le début</span>
        </button>
      </div>
      {backfillMsg && <p className="text-sm text-green-400">{backfillMsg}</p>}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${muted}`} />
          <input
            placeholder="Produit, SKU, n° de commande, note…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={pill(source === 'all')} style={bebas} onClick={() => setSource('all')}>TOUT</button>
          <button className={pill(source === 'AUTO')} style={bebas} onClick={() => setSource('AUTO')}>AUTO</button>
          <button className={pill(source === 'MANUAL')} style={bebas} onClick={() => setSource('MANUAL')}>MANUEL</button>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <option value="">Tous les motifs</option>
            {Object.entries(REASON_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {loading && !data ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
        ) : !data || data.movements.length === 0 ? (
          <div className="text-center py-16">
            <History size={40} className={`mx-auto mb-3 ${muted}`} />
            <p className={muted} style={bebas}>AUCUN MOUVEMENT</p>
            <p className={`text-xs mt-1 ${muted}`}>Clique sur « Importer les commandes » pour reconstituer l&apos;historique.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs ${muted} border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`} style={bebas}>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">PRODUIT</th>
                  <th className="px-4 py-3 text-center">MOUVEMENT</th>
                  <th className="px-4 py-3 text-center">STOCK</th>
                  <th className="px-4 py-3">SOURCE</th>
                  <th className="px-4 py-3">DÉTAIL</th>
                </tr>
              </thead>
              <tbody>
                {data.movements.map((m) => (
                  <tr key={m.id} className={`border-b last:border-0 ${darkMode ? 'border-white/5' : 'border-gray-50'} ${loading ? 'opacity-50' : ''}`}>
                    <td className={`px-4 py-3 whitespace-nowrap ${muted}`}>{fmtDate(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${strong}`}>{m.productName}</p>
                      <p className={`text-xs ${muted}`}>{[m.color, m.size].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block min-w-[3rem] px-2 py-1 rounded-lg text-base ${
                          m.reason === 'INITIAL'
                            ? 'bg-gray-500/20 text-gray-400'
                            : m.delta > 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                        style={bebas}
                      >
                        {m.reason === 'INITIAL' ? m.delta : m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center whitespace-nowrap ${muted}`}>
                      {m.stockBefore !== null && m.stockAfter !== null ? (
                        <>
                          {m.stockBefore} → <span className={strong}>{m.stockAfter}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                          m.source === 'AUTO'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {m.source === 'AUTO' ? <Bot size={11} /> : <User size={11} />}
                        {m.source === 'AUTO' ? 'AUTO' : 'MANUEL'}
                      </span>
                      <p className={`text-xs mt-1 ${muted}`}>
                        {REASON_LABELS[m.reason]}
                        {m.isBackfill && ' · importé'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {m.orderNumber && (
                        <Link href={`/admin/orders?order=${encodeURIComponent(m.orderNumber)}`} className="text-primary hover:underline">
                          #{m.orderNumber}
                        </Link>
                      )}
                      {m.userName && <p className={`text-xs ${muted}`}>par {m.userName}</p>}
                      {m.note && <p className={`text-xs ${muted}`}>{m.note}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={`p-2 rounded-lg border disabled:opacity-30 ${card}`}>
            <ChevronLeft size={16} className={strong} />
          </button>
          <span className={`text-sm ${muted}`}>
            Page {data.page} / {data.totalPages} · {data.total} mouvements
          </span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className={`p-2 rounded-lg border disabled:opacity-30 ${card}`}>
            <ChevronRight size={16} className={strong} />
          </button>
        </div>
      )}
    </div>
  );
}
