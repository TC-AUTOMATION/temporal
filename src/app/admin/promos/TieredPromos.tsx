'use client';

import { useCallback, useEffect, useState } from 'react';
import { Zap, Plus, Trash2, Edit, ArrowUp, ArrowDown, X, Loader2, Power, Tag } from 'lucide-react';

type Condition = 'ANY' | 'PACK' | 'CATEGORY' | 'PRODUCT';
interface Tier { condition: Condition; targets: string[]; percent: number }

interface TieredPromo {
  id: string;
  code: string;
  name: string | null;
  isAutomatic: boolean;
  isActive: boolean;
  rules: Tier[] | null;
  validFrom: string;
  validUntil: string | null;
  minPurchase: string | null;
  maxDiscount: string | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usedCount: number;
  _count?: { orders: number };
}

interface Options {
  packs: { id: string; name: string; isActive: boolean }[];
  categories: { slug: string; name: string }[];
  products: { id: string; name: string }[];
}

interface FormState {
  id?: string;
  name: string;
  code: string;
  isAutomatic: boolean;
  isActive: boolean;
  validFrom: string; // datetime-local
  validUntil: string;
  tiers: Tier[];
  minPurchase: string;
  maxDiscount: string;
  maxUses: string;
  maxUsesPerUser: string;
}

const CONDITION_LABELS: Record<Condition, string> = {
  PACK: 'Un ensemble (pack) complet au panier',
  CATEGORY: 'Un article d\'une catégorie au panier',
  PRODUCT: 'Un produit précis au panier',
  ANY: 'N\'importe quel article (sinon)',
};

const bebas = { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' };

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Black Friday = lendemain du 4e jeudi de novembre (prochain à venir) */
function nextBlackFriday(): { start: Date; end: Date } {
  const now = new Date();
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    const nov1 = new Date(year, 10, 1);
    const firstThu = 1 + ((4 - nov1.getDay() + 7) % 7);
    const start = new Date(year, 10, firstThu + 21 + 1, 0, 0);
    const end = new Date(year, 10, firstThu + 21 + 4, 23, 59); // jusqu'au Cyber Monday inclus
    if (end > now) return { start, end };
  }
  throw new Error('unreachable');
}

const emptyForm = (): FormState => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 7 * 86400000);
  return {
    name: '',
    code: '',
    isAutomatic: true,
    isActive: true,
    validFrom: toLocalInput(start),
    validUntil: toLocalInput(end),
    tiers: [{ condition: 'ANY', targets: [], percent: 10 }],
    minPurchase: '',
    maxDiscount: '',
    maxUses: '',
    maxUsesPerUser: '',
  };
};

const blackFridayForm = (): FormState => {
  const { start, end } = nextBlackFriday();
  return {
    ...emptyForm(),
    name: 'Black Friday',
    code: `BLACKFRIDAY${start.getFullYear()}`,
    validFrom: toLocalInput(start),
    validUntil: toLocalInput(end),
    tiers: [
      { condition: 'PACK', targets: [], percent: 20 },
      { condition: 'ANY', targets: [], percent: 15 },
    ],
  };
};

