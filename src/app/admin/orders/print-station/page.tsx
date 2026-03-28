'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import {
  Printer,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle,
  Clock,
  Package,
  Zap,
  ZapOff,
  RotateCcw,
  MapPin,
  Phone,
  User,
  Truck,
  HandMetal,
} from 'lucide-react';

interface OrderItem {
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface PrintOrder {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  deliveryMethod: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  trackingNumber?: string;
  trackingUrl?: string;
  customerNotes?: string;
  printedAt?: string;
  createdAt: string;
  items: OrderItem[];
  promoCode?: { code: string };
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 880;
    gain1.gain.value = 0.3;
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    gain2.gain.value = 0.3;
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not available
  }
}

function generateLabelHTML(orders: PrintOrder[]): string {
  const labels = orders.map((order) => {
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const deliveryLabel =
      order.deliveryMethod === 'HAND_DELIVERY'
        ? 'REMISE EN MAIN PROPRE'
        : order.shippingStreet?.includes('[RELAY:')
          ? 'POINT RELAIS'
          : 'LIVRAISON DOMICILE';

    let relayInfo = '';
    let address = order.shippingStreet || '';
    if (address.includes('[RELAY:')) {
      const match = address.match(/\[RELAY:([^\]]+)\]/);
      if (match) relayInfo = escapeHTML(match[1]);
      address = address.replace(/\[RELAY:[^\]]+\]\s*/, '');
    }
    address = escapeHTML(address);

    const customerName = escapeHTML(`${order.customerFirstName} ${order.customerLastName}`);
    const customerPhone = order.customerPhone ? escapeHTML(order.customerPhone) : '';
    const customerEmail = escapeHTML(order.customerEmail);
    const city = escapeHTML(order.shippingCity || '');
    const postalCode = escapeHTML(order.shippingPostalCode || '');
    const country = escapeHTML(order.shippingCountry || '');
    const orderNumber = escapeHTML(order.orderNumber);
    const trackingNumber = order.trackingNumber ? escapeHTML(order.trackingNumber) : '';
    const customerNotes = order.customerNotes ? escapeHTML(order.customerNotes) : '';
    const promoCode = order.promoCode?.code ? escapeHTML(order.promoCode.code) : '';

    const itemsHTML = order.items
      .map(
        (item) =>
          `<div class="article">
            <span class="article-qty">${item.quantity}x</span>
            <span class="article-name">${escapeHTML(item.productName)}</span>
            ${item.size ? `<span class="article-detail">${escapeHTML(item.size)}</span>` : ''}
            ${item.color ? `<span class="article-detail">${escapeHTML(item.color)}</span>` : ''}
            <span class="article-price">${Number(item.totalPrice).toFixed(2)}&euro;</span>
          </div>`
      )
      .join('');

    return `
      <div class="label">
        <div class="label-header">
          <div class="brand">TEMPORAL</div>
          <div class="order-info">
            <div class="order-num">${orderNumber}</div>
            <div class="order-date">${dateStr} ${timeStr}</div>
          </div>
        </div>

        <div class="separator"></div>

        <div class="section">
          <div class="section-title">CLIENT</div>
          <div class="info-line bold">${customerName}</div>
          ${customerPhone ? `<div class="info-line">${customerPhone}</div>` : ''}
          <div class="info-line small">${customerEmail}</div>
        </div>

        <div class="section">
          <div class="section-title">${deliveryLabel}</div>
          ${
            order.deliveryMethod !== 'HAND_DELIVERY'
              ? `
            ${address ? `<div class="info-line">${address}</div>` : ''}
            <div class="info-line">${postalCode} ${city}</div>
            ${country && country !== 'France' ? `<div class="info-line">${country}</div>` : ''}
            ${relayInfo ? `<div class="info-line relay">Relais: ${relayInfo}</div>` : ''}
          `
              : '<div class="info-line">A confirmer avec le client</div>'
          }
        </div>

        <div class="section">
          <div class="section-title">ARTICLES</div>
          ${itemsHTML}
        </div>

        <div class="separator"></div>

        <div class="totals">
          <div class="total-line">
            <span>Sous-total</span>
            <span>${Number(order.subtotal).toFixed(2)}&euro;</span>
          </div>
          <div class="total-line">
            <span>Livraison</span>
            <span>${Number(order.shippingCost) === 0 ? 'Gratuit' : Number(order.shippingCost).toFixed(2) + '&euro;'}</span>
          </div>
          ${
            Number(order.discount) > 0
              ? `<div class="total-line discount">
                  <span>R&eacute;duction${promoCode ? ` (${promoCode})` : ''}</span>
                  <span>-${Number(order.discount).toFixed(2)}&euro;</span>
                </div>`
              : ''
          }
          <div class="total-line total-final">
            <span>TOTAL</span>
            <span>${Number(order.total).toFixed(2)}&euro;</span>
          </div>
        </div>

        ${trackingNumber ? `<div class="tracking">Suivi: ${trackingNumber}</div>` : ''}
        ${customerNotes ? `<div class="notes">Note: ${customerNotes}</div>` : ''}
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Bon de commande - Temporal</title>
<style>
  @page {
    size: 100mm 150mm;
    margin: 3mm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9px;
    line-height: 1.3;
    color: #000;
  }
  .label {
    width: 94mm;
    height: 144mm;
    padding: 2mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .label:last-child { page-break-after: auto; }
  .label-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2mm;
  }
  .brand {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 4px;
  }
  .order-info { text-align: right; }
  .order-num {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .order-date {
    font-size: 8px;
    color: #555;
    margin-top: 1px;
  }
  .separator {
    border-top: 1.5px solid #000;
    margin: 2mm 0;
  }
  .section {
    margin-bottom: 2.5mm;
  }
  .section-title {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.5px;
    border-bottom: 0.5px solid #999;
    padding-bottom: 0.5mm;
    margin-bottom: 1mm;
    color: #333;
  }
  .info-line {
    font-size: 10px;
    line-height: 1.4;
  }
  .info-line.bold { font-weight: 700; font-size: 11px; }
  .info-line.small { font-size: 8px; color: #555; }
  .info-line.relay {
    font-style: italic;
    font-size: 9px;
    background: #f0f0f0;
    padding: 1mm 2mm;
    margin-top: 1mm;
  }
  .article {
    display: flex;
    align-items: center;
    gap: 2mm;
    padding: 1mm 0;
    border-bottom: 0.5px dotted #ccc;
    font-size: 9px;
  }
  .article:last-child { border-bottom: none; }
  .article-qty {
    font-weight: 700;
    min-width: 6mm;
  }
  .article-name { flex: 1; }
  .article-detail {
    font-size: 8px;
    color: #555;
    background: #f0f0f0;
    padding: 0.5mm 1.5mm;
    border-radius: 1mm;
  }
  .article-price {
    font-weight: 600;
    min-width: 12mm;
    text-align: right;
  }
  .totals { margin-top: 1mm; }
  .total-line {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    padding: 0.5mm 0;
  }
  .total-line.discount { color: #2a7a2a; }
  .total-final {
    font-size: 14px;
    font-weight: 900;
    border-top: 1.5px solid #000;
    padding-top: 1.5mm;
    margin-top: 1mm;
  }
  .tracking {
    font-size: 8px;
    margin-top: 2mm;
    padding: 1.5mm 2mm;
    background: #f0f0f0;
    border-radius: 1mm;
    font-family: monospace;
  }
  .notes {
    font-size: 8px;
    margin-top: 1.5mm;
    padding: 1.5mm 2mm;
    border: 0.5px solid #ccc;
    border-radius: 1mm;
    color: #555;
    font-style: italic;
  }
</style>
</head>
<body>
${labels.join('')}
</body>
</html>`;
}

