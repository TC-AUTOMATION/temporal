'use client';

import { useState, useEffect } from 'react';
import { useAdminStore, Order } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import {
  Truck,
  Package,
  MapPin,
  HandMetal,
  Search,
  Eye,
  Tag,
  Printer,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
  Mail,
  Phone,
  Send,
  Download,
  RefreshCw,
  Home,
  Navigation,
  FileText,
  Box,
  ArrowRight,
} from 'lucide-react';

export default function LivraisonsPage() {
  const { orders, fetchOrders, updateOrderStatus, createShipment, getShipmentLabel, isLoading } = useAdminStore();
  const { darkMode, language } = useStore();
  const [search, setSearch] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery' | 'relay' | 'handDelivery'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipmentLoading, setShipmentLoading] = useState<string | null>(null);
  const [shipmentResult, setShipmentResult] = useState<{ orderId: string; success: boolean; message: string } | null>(null);

  const t = {
    title: language === 'fr' ? 'GESTION DES LIVRAISONS' : 'DELIVERY MANAGEMENT',
    subtitle: language === 'fr' ? 'Expéditions, suivi et bons de commande' : 'Shipments, tracking and order slips',
    searchPlaceholder: language === 'fr' ? 'Rechercher commande, client, tracking...' : 'Search order, customer, tracking...',
    allDeliveries: language === 'fr' ? 'TOUTES' : 'ALL',
    homeDelivery: language === 'fr' ? 'DOMICILE' : 'HOME',
    relayPoint: language === 'fr' ? 'POINT RELAIS' : 'RELAY POINT',
    handDelivery: language === 'fr' ? 'MAIN PROPRE' : 'HAND DELIVERY',
    allStatuses: language === 'fr' ? 'TOUS STATUTS' : 'ALL STATUSES',
    pending: language === 'fr' ? 'En attente' : 'Pending',
    confirmed: language === 'fr' ? 'Confirmé' : 'Confirmed',
    preparing: language === 'fr' ? 'Préparation' : 'Preparing',
    shipped: language === 'fr' ? 'Expédié' : 'Shipped',
    delivered: language === 'fr' ? 'Livré' : 'Delivered',
    createShipment: language === 'fr' ? 'CRÉER ENVOI BOXTAL' : 'CREATE BOXTAL SHIPMENT',
    printLabel: language === 'fr' ? 'ÉTIQUETTE' : 'LABEL',
    printSlip: language === 'fr' ? 'BON DE COMMANDE' : 'ORDER SLIP',
    tracking: language === 'fr' ? 'SUIVI' : 'TRACKING',
    noOrders: language === 'fr' ? 'AUCUNE COMMANDE' : 'NO ORDERS',
    orderDetails: language === 'fr' ? 'DÉTAILS COMMANDE' : 'ORDER DETAILS',
    customerInfo: language === 'fr' ? 'CLIENT' : 'CUSTOMER',
    deliveryInfo: language === 'fr' ? 'LIVRAISON' : 'DELIVERY',
    relayInfo: language === 'fr' ? 'POINT RELAIS' : 'RELAY POINT',
    shipmentInfo: language === 'fr' ? 'EXPÉDITION BOXTAL' : 'BOXTAL SHIPMENT',
    items: language === 'fr' ? 'ARTICLES' : 'ITEMS',
    close: language === 'fr' ? 'FERMER' : 'CLOSE',
    toShip: language === 'fr' ? 'A EXPÉDIER' : 'TO SHIP',
    inTransit: language === 'fr' ? 'EN TRANSIT' : 'IN TRANSIT',
    deliveredCount: language === 'fr' ? 'LIVRÉES' : 'DELIVERED',
    relayOrders: language === 'fr' ? 'POINT RELAIS' : 'RELAY',
    markShipped: language === 'fr' ? 'MARQUER EXPÉDIÉ' : 'MARK SHIPPED',
    markDelivered: language === 'fr' ? 'MARQUER LIVRÉ' : 'MARK DELIVERED',
    creating: language === 'fr' ? 'CRÉATION...' : 'CREATING...',
    viewTracking: language === 'fr' ? 'VOIR LE SUIVI' : 'VIEW TRACKING',
    carrier: language === 'fr' ? 'Transporteur' : 'Carrier',
    weight: language === 'fr' ? 'Poids' : 'Weight',
    labelDownload: language === 'fr' ? 'TÉLÉCHARGER ÉTIQUETTE' : 'DOWNLOAD LABEL',
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders that are relevant for delivery management (paid or hand delivery)
  const deliveryOrders = orders.filter((o) => {
    // Only show orders that are actionable for delivery
    if (o.status === 'cancelled' || o.status === 'refunded') return false;
    if (o.paymentStatus !== 'paid' && o.deliveryMethod !== 'handDelivery') return false;
    return true;
  });

  const filteredOrders = deliveryOrders
    .filter((o) => {
      const matchesSearch = !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (o.trackingNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.relayPointName || '').toLowerCase().includes(search.toLowerCase());
      const matchesDelivery = deliveryFilter === 'all' || o.deliveryMethod === deliveryFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesDelivery && matchesStatus;
    })
    .sort((a, b) => {
      // Priority: pending > confirmed > preparing > shipped > delivered
      const statusPriority: Record<string, number> = { pending: 0, confirmed: 1, preparing: 2, shipped: 3, delivered: 4 };
      const pa = statusPriority[a.status] ?? 5;
      const pb = statusPriority[b.status] ?? 5;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const stats = {
    toShip: deliveryOrders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    inTransit: deliveryOrders.filter((o) => o.status === 'shipped').length,
    delivered: deliveryOrders.filter((o) => o.status === 'delivered').length,
    relay: deliveryOrders.filter((o) => o.deliveryMethod === 'relay').length,
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'relay': return <MapPin size={14} />;
      case 'handDelivery': return <HandMetal size={14} />;
      default: return <Home size={14} />;
    }
  };

  const getDeliveryLabel = (method: string) => {
    switch (method) {
      case 'relay': return language === 'fr' ? 'Point relais' : 'Relay point';
      case 'handDelivery': return language === 'fr' ? 'Main propre' : 'Hand delivery';
      default: return language === 'fr' ? 'Domicile' : 'Home';
    }
  };

  const getCarrierName = (carrier?: string) => {
    const names: Record<string, string> = {
      'mondial_relay': 'Mondial Relay',
      'colissimo': 'Colissimo',
      'chronopost': 'Chronopost',
      'ups': 'UPS',
      'main_propre': 'Main propre',
    };
    return carrier ? names[carrier] || carrier : '';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    const labels: Record<string, string> = {
      pending: t.pending, confirmed: t.confirmed, preparing: t.preparing, shipped: t.shipped, delivered: t.delivered,
    };
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getDeliveryBadge = (order: Order) => {
    const styles: Record<string, string> = {
      delivery: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
      relay: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
      handDelivery: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${styles[order.deliveryMethod] || ''}`}>
        {getDeliveryIcon(order.deliveryMethod)}
        {getDeliveryLabel(order.deliveryMethod)}
        {order.relayCarrier && <span className="opacity-60">({getCarrierName(order.relayCarrier)})</span>}
      </span>
    );
  };

  const handleCreateShipment = async (orderId: string) => {
    setShipmentLoading(orderId);
    setShipmentResult(null);
    const result = await createShipment(orderId);
    setShipmentLoading(null);
    setShipmentResult({
      orderId,
      success: result.success,
      message: result.success
        ? `Envoi créé - Tracking: ${result.trackingNumber || 'N/A'}`
        : result.error || 'Erreur',
    });
    // Refresh orders
    await fetchOrders();
    // Update selected order if it's the one we just shipped
    if (selectedOrder?.id === orderId) {
      const updated = useAdminStore.getState().orders.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
    }
  };

  const handlePrintLabel = async (orderId: string) => {
    const result = await getShipmentLabel(orderId);
    if (result.labelUrl) {
      window.open(result.labelUrl, '_blank');
    } else {
      setShipmentResult({
        orderId,
        success: false,
        message: result.error || 'Aucune étiquette disponible',
      });
    }
  };

  const handlePrintOrderSlip = (order: Order) => {
    const date = new Date(order.createdAt);
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bon de commande ${order.orderNumber}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000; }
  .brand { font-size: 28px; font-weight: 900; letter-spacing: 6px; }
  .order-info { text-align: right; }
  .order-num { font-size: 18px; font-weight: 700; }
  .order-date { font-size: 10px; color: #666; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .section { margin-bottom: 15px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; color: #333; }
  .info-line { font-size: 11px; line-height: 1.6; }
  .info-line.bold { font-weight: 700; font-size: 12px; }
  .relay-box { background: #f5f5f5; padding: 8px 12px; border-radius: 4px; margin-top: 6px; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  .items-table th { text-align: left; padding: 8px; border-bottom: 2px solid #000; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  .items-table td { padding: 8px; border-bottom: 1px solid #eee; }
  .items-table .qty { text-align: center; width: 50px; }
  .items-table .price { text-align: right; width: 80px; }
  .totals { float: right; width: 250px; }
  .total-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
  .total-line.discount { color: #2a7a2a; }
  .total-final { font-size: 16px; font-weight: 900; border-top: 2px solid #000; padding-top: 8px; margin-top: 6px; }
  .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; font-size: 9px; color: #999; }
  .tracking-box { background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; margin-top: 10px; }
  .notes-box { background: #fffde7; padding: 8px 12px; border-radius: 4px; margin-top: 10px; font-style: italic; }
  .delivery-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 1px; }
  .badge-home { background: #e8eaf6; color: #3f51b5; }
  .badge-relay { background: #e3f2fd; color: #1976d2; }
  .badge-hand { background: #fff3e0; color: #f57c00; }
</style></head><body>
  <div class="header">
    <div class="brand">TEMPORAL</div>
    <div class="order-info">
      <div class="order-num">${order.orderNumber}</div>
      <div class="order-date">${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  </div>

  <div class="grid">
    <div class="section">
      <div class="section-title">Client</div>
      <div class="info-line bold">${order.customer.firstName} ${order.customer.lastName}</div>
      <div class="info-line">${order.customer.email}</div>
      ${order.customer.phone ? `<div class="info-line">${order.customer.phone}</div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">Livraison</div>
      <div class="delivery-badge ${order.deliveryMethod === 'relay' ? 'badge-relay' : order.deliveryMethod === 'handDelivery' ? 'badge-hand' : 'badge-home'}">
        ${getDeliveryLabel(order.deliveryMethod).toUpperCase()}${order.relayCarrier ? ' - ' + getCarrierName(order.relayCarrier) : ''}
      </div>
      ${order.deliveryMethod !== 'handDelivery' ? `
        <div class="info-line" style="margin-top:6px">${order.customer.address || ''}</div>
        <div class="info-line">${order.customer.postalCode || ''} ${order.customer.city || ''}</div>
        ${order.customer.country && order.customer.country !== 'France' ? `<div class="info-line">${order.customer.country}</div>` : ''}
      ` : '<div class="info-line" style="margin-top:6px">A confirmer avec le client</div>'}
      ${order.relayPointName ? `<div class="relay-box"><strong>Relais:</strong> ${order.relayPointName}${order.relayPointAddress ? '<br>' + order.relayPointAddress : ''}</div>` : ''}
    </div>
  </div>

  <div class="section">
    <table class="items-table">
      <thead><tr><th>Article</th><th>Taille</th><th>Couleur</th><th class="qty">Qté</th><th class="price">Prix unit.</th><th class="price">Total</th></tr></thead>
      <tbody>
        ${order.items.map(item => `<tr>
          <td>${item.productName}</td>
          <td>${item.size || '-'}</td>
          <td>${item.color || '-'}</td>
          <td class="qty">${item.quantity}</td>
          <td class="price">${Number(item.price).toFixed(2)}&euro;</td>
          <td class="price">${(Number(item.price) * item.quantity).toFixed(2)}&euro;</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-line"><span>Sous-total</span><span>${Number(order.subtotal).toFixed(2)}&euro;</span></div>
    <div class="total-line"><span>Livraison</span><span>${order.shipping === 0 ? 'Gratuit' : Number(order.shipping).toFixed(2) + '&euro;'}</span></div>
    ${order.discount > 0 ? `<div class="total-line discount"><span>Réduction${order.promoCode ? ' (' + order.promoCode + ')' : ''}</span><span>-${Number(order.discount).toFixed(2)}&euro;</span></div>` : ''}
    <div class="total-line total-final"><span>TOTAL</span><span>${Number(order.total).toFixed(2)}&euro;</span></div>
  </div>

  ${order.trackingNumber ? `<div class="tracking-box">Numéro de suivi: ${order.trackingNumber}</div>` : ''}
  ${order.notes ? `<div class="notes-box">Note client: ${order.notes}</div>` : ''}

  <div class="footer">
    TEMPORAL - 22 Rue Pierre Brossolette, 27000 Évreux - contact@temporal-clothes.com
  </div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  };

  const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
    if (!carrier || !trackingNumber) return null;
    const urls: Record<string, string> = {
      'mondial_relay': `https://www.mondialrelay.fr/suivi-de-colis?NumEnvoi=${trackingNumber}`,
      'colissimo': `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
      'chronopost': `https://www.chronopost.fr/tracking-no-powerful/tracking-show/${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    };
    return urls[carrier] || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          {t.title}
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setStatusFilter('all'); setDeliveryFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all text-left ${
            statusFilter === 'all' && deliveryFilter === 'all'
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 ring-2 ring-yellow-500/20'
              : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20">
              <Package size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.toShip}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.toShip}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => { setStatusFilter('shipped'); setDeliveryFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all text-left ${
            statusFilter === 'shipped'
              ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/30 ring-2 ring-indigo-500/20'
              : 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20">
              <Truck size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.inTransit}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.inTransit}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => { setStatusFilter('delivered'); setDeliveryFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all text-left ${
            statusFilter === 'delivered'
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 ring-2 ring-green-500/20'
              : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.delivered}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.deliveredCount}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => { setDeliveryFilter('relay'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all text-left ${
            deliveryFilter === 'relay'
              ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 ring-2 ring-blue-500/20'
              : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <MapPin size={20} className="text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.relay}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.relayOrders}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
          <input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          />
        </div>

        {/* Delivery method filter */}
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: t.allDeliveries },
            { key: 'delivery' as const, label: t.homeDelivery },
            { key: 'relay' as const, label: t.relayPoint },
            { key: 'handDelivery' as const, label: t.handDelivery },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setDeliveryFilter(item.key)}
              className={`px-3 py-2 rounded-xl border text-xs transition-colors ${
                deliveryFilter === item.key
                  ? 'bg-primary/20 border-primary/30 text-primary'
                  : darkMode ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result feedback */}
      {shipmentResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          shipmentResult.success
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {shipmentResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm">{shipmentResult.message}</span>
          </div>
          <button onClick={() => setShipmentResult(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Commande</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Client</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.deliveryInfo}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Statut</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.tracking}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  {/* Order number */}
                  <td className="p-4">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                      {order.orderNumber}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                      {order.items.length} article{order.items.length > 1 ? 's' : ''} - {Number(order.total).toFixed(2)}€
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{order.customer.email}</p>
                    {order.customer.phone && (
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{order.customer.phone}</p>
                    )}
                  </td>

                  {/* Delivery */}
                  <td className="p-4">
                    {getDeliveryBadge(order)}
                    {order.deliveryMethod === 'relay' && order.relayPointName && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {order.relayPointName}
                      </p>
                    )}
                    {order.deliveryMethod === 'delivery' && order.customer.city && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {order.customer.postalCode} {order.customer.city}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Tracking */}
                  <td className="p-4">
                    {order.trackingNumber ? (
                      <div>
                        <p className={`text-xs font-mono ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                          {order.trackingNumber}
                        </p>
                        {getTrackingUrl(order.relayCarrier || order.shipment?.carrier, order.trackingNumber) && (
                          <a
                            href={getTrackingUrl(order.relayCarrier || order.shipment?.carrier, order.trackingNumber)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {t.viewTracking} <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* View details */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        title={t.orderDetails}
                      >
                        <Eye size={14} />
                      </button>

                      {/* Print order slip */}
                      <button
                        onClick={() => handlePrintOrderSlip(order)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        title={t.printSlip}
                      >
                        <FileText size={14} />
                      </button>

                      {/* Create shipment (if not yet created and not hand delivery) */}
                      {order.deliveryMethod !== 'handDelivery' && !order.trackingNumber && !order.shipment?.trackingNumber && (
                        <button
                          onClick={() => handleCreateShipment(order.id)}
                          disabled={shipmentLoading === order.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary transition-colors text-xs disabled:opacity-50"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                        >
                          {shipmentLoading === order.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Send size={12} />
                          )}
                          {shipmentLoading === order.id ? t.creating : t.createShipment}
                        </button>
                      )}

                      {/* Print label (if shipment exists) */}
                      {(order.shipment?.labelUrl || order.trackingNumber) && order.deliveryMethod !== 'handDelivery' && (
                        <button
                          onClick={() => handlePrintLabel(order.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-xs ${darkMode ? 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/25' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                        >
                          <Tag size={12} />
                          {t.printLabel}
                        </button>
                      )}

                      {/* Quick status actions */}
                      {['pending', 'confirmed', 'preparing'].includes(order.status) && order.trackingNumber && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-lg text-indigo-400 transition-colors text-xs"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                        >
                          <Truck size={12} />
                          {t.markShipped}
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 rounded-lg text-green-400 transition-colors text-xs"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                        >
                          <CheckCircle size={12} />
                          {t.markDelivered}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Truck size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noOrders}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div>
                <h2
                  className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.orderDetails} - {selectedOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(selectedOrder.status)}
                  {getDeliveryBadge(selectedOrder)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <X size={20} className={darkMode ? 'text-white' : 'text-gray-700'} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <h4 className={`text-sm mb-3 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.customerInfo}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Mail size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                        <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    {selectedOrder.customer.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Phone size={14} className="text-primary" />
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.customer.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <h4 className={`text-sm mb-3 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.deliveryInfo}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {getDeliveryIcon(selectedOrder.deliveryMethod)}
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getDeliveryLabel(selectedOrder.deliveryMethod)}
                        {selectedOrder.relayCarrier && ` - ${getCarrierName(selectedOrder.relayCarrier)}`}
                      </span>
                    </div>
                    {selectedOrder.deliveryMethod !== 'handDelivery' && (
                      <div className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                        <p>{selectedOrder.customer.address}</p>
                        <p>{selectedOrder.customer.postalCode} {selectedOrder.customer.city}</p>
                        {selectedOrder.customer.country && selectedOrder.customer.country !== 'France' && (
                          <p>{selectedOrder.customer.country}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Relay Point Info */}
              {selectedOrder.deliveryMethod === 'relay' && selectedOrder.relayPointName && (
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <h4 className={`text-sm mb-3 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    <MapPin size={16} />
                    {t.relayInfo}
                  </h4>
                  <div className={`space-y-1 ${darkMode ? 'text-blue-300/80' : 'text-blue-800'}`}>
                    <p className="font-medium">{selectedOrder.relayPointName}</p>
                    {selectedOrder.relayPointAddress && <p className="text-sm">{selectedOrder.relayPointAddress}</p>}
                    {selectedOrder.relayCarrier && <p className="text-sm">{t.carrier}: {getCarrierName(selectedOrder.relayCarrier)}</p>}
                    {selectedOrder.relayPointCode && <p className="text-xs opacity-60">Code: {selectedOrder.relayPointCode}</p>}
                  </div>
                </div>
              )}

              {/* Shipment / Tracking Info */}
              {(selectedOrder.trackingNumber || selectedOrder.shipment) && (
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'}`}>
                  <h4 className={`text-sm mb-3 flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    <Navigation size={16} />
                    {t.shipmentInfo}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.trackingNumber && (
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-indigo-400/60' : 'text-indigo-600'}`}>{t.tracking}</p>
                        <p className={`font-mono text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                    {selectedOrder.shipment?.carrier && (
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-indigo-400/60' : 'text-indigo-600'}`}>{t.carrier}</p>
                        <p className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{getCarrierName(selectedOrder.shipment.carrier)}</p>
                      </div>
                    )}
                    {selectedOrder.shipment?.weight && (
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-indigo-400/60' : 'text-indigo-600'}`}>{t.weight}</p>
                        <p className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{Number(selectedOrder.shipment.weight).toFixed(1)} kg</p>
                      </div>
                    )}
                    {selectedOrder.shipment?.labelUrl && (
                      <div>
                        <a
                          href={selectedOrder.shipment.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-400 text-xs transition-colors"
                          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                        >
                          <Download size={12} />
                          {t.labelDownload}
                        </a>
                      </div>
                    )}
                  </div>
                  {getTrackingUrl(selectedOrder.relayCarrier || selectedOrder.shipment?.carrier, selectedOrder.trackingNumber) && (
                    <a
                      href={getTrackingUrl(selectedOrder.relayCarrier || selectedOrder.shipment?.carrier, selectedOrder.trackingNumber)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-400 text-sm transition-colors"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      <ExternalLink size={14} />
                      {t.viewTracking}
                    </a>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className={`text-sm mb-3 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.items}
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.productName}</p>
                          <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                            {item.size && `Taille: ${item.size}`} {item.color && `- ${item.color}`} - Qté: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                        {(Number(item.price) * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className={`rounded-xl p-4 space-y-3 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`flex justify-between ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  <span>Sous-total</span>
                  <span>{Number(selectedOrder.subtotal).toFixed(2)}€</span>
                </div>
                <div className={`flex justify-between ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  <span>Livraison</span>
                  <span>{selectedOrder.shipping === 0 ? 'Gratuit' : `${Number(selectedOrder.shipping).toFixed(2)}€`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Réduction {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}</span>
                    <span>-{Number(selectedOrder.discount).toFixed(2)}€</span>
                  </div>
                )}
                <div className={`flex justify-between text-xl pt-3 border-t ${darkMode ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  <span>TOTAL</span>
                  <span className="text-primary">{Number(selectedOrder.total).toFixed(2)}€</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Note client:</p>
                  <p className={`text-sm italic ${darkMode ? 'text-yellow-300/80' : 'text-yellow-800'}`}>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex flex-wrap gap-3 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              {/* Print order slip */}
              <button
                onClick={() => handlePrintOrderSlip(selectedOrder)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                <Printer size={16} />
                {t.printSlip}
              </button>

              {/* Create shipment */}
              {selectedOrder.deliveryMethod !== 'handDelivery' && !selectedOrder.trackingNumber && (
                <button
                  onClick={() => handleCreateShipment(selectedOrder.id)}
                  disabled={shipmentLoading === selectedOrder.id}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors disabled:opacity-50"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {shipmentLoading === selectedOrder.id ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                  {shipmentLoading === selectedOrder.id ? t.creating : t.createShipment}
                </button>
              )}

              {/* Download label */}
              {selectedOrder.shipment?.labelUrl && (
                <a
                  href={selectedOrder.shipment.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-xl text-indigo-400 transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <Download size={16} />
                  {t.labelDownload}
                </a>
              )}

              {/* Quick status */}
              {['pending', 'confirmed', 'preparing'].includes(selectedOrder.status) && selectedOrder.trackingNumber && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'shipped');
                    setSelectedOrder({ ...selectedOrder, status: 'shipped' });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 rounded-xl text-indigo-400 transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <Truck size={16} />
                  {t.markShipped}
                </button>
              )}

              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'delivered');
                    setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 rounded-xl text-green-400 transition-colors"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  <CheckCircle size={16} />
                  {t.markDelivered}
                </button>
              )}

              <div className="flex-1" />

              <button
                onClick={() => setSelectedOrder(null)}
                className={`px-6 py-2.5 rounded-xl transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