export default function TieredPromos({ darkMode }: { darkMode: boolean }) {
  const [promos, setPromos] = useState<TieredPromo[]>([]);
  const [options, setOptions] = useState<Options>({ packs: [], categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-rules', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setPromos(json.data.promos);
        setOptions({ packs: json.data.packs, categories: json.data.categories, products: json.data.products });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const targetName = (c: Condition, id: string) =>
    c === 'PACK'
      ? options.packs.find((p) => p.id === id)?.name
      : c === 'CATEGORY'
        ? options.categories.find((p) => p.slug === id)?.name
        : options.products.find((p) => p.id === id)?.name;

  const describeTier = (t: Tier) => {
    const names = t.targets.map((id) => targetName(t.condition, id) || '?').join(', ');
    switch (t.condition) {
      case 'PACK': return names ? `Ensemble au panier (${names})` : 'Un ensemble au panier';
      case 'CATEGORY': return `Article ${names || '—'} au panier`;
      case 'PRODUCT': return `${names || '—'} au panier`;
      case 'ANY': return 'Tout autre panier';
    }
  };

  const status = (p: TieredPromo) => {
    const now = new Date();
    if (!p.isActive) return { label: 'INACTIVE', cls: 'bg-gray-500/20 text-gray-400' };
    if (new Date(p.validFrom) > now) return { label: 'À VENIR', cls: 'bg-blue-500/20 text-blue-400' };
    if (p.validUntil && new Date(p.validUntil) < now) return { label: 'TERMINÉE', cls: 'bg-red-500/20 text-red-400' };
    return { label: 'EN COURS', cls: 'bg-green-500/20 text-green-400' };
  };

  const fmt = (s: string) =>
    new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const openEdit = (p: TieredPromo) =>
    setForm({
      id: p.id,
      name: p.name || '',
      code: p.code,
      isAutomatic: p.isAutomatic,
      isActive: p.isActive,
      validFrom: toLocalInput(new Date(p.validFrom)),
      validUntil: p.validUntil ? toLocalInput(new Date(p.validUntil)) : '',
      tiers: p.rules?.length ? p.rules : [{ condition: 'ANY', targets: [], percent: 10 }],
      minPurchase: p.minPurchase ? String(Number(p.minPurchase)) : '',
      maxDiscount: p.maxDiscount ? String(Number(p.maxDiscount)) : '',
      maxUses: p.maxUses ? String(p.maxUses) : '',
      maxUsesPerUser: p.maxUsesPerUser ? String(p.maxUsesPerUser) : '',
    });

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const num = (s: string) => (s.trim() === '' ? null : Number(s));
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      isAutomatic: form.isAutomatic,
      isActive: form.isActive,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      tiers: form.tiers,
      minPurchase: num(form.minPurchase),
      maxDiscount: num(form.maxDiscount),
      maxUses: num(form.maxUses),
      maxUsesPerUser: num(form.maxUsesPerUser),
    };
    try {
      const res = await fetch(form.id ? `/api/admin/promo-rules/${form.id}` : '/api/admin/promo-rules', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const details = json.errors ? Object.entries(json.errors).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join(' · ') : '';
        throw new Error(details || json.error || 'Erreur');
      }
      setForm(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: TieredPromo) => {
    await fetch(`/api/admin/promo-rules/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  const remove = async (p: TieredPromo) => {
    if (!window.confirm(`Supprimer « ${p.name || p.code} » ?${p._count?.orders ? '\n(Elle a déjà été utilisée : elle sera désactivée au lieu d\'être supprimée.)' : ''}`)) return;
    await fetch(`/api/admin/promo-rules/${p.id}`, { method: 'DELETE' });
    load();
  };

  const updateTier = (i: number, patch: Partial<Tier>) =>
    setForm((f) => f && { ...f, tiers: f.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const moveTier = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      if (!f) return f;
      const tiers = [...f.tiers];
      const j = i + dir;
      if (j < 0 || j >= tiers.length) return f;
      [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
      return { ...f, tiers };
    });

  const card = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const muted = darkMode ? 'text-white/50' : 'text-gray-500';
  const strong = darkMode ? 'text-white' : 'text-gray-900';
  const input = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-sm ${
    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
  }`;
  const label = `block text-xs mb-1 ${muted}`;

  const targetOptions = (c: Condition) =>
    c === 'PACK'
      ? options.packs.map((p) => ({ id: p.id, name: p.name + (p.isActive ? '' : ' (inactif)') }))
      : c === 'CATEGORY'
        ? options.categories.map((p) => ({ id: p.slug, name: p.name }))
        : c === 'PRODUCT'
          ? options.products
          : [];

  return (
    <div className={`rounded-2xl border p-4 space-y-4 ${card}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-primary" />
          <div>
            <h2 className={`text-lg ${strong}`} style={bebas}>PROMOS AUTOMATIQUES & À PALIERS</h2>
            <p className={`text-xs ${muted}`}>Appliquées sur toute la commande, sans code (ou avec un code), entre deux dates.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setForm(blackFridayForm())}
            className="px-4 py-2 rounded-lg bg-black text-white border border-white/20 hover:bg-neutral-800 text-sm"
            style={bebas}
          >
            ⚡ MODÈLE BLACK FRIDAY
          </button>
          <button onClick={() => setForm(emptyForm())} className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-1" style={bebas}>
            <Plus size={14} /> NOUVELLE
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" /></div>
      ) : promos.length === 0 ? (
        <p className={`text-sm text-center py-6 ${muted}`}>Aucune promo automatique. Essaie le modèle Black Friday 👆</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {promos.map((p) => {
            const st = status(p);
            return (
              <div key={p.id} className={`rounded-xl border p-4 space-y-3 ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-lg ${strong}`} style={bebas}>{p.name || p.code}</p>
                    <p className={`text-xs ${muted} flex items-center gap-1`}>
                      <Tag size={11} />
                      {p.isAutomatic ? 'Automatique (sans code)' : `Code : ${p.code}`}
                    </p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${st.cls}`} style={bebas}>{st.label}</span>
                </div>
                <div className="space-y-1">
                  {(p.rules || []).map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className={muted}>{i + 1}. {describeTier(t)}</span>
                      <span className="text-green-400 font-bold" style={bebas}>-{t.percent}%</span>
                    </div>
                  ))}
                </div>
                <div className={`text-xs ${muted} flex flex-wrap gap-x-3`}>
                  <span>{fmt(p.validFrom)} → {p.validUntil ? fmt(p.validUntil) : 'sans fin'}</span>
                  <span>{p.usedCount} utilisation{p.usedCount > 1 ? 's' : ''}{p.maxUses ? ` / ${p.maxUses}` : ''}</span>
                  {p.minPurchase && <span>min. {Number(p.minPurchase)}€</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className={`flex-1 py-1.5 rounded-lg border text-sm flex items-center justify-center gap-1 ${darkMode ? 'border-white/10 text-white/70 hover:text-white' : 'border-gray-200 text-gray-600'}`}>
                    <Edit size={13} /> Modifier
                  </button>
                  <button onClick={() => toggle(p)} title={p.isActive ? 'Désactiver' : 'Activer'} className={`px-3 py-1.5 rounded-lg border ${p.isActive ? 'text-green-400 border-green-500/30' : `${muted} ${darkMode ? 'border-white/10' : 'border-gray-200'}`}`}>
                    <Power size={14} />
                  </button>
                  <button onClick={() => remove(p)} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setForm(null)}>
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5 space-y-4 ${darkMode ? 'bg-neutral-900 border-white/10' : 'bg-white border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-xl ${strong}`} style={bebas}>{form.id ? 'MODIFIER LA PROMO' : 'NOUVELLE PROMO À PALIERS'}</h3>
              <button onClick={() => setForm(null)} className={muted}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Nom affiché au client</label>
                <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Black Friday" />
              </div>
              <div>
                <label className={label}>Code {form.isAutomatic && '(interne, pas besoin de le saisir)'}</label>
                <input className={input} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BLACKFRIDAY" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {[true, false].map((auto) => (
                <button
                  key={String(auto)}
                  onClick={() => setForm({ ...form, isAutomatic: auto })}
                  className={`flex-1 p-3 rounded-lg border text-left ${form.isAutomatic === auto ? 'border-primary bg-primary/10' : darkMode ? 'border-white/10' : 'border-gray-200'}`}
                >
                  <p className={`text-sm ${strong}`} style={bebas}>{auto ? '⚡ AUTOMATIQUE' : '🏷️ AVEC CODE'}</p>
                  <p className={`text-xs ${muted}`}>{auto ? 'S\'applique toute seule pendant les dates' : 'Le client doit saisir le code'}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Début</label>
                <input type="datetime-local" className={input} value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div>
                <label className={label}>Fin (vide = sans fin)</label>
                <input type="datetime-local" className={input} value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
            </div>

            {/* Paliers */}
            <div className="space-y-2">
              <div>
                <p className={`text-sm ${strong}`} style={bebas}>PALIERS — LE PREMIER QUI CORRESPOND S&apos;APPLIQUE</p>
                <p className={`text-xs ${muted}`}>Le % s&apos;applique sur le total de TOUTE la commande. Mets les conditions les plus avantageuses en premier, et « N&apos;importe quel article » en dernier.</p>
              </div>
              {form.tiers.map((t, i) => (
                <div key={i} className={`rounded-lg border p-3 space-y-2 ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm w-5 ${muted}`}>{i + 1}.</span>
                    <select
                      className={input}
                      value={t.condition}
                      onChange={(e) => updateTier(i, { condition: e.target.value as Condition, targets: [] })}
                    >
                      {(Object.keys(CONDITION_LABELS) as Condition[]).map((c) => (
                        <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-green-400">−</span>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        className={`${input} w-16 text-center`}
                        value={t.percent}
                        onChange={(e) => updateTier(i, { percent: Number(e.target.value) })}
                      />
                      <span className={muted}>%</span>
                    </div>
                    <button onClick={() => moveTier(i, -1)} disabled={i === 0} className={`p-1 disabled:opacity-20 ${muted}`}><ArrowUp size={14} /></button>
                    <button onClick={() => moveTier(i, 1)} disabled={i === form.tiers.length - 1} className={`p-1 disabled:opacity-20 ${muted}`}><ArrowDown size={14} /></button>
                    <button
                      onClick={() => setForm({ ...form, tiers: form.tiers.filter((_, j) => j !== i) })}
                      disabled={form.tiers.length === 1}
                      className="p-1 text-red-400 disabled:opacity-20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {t.condition !== 'ANY' && (
                    <div className="flex flex-wrap gap-1.5 pl-7">
                      {t.condition === 'PACK' && (
                        <span className={`text-xs ${muted} w-full`}>Aucun coché = n&apos;importe quel ensemble</span>
                      )}
                      {targetOptions(t.condition).map((o) => {
                        const on = t.targets.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() => updateTier(i, { targets: on ? t.targets.filter((x) => x !== o.id) : [...t.targets, o.id] })}
                            className={`text-xs px-2 py-1 rounded-md border ${on ? 'border-primary bg-primary/20 text-primary' : darkMode ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-600'}`}
                          >
                            {o.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setForm({ ...form, tiers: [...form.tiers, { condition: 'ANY', targets: [], percent: 10 }] })}
                className={`text-sm flex items-center gap-1 ${muted} hover:text-primary`}
              >
                <Plus size={14} /> Ajouter un palier
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={label}>Achat min. (€)</label>
                <input type="number" className={input} value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} placeholder="—" />
              </div>
              <div>
                <label className={label}>Réduc. max (€)</label>
                <input type="number" className={input} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="—" />
              </div>
              <div>
                <label className={label}>Utilisations max</label>
                <input type="number" className={input} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="∞" />
              </div>
              <div>
                <label className={label}>Max / client</label>
                <input type="number" className={input} value={form.maxUsesPerUser} onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })} placeholder="∞" />
              </div>
            </div>

            <label className={`flex items-center gap-2 text-sm ${strong}`}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Activée
            </label>

            <div className={`rounded-lg p-3 text-sm ${darkMode ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-600'}`}>
              <strong className={strong}>Résumé :</strong>{' '}
              {form.tiers.map((t, i) => `${i > 0 ? 'sinon ' : ''}${describeTier(t).toLowerCase()} → -${t.percent}%`).join(', ')}
              {' '}sur toute la commande{form.isAutomatic ? ', appliqué automatiquement' : `, avec le code ${form.code || '…'}`}.
              {' '}Non cumulable avec un autre code (le plus avantageux s&apos;applique).
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={save}
              disabled={saving || !form.name.trim() || !form.code.trim() || !form.validFrom}
              className="w-full py-3 rounded-xl bg-primary text-white disabled:opacity-40 flex items-center justify-center gap-2"
              style={bebas}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {form.id ? 'ENREGISTRER' : 'CRÉER LA PROMO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