export default function PrintStationPage() {
  const { darkMode, language } = useStore();
  const [pendingOrders, setPendingOrders] = useState<PrintOrder[]>([]);
  const [printedOrders, setPrintedOrders] = useState<PrintOrder[]>([]);
  const [autoPrint, setAutoPrint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printingIds, setPrintingIds] = useState<Set<string>>(new Set());

  // Refs to avoid stale closures in polling callback
  const soundEnabledRef = useRef(soundEnabled);
  const autoPrintRef = useRef(autoPrint);
  const isPrintingRef = useRef(isPrinting);
  const pendingOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { autoPrintRef.current = autoPrint; }, [autoPrint]);
  useEffect(() => { isPrintingRef.current = isPrinting; }, [isPrinting]);

  const t = {
    title: language === 'fr' ? 'STATION D\'IMPRESSION' : 'PRINT STATION',
    autoPrint: language === 'fr' ? 'AUTO-PRINT' : 'AUTO-PRINT',
    sound: language === 'fr' ? 'SON' : 'SOUND',
    polling: language === 'fr' ? 'POLLING' : 'POLLING',
    printAll: language === 'fr' ? 'IMPRIMER TOUT' : 'PRINT ALL',
    print: language === 'fr' ? 'IMPRIMER' : 'PRINT',
    reprint: language === 'fr' ? 'RÉIMPRIMER' : 'REPRINT',
    newOrders: language === 'fr' ? 'NOUVELLES COMMANDES' : 'NEW ORDERS',
    printed: language === 'fr' ? 'DÉJÀ IMPRIMÉES (24H)' : 'ALREADY PRINTED (24H)',
    noNewOrders: language === 'fr' ? 'AUCUNE NOUVELLE COMMANDE' : 'NO NEW ORDERS',
    waitingOrders: language === 'fr' ? 'En attente d\'impression...' : 'Waiting for orders...',
    lastCheck: language === 'fr' ? 'Dernier check' : 'Last check',
    active: language === 'fr' ? 'ACTIF' : 'ACTIVE',
    paused: language === 'fr' ? 'PAUSE' : 'PAUSED',
    printing: language === 'fr' ? 'IMPRESSION...' : 'PRINTING...',
    handDelivery: language === 'fr' ? 'Main propre' : 'Hand delivery',
    delivery: language === 'fr' ? 'Livraison' : 'Delivery',
    relay: language === 'fr' ? 'Point relais' : 'Relay point',
    printedAt: language === 'fr' ? 'Imprimé' : 'Printed',
    instructions: language === 'fr'
      ? 'Gardez cet onglet ouvert. L\'imprimante Labelnize doit être définie comme imprimante par défaut.'
      : 'Keep this tab open. The Labelnize printer must be set as the default printer.',
  };

  const markAsPrinted = useCallback(async (orderIds: string[]) => {
    await Promise.allSettled(
      orderIds.map((id) =>
        fetch(`/api/admin/orders/${id}/print`, { method: 'POST' })
      )
    );
  }, []);

  const handlePrint = useCallback(
    (ordersToPrint: PrintOrder[]) => {
      if (isPrintingRef.current || ordersToPrint.length === 0) return;
      setIsPrinting(true);
      isPrintingRef.current = true;
      setPrintingIds(new Set(ordersToPrint.map((o) => o.id)));

      const html = generateLabelHTML(ordersToPrint);

      // Clean up previous iframe
      if (printFrameRef.current && printFrameRef.current.parentNode) {
        printFrameRef.current.parentNode.removeChild(printFrameRef.current);
      }
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '100mm';
      iframe.style.height = '150mm';
      document.body.appendChild(iframe);
      printFrameRef.current = iframe;

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        setIsPrinting(false);
        isPrintingRef.current = false;
        setPrintingIds(new Set());
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      const orderIds = ordersToPrint.map((o) => o.id);
      const cleanup = () => {
        markAsPrinted(orderIds);
        setIsPrinting(false);
        isPrintingRef.current = false;
        setPrintingIds(new Set());
      };

      // Wait for content to render, then print
      let cleaned = false;
      setTimeout(() => {
        const win = iframe.contentWindow;
        if (!win) {
          cleanup();
          return;
        }

        win.addEventListener('afterprint', () => {
          if (!cleaned) {
            cleaned = true;
            cleanup();
          }
        });
        win.print();

        // Fallback: if afterprint doesn't fire (some browsers), mark after 5s
        setTimeout(() => {
          if (!cleaned) {
            cleaned = true;
            cleanup();
          }
        }, 5000);
      }, 300);
    },
    [markAsPrinted]
  );

  // Stable fetch function using refs for reactive values
  const fetchPrintQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/print-queue');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const newPending: PrintOrder[] = data.data.pendingOrders;
      const newPrinted: PrintOrder[] = data.data.recentlyPrinted;
      const newPendingIds = new Set(newPending.map((o) => o.id));

      // Skip notifications on first fetch
      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
      } else {
        // Detect truly new orders (IDs not seen before)
        const brandNewOrders = newPending.filter(
          (o) => !pendingOrderIdsRef.current.has(o.id)
        );

        if (brandNewOrders.length > 0) {
          if (soundEnabledRef.current) playNotificationSound();
          if (autoPrintRef.current && !isPrintingRef.current) {
            handlePrint(brandNewOrders);
          }
        }
      }

      pendingOrderIdsRef.current = newPendingIds;
      setPendingOrders(newPending);
      setPrintedOrders(newPrinted);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Print queue fetch error:', error);
    }
  }, [handlePrint]);

  // Polling - stable interval that doesn't restart on every fetch
  useEffect(() => {
    if (isPolling) {
      fetchPrintQueue();
      pollingRef.current = setInterval(fetchPrintQueue, 10000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isPolling, fetchPrintQueue]);

  const getDeliveryBadge = (order: PrintOrder) => {
    if (order.deliveryMethod === 'HAND_DELIVERY') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <HandMetal size={10} />
          {t.handDelivery}
        </span>
      );
    }
    if (order.shippingStreet?.includes('[RELAY:')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <MapPin size={10} />
          {t.relay}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
        <Truck size={10} />
        {t.delivery}
      </span>
    );
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return language === 'fr' ? 'à l\'instant' : 'just now';
    if (diffMin < 60) return `${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    return `${diffH}h${diffMin % 60 > 0 ? String(diffMin % 60).padStart(2, '0') : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span
              className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {isPolling ? t.active : t.paused}
            </span>
            {lastCheck && (
              <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {t.lastCheck}: {lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* Toggle buttons */}
          <button
            onClick={() => setAutoPrint(!autoPrint)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              autoPrint
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : darkMode
                  ? 'bg-white/5 border-white/10 text-white/50'
                  : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            {autoPrint ? <Zap size={16} /> : <ZapOff size={16} />}
            {t.autoPrint}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : darkMode
                  ? 'bg-white/5 border-white/10 text-white/50'
                  : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {t.sound}
          </button>

          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              isPolling
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : darkMode
                  ? 'bg-white/5 border-white/10 text-white/50'
                  : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={isPolling ? 'animate-spin' : ''} style={isPolling ? { animationDuration: '3s' } : {}} />
            {t.polling}
          </button>

          {/* Print all button */}
          {pendingOrders.length > 0 && (
            <button
              onClick={() => handlePrint(pendingOrders)}
              disabled={isPrinting}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors disabled:opacity-50"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.9rem' }}
            >
              <Printer size={18} />
              {isPrinting ? t.printing : `${t.printAll} (${pendingOrders.length})`}
            </button>
          )}
        </div>

        {/* Instructions */}
        <p className={`text-xs mt-3 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
          {t.instructions}
        </p>
      </div>

      {/* Pending orders */}
      <div>
        <h2
          className={`text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          <Clock size={20} className="text-yellow-400" />
          {t.newOrders} ({pendingOrders.length})
        </h2>

        {pendingOrders.length === 0 ? (
          <div className={`p-12 rounded-2xl text-center ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <Package size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noNewOrders}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-white/20' : 'text-gray-300'}`}>
              {t.waitingOrders}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className={`p-5 rounded-2xl border transition-all ${
                  printingIds.has(order.id)
                    ? 'bg-primary/10 border-primary/30 animate-pulse'
                    : darkMode
                      ? 'bg-white/5 border-white/10 hover:border-primary/30'
                      : 'bg-white border-gray-200 hover:border-primary/30 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {order.orderNumber}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                  {getDeliveryBadge(order)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {order.customerFirstName} {order.customerLastName}
                    </span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                      <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>{order.customerPhone}</span>
                    </div>
                  )}
                  {order.shippingCity && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
                      <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {order.shippingPostalCode} {order.shippingCity}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`text-xs space-y-1 mb-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.quantity}x {item.productName}
                      {item.size ? ` (${item.size})` : ''}
                      {item.color ? ` - ${item.color}` : ''}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xl text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {Number(order.total).toFixed(2)}€
                  </p>
                  <button
                    onClick={() => handlePrint([order])}
                    disabled={isPrinting}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors disabled:opacity-50"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
                  >
                    <Printer size={14} />
                    {t.print}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently printed */}
      {printedOrders.length > 0 && (
        <div>
          <h2
            className={`text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <CheckCircle size={20} className="text-green-400" />
            {t.printed} ({printedOrders.length})
          </h2>

          <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {printedOrders.map((order) => (
                <div key={order.id} className={`flex items-center justify-between p-4 transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        {order.orderNumber}
                      </span>
                      <span className={`ml-3 text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {order.customerFirstName} {order.customerLastName}
                      </span>
                    </div>
                    {getDeliveryBadge(order)}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {Number(order.total).toFixed(2)}€
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                      {t.printedAt} {order.printedAt ? formatTime(order.printedAt) : ''}
                    </span>
                    <button
                      onClick={() => handlePrint([order])}
                      disabled={isPrinting}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 ${
                        darkMode
                          ? 'bg-white/5 hover:bg-white/10 text-white/60'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      <RotateCcw size={12} />
                      {t.reprint}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
