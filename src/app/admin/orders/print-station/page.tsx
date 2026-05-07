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
  Eye,
  X,
  FileText,
  FlaskConical,
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
  billingStreet?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  relayCarrier?: string;
  relayPointCode?: string;
  relayPointName?: string;
  relayPointAddress?: string;
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

interface CompanySettings {
  companyLegalName?: string;
  companyLegalForm?: string;
  companyAddress?: string;
  companyPostalCode?: string;
  companyCity?: string;
  companyCountry?: string;
  companySiret?: string;
  companyVatNumber?: string;
  companyRcs?: string;
  companyCapital?: string;
  contactEmail?: string;
  contactPhone?: string;
  invoicePrefix?: string;
  invoiceFooterNote?: string;
  taxRate?: number;
}

// Inline SVG of the Temporal logo (public/logo-marquee.svg) — avoids a network
// round-trip inside the print iframe so the print dialog opens immediately.
const TEMPORAL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 112.5" width="90"><path fill="#44047c" d="M64.38 5.93c-.7.53-2.75 2.13-4.58 3.56-1.82 1.44-4.6 3.59-6.17 4.8-1.59 1.2-3.21 2.57-3.62 3.02-.55.6-1.2 1.75-2.33 4.07-.87 1.78-3.26 6.71-5.32 10.96-4.9 10.13-4.65 9.66-6.59 11.26-3.42 2.83-8.37 5.19-11.42 5.43-1.39.13-1.86.42-1.31.82.25.17.6.22 1.29.15 2.04-.17 9.26-.29 9.34-.13.07.08-.77 1.92-1.85 4.09-4.85 9.79-7.13 14.82-8.5 18.65-5.06 14.2-4.7 22.93 1 24.86 3.65 1.24 11.25-1.52 18.8-6.84 2.14-1.52 4.47-3.34 6.5-5.15 1.69-1.48 1.88-1.73 1.63-2.03-.36-.42-.7-.28-2.1.9-2.9 2.4-6.31 4.4-8.81 5.14-2.6.76-4.26.76-5.72.03-2.58-1.32-2.7-6.37-.26-12.54.37-.97 1.97-4.62 3.54-8.08 1.57-3.47 4.17-9.23 5.78-12.81 2.35-5.19 3.01-6.52 3.27-6.58.61-.13 17.31-.36 17.43-.25.17.14.11.34-1.82 5.5-.81 2.18-2.06 5.55-2.77 7.51-.71 1.96-1.65 4.49-2.08 5.66-.42 1.15-1.06 2.83-1.38 3.72-.72 1.97-2.57 6.96-2.99 8.07-1.31 3.51-2.78 8.05-3.05 9.46-.89 4.41-1.03 5.65-1.05 8.8 0 3.03.24 4.61.98 6.19.74 1.58 1.62 2.33 3.44 2.93 1.6.53 2.13.47 5.25-.63 3.36-1.18 6.69-3.16 10.18-6.1 3.52-2.93 7.33-6.78 7.11-7.17-.27-.42-.87-.05-2.49 1.52-2.63 2.55-5.82 4.52-8.5 5.23-.89.24-1.18.24-1.98.08-.98-.2-1.98-.8-2.5-1.48-1.03-1.41-1.05-6.04-.03-9.38.15-.48.52-1.7.83-2.66.33-.99.7-2.22.86-2.75.16-.54.45-1.41.66-1.94 1.65-4.51 4.78-13.35 5.43-15.35.5-1.6.65-1.8 1.02-1.46.29.26.5.71 1.14 2.42 1.28 3.41 2.9 5.22 5.19 5.84 6.48 1.7 18.52-13.14 24.71-30.46 1.66-4.65 2.57-8 3.24-11.94.26-1.62.34-2.8.36-5.53.02-3.94-.16-5-1.13-7.04-.65-1.33-1.42-2.14-2.6-2.73-1.9-.94-3.63-.65-7.74 1.36-4.07 1.97-6.19 3.47-10.28 7.23-1.36 1.25-2.94 2.66-3.5 3.12-.57.47-2.32 2.05-3.88 3.52-1.57 1.46-3.44 3.22-4.15 3.9-1.47 1.36-1.42 1.28-2.83 5.27-1.8 5.1-2.76 7.35-3.13 7.44-.5.13-3.46-.51-5.4-1.16-4.87-1.62-7.29-4.09-7.29-7.4 0-1.44.3-2.41 1.78-5.67.72-1.6 2.87-6.4 4.76-10.67 1.9-4.26 4.33-9.73 5.42-12.12 1.08-2.4 2-4.54 2.05-4.75.08-.34-.15-.64-.47-.66-.06 0-.67.44-1.37.95zm26.49 17.36c1.4.82 2.07 2.34 2.2 4.99.13 2.81-.39 5.41-1.86 9.5-2.94 8.15-7.34 15.98-11.12 19.82-1.16 1.16-1.7 1.6-2.73 2.1-1.13.54-1.43.62-2.44.62-1.01 0-1.22-.04-1.76-.47-.69-.51-1.21-1.51-1.22-2.32 0-.3.24-1.32.55-2.27.3-.95.86-2.7 1.23-3.88.63-2.02.69-2.15 1.2-2.36.74-.3.83-.54.42-1v-.37l2.89-8.62c1.6-4.75 3.1-9.08 3.32-9.63.62-1.5 2.02-3.75 2.86-4.57 2-1.94 5.01-2.64 6.83-1.57zm-20.19 24.77c3.48.11 3.53.11 3.47.45-.05.34-.1.34-4.6.38-2.82.02-4.58-.01-4.58-.1 0-.1.08-.37.16-.6.16-.41.2-.44 1.1-.34.5.05 2.5.14 4.45.2zM123.6 8.34c-1.47 1.4-4.2 3.96-6.06 5.7-5.55 5.2-5.15 4.6-7.35 10.66-.17.48-.38 1.03-.45 1.21-.06.18-.28.73-.45 1.21-.19.48-.51 1.36-.74 1.94-.22.58-.66 1.77-1 2.66-.32.89-.92 2.5-1.32 3.56-.83 2.18-1.44 3.85-2.14 5.69-.25.7-.69 1.84-.99 2.55-.77 1.94-2.56 6.79-2.98 8.08-.22.62-.97 2.65-1.7 4.53-3.25 8.37-5.38 14.5-6.13 17.62-.19.79-.41 1.71-.5 2.02-.19.7-.72 3.43-.95 4.88-.1.61-.26 1.59-.37 2.18-.26 1.54-.26 7 0 8.21.53 2.4 1.08 3.59 2.26 4.82 1.14 1.21 2.36 1.73 4.08 1.73 1.57 0 2.9-.37 5.66-1.6.42-.19.8-.34.84-.34.13 0 2.81-1.52 3.65-2.07 3.33-2.17 6-4.4 9.83-8.21 3.18-3.13 3.52-3.62 2.65-3.75-.27-.05-.82.38-2.26 1.74-2.97 2.81-5.53 4.47-8.44 5.5-1.44.5-3.37.53-4.28.05-1.62-.86-2.34-2.59-2.34-5.59.01-3.28.4-4.77 4.52-16.76.81-2.36 1.8-5.27 2.2-6.46.4-1.2.77-2.33.85-2.5.28-.7.71-1.99 1-3 .16-.58.67-2.1 1.12-3.39.95-2.7 3.7-10.78 4.85-14.22.43-1.3 1.11-3.25 1.51-4.34.42-1.1 1.83-5.23 3.17-9.21 1.32-3.98 3.17-9.5 4.12-12.28.94-2.78 1.66-5.12 1.62-5.2-.3-.47-.94-.03-3.51 2.39z"/></svg>`;

function formatHours(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function generateInvoiceHTML(orders: PrintOrder[], company: CompanySettings): string {
  const taxRate = Number(company.taxRate || 0); // 0 if auto-entrepreneur (no VAT)

  const invoices = orders.map((order) => {
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const isRelay = order.deliveryMethod === 'RELAY' || !!order.relayPointCode;
    const isHandDelivery = order.deliveryMethod === 'HAND_DELIVERY';
    const deliveryLabel = isHandDelivery
      ? 'Remise en main propre'
      : isRelay
        ? 'Point relais'
        : 'Livraison à domicile';

    const invoicePrefix = company.invoicePrefix || '';
    const invoiceNumber = escapeHTML(`${invoicePrefix}${order.orderNumber}`);
    const customerName = escapeHTML(`${order.customerFirstName} ${order.customerLastName}`);
    const customerEmail = escapeHTML(order.customerEmail);
    const customerPhone = order.customerPhone ? escapeHTML(order.customerPhone) : '';

    // BILLING: always the real person's home address
    const billingStreet = escapeHTML(order.billingStreet || '');
    const billingCity = escapeHTML(order.billingCity || '');
    const billingPostalCode = escapeHTML(order.billingPostalCode || '');
    const billingCountry = escapeHTML(order.billingCountry || 'France');

    // SHIPPING: where the carrier drops off (relay for RELAY, home for DELIVERY)
    const shipStreet = escapeHTML(order.relayPointAddress || order.shippingStreet || '');
    const shipCity = escapeHTML(order.shippingCity || '');
    const shipPostalCode = escapeHTML(order.shippingPostalCode || '');
    const shipCountry = escapeHTML(order.shippingCountry || 'France');
    const relayName = order.relayPointName ? escapeHTML(order.relayPointName) : '';
    const relayCarrier = order.relayCarrier ? escapeHTML(order.relayCarrier.replace('_', ' ')) : '';

    const customerNotes = order.customerNotes ? escapeHTML(order.customerNotes) : '';
    const promoCode = order.promoCode?.code ? escapeHTML(order.promoCode.code) : '';
    const trackingNumber = order.trackingNumber ? escapeHTML(order.trackingNumber) : '';

    // Hide the "Expédié à" block when shipping == billing (saves space for home delivery)
    const shippingDiffersFromBilling = isRelay || isHandDelivery ||
      (shipStreet !== billingStreet) ||
      (shipCity !== billingCity) ||
      (shipPostalCode !== billingPostalCode);

    // Compute HT from TTC (what the customer paid) and the tax rate
    const totalTTC = Number(order.total) || 0;
    const subtotalTTC = Number(order.subtotal) || 0;
    const shippingTTC = Number(order.shippingCost) || 0;
    const discountTTC = Number(order.discount) || 0;
    const vatFactor = taxRate > 0 ? 1 + taxRate / 100 : 1;
    const subtotalHT = subtotalTTC / vatFactor;
    const shippingHT = shippingTTC / vatFactor;
    const discountHT = discountTTC / vatFactor;
    const totalHT = totalTTC / vatFactor;
    const totalVAT = totalTTC - totalHT;
    const showVAT = taxRate > 0;

    const itemsRows = order.items
      .map((item) => {
        const qty = item.quantity;
        const lineTotalTTC = Number(item.totalPrice) || 0;
        const lineTotalHT = lineTotalTTC / vatFactor;
        const unitHT = lineTotalHT / qty;
        const variantLabel = [item.size, item.color].filter(Boolean).join(' · ');
        return `
          <tr>
            <td class="desc">
              <div class="pname">${escapeHTML(item.productName)}</div>
              ${variantLabel ? `<div class="pvariant">${escapeHTML(variantLabel)}</div>` : ''}
            </td>
            <td class="qty">${qty}</td>
            <td class="amt">${unitHT.toFixed(2)}&nbsp;€</td>
            ${showVAT ? `<td class="amt">${taxRate.toFixed(0)}%</td>` : ''}
            <td class="amt total">${lineTotalHT.toFixed(2)}&nbsp;€</td>
          </tr>
        `;
      })
      .join('');

    // Additional lines for shipping + discount
    const shippingRow = shippingTTC > 0
      ? `<tr>
          <td class="desc"><div class="pname">${escapeHTML(deliveryLabel)}</div></td>
          <td class="qty">1</td>
          <td class="amt">${shippingHT.toFixed(2)}&nbsp;€</td>
          ${showVAT ? `<td class="amt">${taxRate.toFixed(0)}%</td>` : ''}
          <td class="amt total">${shippingHT.toFixed(2)}&nbsp;€</td>
         </tr>`
      : '';

    const discountRow = discountTTC > 0
      ? `<tr>
          <td class="desc"><div class="pname">Remise ${promoCode ? `(${promoCode})` : ''}</div></td>
          <td class="qty"></td>
          <td class="amt"></td>
          ${showVAT ? `<td class="amt"></td>` : ''}
          <td class="amt total">-${discountHT.toFixed(2)}&nbsp;€</td>
         </tr>`
      : '';

    const companyName = escapeHTML(company.companyLegalName || 'Temporal');
    const companyForm = company.companyLegalForm ? escapeHTML(company.companyLegalForm) : '';
    const companyAddr = escapeHTML(company.companyAddress || '');
    const companyCity = escapeHTML(`${company.companyPostalCode || ''} ${company.companyCity || ''}`.trim());
    const companyCountry = escapeHTML(company.companyCountry || 'France');
    const siret = company.companySiret ? escapeHTML(company.companySiret) : '';
    const vat = company.companyVatNumber ? escapeHTML(company.companyVatNumber) : '';
    const rcs = company.companyRcs ? escapeHTML(company.companyRcs) : '';
    const capital = company.companyCapital ? escapeHTML(company.companyCapital) : '';
    const coEmail = escapeHTML(company.contactEmail || '');
    const coPhone = escapeHTML(company.contactPhone || '');
    const footerNote = company.invoiceFooterNote ? escapeHTML(company.invoiceFooterNote) : '';

    return `
      <section class="invoice">
        <!-- Header: logo + invoice title/number -->
        <header class="header">
          <div class="brand">
            <div class="logo">${TEMPORAL_LOGO_SVG}</div>
            <div class="brand-text">
              <div class="brand-name">${companyName}</div>
              ${companyForm ? `<div class="brand-sub">${companyForm}</div>` : ''}
              <div class="brand-sub">${companyAddr}</div>
              <div class="brand-sub">${companyCity} — ${companyCountry}</div>
              ${coEmail ? `<div class="brand-sub">${coEmail}</div>` : ''}
              ${coPhone ? `<div class="brand-sub">${coPhone}</div>` : ''}
            </div>
          </div>
          <div class="invoice-meta">
            <div class="meta-title">FACTURE</div>
            <div class="meta-num">${invoiceNumber}</div>
            <div class="meta-date">Émise le ${dateStr}</div>
            <div class="meta-paid">Acquittée le ${dateStr} à ${formatHours(order.createdAt)}</div>
          </div>
        </header>

        <!-- Billed-to + Shipped-to blocks -->
        <div class="addr-grid">
          <div class="addr-block billto">
            <div class="addr-label">FACTURÉ À</div>
            <div class="addr-name">${customerName}</div>
            ${billingStreet ? `<div>${billingStreet}</div>` : ''}
            <div>${billingPostalCode} ${billingCity}</div>
            ${billingCountry && billingCountry.toLowerCase() !== 'france' ? `<div>${billingCountry}</div>` : ''}
            <div class="addr-contact">${customerEmail}${customerPhone ? `<br>${customerPhone}` : ''}</div>
          </div>
          ${shippingDiffersFromBilling ? `
            <div class="addr-block shipto">
              <div class="addr-label">EXPÉDIÉ À</div>
              <div class="addr-name">${escapeHTML(deliveryLabel)}${relayCarrier ? ` · ${relayCarrier}` : ''}</div>
              ${relayName ? `<div><strong>${relayName}</strong></div>` : ''}
              ${isHandDelivery
                ? '<div class="addr-muted">Remise en main propre (convenu avec le client)</div>'
                : `${shipStreet ? `<div>${shipStreet}</div>` : ''}
                   <div>${shipPostalCode} ${shipCity}</div>
                   ${shipCountry && shipCountry.toLowerCase() !== 'france' ? `<div>${shipCountry}</div>` : ''}`
              }
              ${trackingNumber ? `<div class="addr-track"><strong>Suivi :</strong> ${trackingNumber}</div>` : ''}
            </div>
          ` : `
            <div class="addr-block shipto">
              <div class="addr-label">LIVRAISON</div>
              <div class="addr-muted">${escapeHTML(deliveryLabel)} — identique à l'adresse de facturation</div>
              ${trackingNumber ? `<div class="addr-track"><strong>Suivi :</strong> ${trackingNumber}</div>` : ''}
            </div>
          `}
        </div>

        <!-- Items table -->
        <table class="items">
          <thead>
            <tr>
              <th class="desc">Description</th>
              <th class="qty">Qté</th>
              <th class="amt">P.U. HT</th>
              ${showVAT ? `<th class="amt">TVA</th>` : ''}
              <th class="amt">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            ${shippingRow}
            ${discountRow}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          ${showVAT ? `
            <div class="total-line">
              <span>Total HT</span>
              <span>${totalHT.toFixed(2)}&nbsp;€</span>
            </div>
            <div class="total-line">
              <span>TVA ${taxRate.toFixed(0)}%</span>
              <span>${totalVAT.toFixed(2)}&nbsp;€</span>
            </div>
          ` : ''}
          <div class="total-line grand">
            <span>Total ${showVAT ? 'TTC' : ''}</span>
            <span>${totalTTC.toFixed(2)}&nbsp;€</span>
          </div>
          <div class="paid-badge">Payé par carte bancaire (Stripe)</div>
        </div>

        ${customerNotes ? `<div class="notes"><strong>Note du client :</strong> ${customerNotes}</div>` : ''}

        <!-- Legal footer -->
        <footer class="footer">
          ${footerNote ? `<div class="footnote">${footerNote}</div>` : ''}
          <div class="legal">
            ${companyName}${companyForm ? ` · ${companyForm}` : ''}${capital ? ` au capital de ${capital}` : ''}
            ${siret ? ` · SIRET ${siret}` : ''}
            ${rcs ? ` · ${rcs}` : ''}
            ${vat ? ` · TVA intra ${vat}` : ''}
          </div>
        </footer>
      </section>
    `;
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Facture — Temporal</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.4; }
  body { background: #fff; }

  .invoice {
    width: 186mm;
    min-height: 273mm;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    padding: 2mm 0;
  }
  .invoice:last-child { page-break-after: auto; }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 6mm;
    border-bottom: 2px solid #111;
    margin-bottom: 8mm;
  }
  .brand { display: flex; gap: 4mm; align-items: flex-start; }
  .logo { width: 22mm; height: 16mm; display: flex; align-items: center; }
  .logo svg { width: 100%; height: 100%; }
  .brand-text { font-size: 8pt; line-height: 1.5; }
  .brand-name {
    font-size: 14pt;
    font-weight: 900;
    letter-spacing: 2px;
    color: #111;
    margin-bottom: 1mm;
  }
  .brand-sub { color: #555; font-size: 8pt; }

  .invoice-meta { text-align: right; }
  .meta-title {
    font-size: 18pt;
    font-weight: 900;
    letter-spacing: 3px;
    color: #44047c;
    margin-bottom: 2mm;
  }
  .meta-num {
    font-size: 11pt;
    font-weight: 700;
    font-family: "SF Mono", Menlo, monospace;
    margin-bottom: 1mm;
  }
  .meta-date { font-size: 9pt; color: #555; }
  .meta-paid { font-size: 8pt; color: #16a34a; margin-top: 1mm; }

  /* Address grid: FACTURÉ À + EXPÉDIÉ À side by side */
  .addr-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5mm;
    margin-bottom: 8mm;
  }
  .addr-block {
    background: #f8f8f8;
    padding: 4mm 5mm;
    border-left: 3px solid #44047c;
    font-size: 10pt;
    line-height: 1.5;
  }
  .addr-block.shipto { border-left-color: #666; background: #f4f4f4; }
  .addr-label {
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 2px;
    color: #666;
    margin-bottom: 2mm;
  }
  .addr-name {
    font-size: 11pt;
    font-weight: 700;
    margin-bottom: 1mm;
  }
  .addr-contact { font-size: 9pt; color: #555; margin-top: 2mm; padding-top: 2mm; border-top: 1px dashed #ccc; }
  .addr-track { font-size: 9pt; color: #333; margin-top: 2mm; padding-top: 2mm; border-top: 1px dashed #ccc; font-family: "SF Mono", Menlo, monospace; word-break: break-all; }
  .addr-muted { font-size: 9pt; color: #888; font-style: italic; }

  /* Items */
  .items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6mm;
  }
  .items thead th {
    background: #111;
    color: #fff;
    padding: 3mm 4mm;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .items thead th.desc { text-align: left; }
  .items thead th.qty, .items thead th.amt { text-align: right; }
  .items tbody td {
    padding: 3mm 4mm;
    font-size: 10pt;
    border-bottom: 0.5px solid #eee;
    vertical-align: top;
  }
  .items tbody td.desc { text-align: left; }
  .items tbody td.qty, .items tbody td.amt { text-align: right; white-space: nowrap; }
  .items tbody td.total { font-weight: 700; }
  .items .pname { font-weight: 600; }
  .items .pvariant { font-size: 8pt; color: #777; margin-top: 0.5mm; }

  /* Totals */
  .totals {
    margin-left: auto;
    width: 70mm;
    margin-bottom: 8mm;
  }
  .total-line {
    display: flex;
    justify-content: space-between;
    padding: 2mm 3mm;
    font-size: 10pt;
  }
  .total-line.grand {
    background: #111;
    color: #fff;
    font-size: 14pt;
    font-weight: 900;
    padding: 4mm;
    margin-top: 2mm;
  }
  .paid-badge {
    margin-top: 3mm;
    padding: 2mm 3mm;
    background: #dcfce7;
    color: #166534;
    font-size: 9pt;
    font-weight: 600;
    text-align: center;
    border-radius: 2mm;
  }

  .notes {
    padding: 3mm 4mm;
    background: #fef9c3;
    border-left: 3px solid #ca8a04;
    font-size: 9pt;
    color: #713f12;
    margin-bottom: 6mm;
    font-style: italic;
  }

  /* Footer */
  .footer {
    margin-top: auto;
    padding-top: 5mm;
    border-top: 1px solid #ddd;
    font-size: 7pt;
    color: #666;
    text-align: center;
    line-height: 1.6;
  }
  .footnote {
    font-weight: 600;
    font-size: 8pt;
    color: #333;
    margin-bottom: 2mm;
  }
  .legal { line-height: 1.5; }
</style>
</head>
<body>
${invoices.join('')}
</body>
</html>`;
}

function generateThermalHTML(orders: PrintOrder[], company: CompanySettings): string {
  const receipts = orders.map((order) => {
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const isRelay = order.deliveryMethod === 'RELAY' || !!order.relayPointCode;
    const isHandDelivery = order.deliveryMethod === 'HAND_DELIVERY';
    const deliveryLabel = isHandDelivery ? 'MAIN PROPRE' : isRelay ? 'POINT RELAIS' : 'LIVRAISON DOMICILE';

    const customerName = `${order.customerFirstName.toUpperCase()} ${order.customerLastName.toUpperCase()}`;
    const phone = order.customerPhone ? escapeHTML(order.customerPhone) : '';

    let deliveryLines = '';
    if (isHandDelivery) {
      deliveryLines = '<div>Remise en main propre</div>';
    } else if (isRelay) {
      if (order.relayPointName) deliveryLines += `<div class="bold">${escapeHTML(order.relayPointName)}</div>`;
      if (order.relayCarrier) deliveryLines += `<div class="small">${escapeHTML(order.relayCarrier.replace('_', ' '))}</div>`;
      if (order.relayPointAddress) deliveryLines += `<div>${escapeHTML(order.relayPointAddress)}</div>`;
      if (order.shippingPostalCode || order.shippingCity) deliveryLines += `<div>${escapeHTML(order.shippingPostalCode || '')} ${escapeHTML(order.shippingCity || '')}</div>`;
    } else {
      if (order.shippingStreet) deliveryLines += `<div>${escapeHTML(order.shippingStreet)}</div>`;
      if (order.shippingPostalCode || order.shippingCity) deliveryLines += `<div>${escapeHTML(order.shippingPostalCode || '')} ${escapeHTML(order.shippingCity || '')}</div>`;
    }

    const itemLines = order.items.map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join('/');
      const label = `${item.quantity}x ${item.productName}${variant ? ` (${variant})` : ''}`;
      const price = `${Number(item.totalPrice).toFixed(2)}\u20ac`;
      return `<div class="row"><span class="item-desc">${escapeHTML(label)}</span><span class="item-price">${price}</span></div>`;
    }).join('');

    const subtotal = Number(order.subtotal);
    const shipping = Number(order.shippingCost);
    const discount = Number(order.discount);
    const total = Number(order.total);

    const shippingRow = shipping > 0
      ? `<div class="row"><span>Livraison :</span><span>${shipping.toFixed(2)}\u20ac</span></div>`
      : `<div class="row"><span>Livraison :</span><span>OFFERTE</span></div>`;

    const discountRow = discount > 0
      ? `<div class="row"><span>Remise${order.promoCode?.code ? ` (${escapeHTML(order.promoCode.code)})` : ''} :</span><span>-${discount.toFixed(2)}\u20ac</span></div>`
      : '';

    const trackingRow = order.trackingNumber
      ? `<div class="small" style="margin-top:2mm">Suivi: ${escapeHTML(order.trackingNumber)}</div>`
      : '';

    const notesSection = order.customerNotes
      ? `<div class="sep-dash"></div><div class="small bold">NOTE CLIENT :</div><div class="small" style="margin-top:1mm">${escapeHTML(order.customerNotes)}</div>`
      : '';

    const companyName = escapeHTML((company.companyLegalName || 'TEMPORAL').toUpperCase());
    const contactInfo = escapeHTML(company.contactEmail || 'temporal-clothes.com');

    return `
<div class="receipt">
  <div class="center large">${companyName}</div>
  <div class="center small" style="margin-bottom:4mm">${contactInfo}</div>
  <div class="sep-solid"></div>
  <div class="row"><span>Commande :</span><span class="bold">${escapeHTML(order.orderNumber)}</span></div>
  <div class="row"><span>Date :</span><span>${dateStr} ${timeStr}</span></div>
  <div class="sep-dash"></div>
  <div class="bold">${deliveryLabel}</div>
  <div style="margin-top:1mm;font-weight:bold">${escapeHTML(customerName)}</div>
  ${phone ? `<div class="small">${phone}</div>` : ''}
  <div style="margin-top:1mm">${deliveryLines}</div>
  ${trackingRow}
  <div class="sep-dash"></div>
  <div class="bold small" style="margin-bottom:2mm">ARTICLES :</div>
  ${itemLines}
  <div class="sep-dash"></div>
  <div class="row"><span>Sous-total :</span><span>${subtotal.toFixed(2)}\u20ac</span></div>
  ${shippingRow}
  ${discountRow}
  <div class="sep-solid"></div>
  <div class="row grand-total"><span>TOTAL :</span><span>${total.toFixed(2)}\u20ac</span></div>
  <div class="sep-dash"></div>
  <div class="paid-line">Paye par CB (Stripe)</div>
  ${notesSection}
  <div class="sep-solid"></div>
  <div class="footer">Merci pour votre commande !</div>
  <div style="margin-bottom:10mm"></div>
</div>`;
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Ticket Thermique — Temporal</title>
<style>
  @page { size: 100mm 150mm; margin: 3mm 4mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 9pt; color: #000; background: #fff; width: 92mm; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .large { font-size: 14pt; font-weight: bold; letter-spacing: 2px; }
  .small { font-size: 7.5pt; }
  .sep-dash { border-top: 1px dashed #000; margin: 3mm 0; }
  .sep-solid { border-top: 1.5px solid #000; margin: 3mm 0; }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 2mm; line-height: 1.8; }
  .row span:first-child { flex: 1; }
  .row span:last-child { white-space: nowrap; font-weight: 600; }
  .item-desc { flex: 1; word-break: break-word; }
  .item-price { white-space: nowrap; padding-left: 2mm; font-weight: bold; }
  .grand-total { font-size: 13pt; font-weight: bold; margin: 1mm 0; }
  .paid-line { text-align: center; font-size: 8pt; margin: 2mm 0; }
  .footer { text-align: center; font-size: 9pt; font-weight: bold; letter-spacing: 1px; }
  .receipt { page-break-after: always; }
  .receipt:last-child { page-break-after: auto; }
</style>
</head>
<body>
${receipts.join('')}
</body>
</html>`;
}

const TEST_ORDER: PrintOrder = {
  id: '__test__',
  orderNumber: 'TEST-000',
  customerFirstName: 'Jean',
  customerLastName: 'Dupont',
  customerEmail: 'jean.dupont@example.com',
  customerPhone: '06 12 34 56 78',
  shippingStreet: '12 Rue de la Paix',
  shippingCity: 'Paris',
  shippingPostalCode: '75001',
  shippingCountry: 'France',
  billingStreet: '12 Rue de la Paix',
  billingCity: 'Paris',
  billingPostalCode: '75001',
  billingCountry: 'France',
  deliveryMethod: 'DELIVERY',
  subtotal: '55.00',
  shippingCost: '4.90',
  discount: '0',
  total: '59.90',
  createdAt: new Date().toISOString(),
  items: [
    { productName: 'T-Shirt TEST', size: 'M', color: 'Blanc', quantity: 1, unitPrice: '30.00', totalPrice: '30.00' },
    { productName: 'Hoodie TEST', size: 'L', color: '', quantity: 1, unitPrice: '25.00', totalPrice: '25.00' },
  ],
};

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
  const [company, setCompany] = useState<CompanySettings>({});
  const [printMode, setPrintMode] = useState<'thermal' | 'a4'>('thermal');
  const [previewOrder, setPreviewOrder] = useState<PrintOrder | null>(null);

  // Refs to avoid stale closures in polling callback
  const soundEnabledRef = useRef(soundEnabled);
  const autoPrintRef = useRef(autoPrint);
  const isPrintingRef = useRef(isPrinting);
  const companyRef = useRef<CompanySettings>(company);
  const pendingOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const printModeRef = useRef<'thermal' | 'a4'>(printMode);

  // Keep refs in sync
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { autoPrintRef.current = autoPrint; }, [autoPrint]);
  useEffect(() => { isPrintingRef.current = isPrinting; }, [isPrinting]);
  useEffect(() => { printModeRef.current = printMode; }, [printMode]);
  useEffect(() => { companyRef.current = company; }, [company]);

  // Fetch company settings (for invoice header/footer) once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) setCompany(json.data as CompanySettings);
      } catch {
        // non-fatal
      }
    })();
  }, []);

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
      ? 'Mode THERMIQUE : format 10×15 cm. Mode A4 : facture complète. Pour imprimer sans boîte de dialogue → lancer Chrome avec le flag --kiosk-printing (voir ci-dessous).'
      : 'THERMAL mode: 10×15 cm format. A4 mode: full invoice. To print silently → launch Chrome with --kiosk-printing flag (see below).',
    kioskCmd: `google-chrome --kiosk-printing ${typeof window !== 'undefined' ? window.location.origin : 'https://temporal-clothes.com'}/admin/orders/print-station`,
    preview: language === 'fr' ? 'APERÇU' : 'PREVIEW',
    thermalMode: language === 'fr' ? 'THERMIQUE' : 'THERMAL',
    a4Mode: language === 'fr' ? 'FACTURE A4' : 'A4 INVOICE',
    testPrint: language === 'fr' ? 'TEST IMPRESSION' : 'TEST PRINT',
    simulateOrder: language === 'fr' ? 'SIMULER COMMANDE' : 'SIMULATE ORDER',
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

      const isThermal = printModeRef.current === 'thermal';
      const html = isThermal
        ? generateThermalHTML(ordersToPrint, companyRef.current)
        : generateInvoiceHTML(ordersToPrint, companyRef.current);

      // Clean up previous iframe
      if (printFrameRef.current && printFrameRef.current.parentNode) {
        printFrameRef.current.parentNode.removeChild(printFrameRef.current);
      }
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = isThermal ? '100mm' : '210mm';
      iframe.style.height = isThermal ? '150mm' : '297mm';
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

  const handleSimulateOrder = useCallback(() => {
    const fakeOrder: PrintOrder = { ...TEST_ORDER, createdAt: new Date().toISOString(), id: `__sim_${Date.now()}__` };
    // Exactly what fetchPrintQueue does when it detects a brand-new order
    if (soundEnabledRef.current) playNotificationSound();
    setPendingOrders(prev => [fakeOrder, ...prev]);
    pendingOrderIdsRef.current.add(fakeOrder.id);
    if (autoPrintRef.current && !isPrintingRef.current) {
      handlePrint([fakeOrder]);
    }
  }, [handlePrint]);

  const handleTestPrint = useCallback(() => {
    if (isPrintingRef.current) return;
    const testOrder = { ...TEST_ORDER, createdAt: new Date().toISOString() };
    setIsPrinting(true);
    isPrintingRef.current = true;
    const isThermal = printModeRef.current === 'thermal';
    const html = isThermal
      ? generateThermalHTML([testOrder], companyRef.current)
      : generateInvoiceHTML([testOrder], companyRef.current);
    if (printFrameRef.current && printFrameRef.current.parentNode) {
      printFrameRef.current.parentNode.removeChild(printFrameRef.current);
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = isThermal ? '80mm' : '210mm';
    iframe.style.height = isThermal ? '200mm' : '297mm';
    document.body.appendChild(iframe);
    printFrameRef.current = iframe;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { setIsPrinting(false); isPrintingRef.current = false; return; }
    doc.open(); doc.write(html); doc.close();
    let cleaned = false;
    setTimeout(() => {
      const win = iframe.contentWindow;
      if (!win) { setIsPrinting(false); isPrintingRef.current = false; return; }
      win.addEventListener('afterprint', () => {
        if (!cleaned) { cleaned = true; setIsPrinting(false); isPrintingRef.current = false; setPrintingIds(new Set()); }
      });
      win.print();
      setTimeout(() => {
        if (!cleaned) { cleaned = true; setIsPrinting(false); isPrintingRef.current = false; setPrintingIds(new Set()); }
      }, 5000);
    }, 300);
  }, []);

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

          {/* Test print button */}
          <button
            onClick={handleTestPrint}
            disabled={isPrinting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
              darkMode
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                : 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            <FlaskConical size={16} />
            {t.testPrint}
          </button>

          {/* Simulate incoming order (tests full auto-print flow) */}
          <button
            onClick={handleSimulateOrder}
            disabled={isPrinting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
              darkMode
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            <Package size={16} />
            {t.simulateOrder}
          </button>

          {/* Print mode toggle */}
          <button
            onClick={() => setPrintMode(m => m === 'thermal' ? 'a4' : 'thermal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              printMode === 'thermal'
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.85rem' }}
          >
            {printMode === 'thermal' ? <Printer size={16} /> : <FileText size={16} />}
            {printMode === 'thermal' ? t.thermalMode : t.a4Mode}
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

        {/* Kiosk printing command — Mac */}
        <div className={`mt-3 p-3 rounded-xl border ${darkMode ? 'bg-yellow-500/5 border-yellow-500/15' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-yellow-400/70' : 'text-yellow-700'}`}>
            ⚡ {language === 'fr' ? 'Impression silencieuse sans popup — coller dans le Terminal Mac :' : 'Silent print without popup — paste in Mac Terminal:'}
          </p>
          <code className={`text-xs block break-all select-all p-2 rounded-lg mb-2 ${darkMode ? 'bg-black/30 text-yellow-300' : 'bg-white text-yellow-900 border border-yellow-200'}`}>
            {`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --kiosk-printing https://temporal-clothes.com/admin/orders/print-station`}
          </code>
          <p className={`text-xs ${darkMode ? 'text-yellow-400/40' : 'text-yellow-600/60'}`}>
            {language === 'fr'
              ? '1. Ouvrir Terminal (Cmd+Espace → "Terminal") · 2. Coller la commande · 3. Entrée · 4. Définir l\'imprimante thermique comme imprimante par défaut dans Réglages Système → Imprimantes'
              : '1. Open Terminal (Cmd+Space → "Terminal") · 2. Paste the command · 3. Enter · 4. Set thermal printer as default in System Settings → Printers'}
          </p>
        </div>
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

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xl text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {Number(order.total).toFixed(2)}€
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewOrder(order)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      {t.preview}
                    </button>
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

      {/* Thermal receipt preview modal */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewOrder(null)}
        >
          <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setPreviewOrder(null)}
              className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={14} />
            </button>

            {/* Paper tear top */}
            <div style={{
              width: '400px',
              height: '16px',
              background: 'repeating-linear-gradient(90deg, #f0ebe0 0px, #f0ebe0 12px, transparent 12px, transparent 20px)',
              borderRadius: '3px 3px 0 0',
            }} />

            {/* Receipt body */}
            <div style={{
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              background: '#f0ebe0',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '13px',
              color: '#1a1a1a',
              padding: '16px 20px',
              boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              lineHeight: '1.65',
            }}>
              {/* Store header */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '17px', letterSpacing: '3px' }}>
                {(company.companyLegalName || 'TEMPORAL').toUpperCase()}
              </div>
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#777', marginBottom: '12px' }}>
                {company.contactEmail || 'temporal-clothes.com'}
              </div>

              <div style={{ borderTop: '1.5px solid #8a7a6a', margin: '10px 0' }} />

              {/* Order info */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Commande :</span>
                <span style={{ fontWeight: 'bold' }}>{previewOrder.orderNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date :</span>
                <span>{new Date(previewOrder.createdAt).toLocaleDateString('fr-FR')} {new Date(previewOrder.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div style={{ borderTop: '1px dashed #8a7a6a', margin: '10px 0' }} />

              {/* Delivery */}
              <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px' }}>
                {previewOrder.deliveryMethod === 'HAND_DELIVERY' ? 'MAIN PROPRE' : previewOrder.deliveryMethod === 'RELAY' || previewOrder.relayPointCode ? 'POINT RELAIS' : 'LIVRAISON DOMICILE'}
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '3px' }}>
                {previewOrder.customerFirstName.toUpperCase()} {previewOrder.customerLastName.toUpperCase()}
              </div>
              {previewOrder.customerPhone && (
                <div style={{ fontSize: '11px', color: '#666' }}>{previewOrder.customerPhone}</div>
              )}
              {previewOrder.deliveryMethod === 'HAND_DELIVERY' ? (
                <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#666' }}>Remise en main propre</div>
              ) : previewOrder.relayPointCode ? (
                <div style={{ marginTop: '3px' }}>
                  {previewOrder.relayPointName && <div style={{ fontWeight: 'bold' }}>{previewOrder.relayPointName}</div>}
                  {previewOrder.relayCarrier && <div style={{ fontSize: '11px', color: '#666' }}>{previewOrder.relayCarrier}</div>}
                  {previewOrder.relayPointAddress && <div>{previewOrder.relayPointAddress}</div>}
                  {previewOrder.shippingCity && <div>{previewOrder.shippingPostalCode} {previewOrder.shippingCity}</div>}
                </div>
              ) : (
                <div style={{ marginTop: '3px' }}>
                  {previewOrder.shippingStreet && <div>{previewOrder.shippingStreet}</div>}
                  {previewOrder.shippingCity && <div>{previewOrder.shippingPostalCode} {previewOrder.shippingCity}</div>}
                </div>
              )}
              {previewOrder.trackingNumber && (
                <div style={{ fontSize: '11px', marginTop: '4px', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                  Suivi: {previewOrder.trackingNumber}
                </div>
              )}

              <div style={{ borderTop: '1px dashed #8a7a6a', margin: '10px 0' }} />

              {/* Items */}
              <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>ARTICLES :</div>
              {previewOrder.items.map((item, i) => {
                const variant = [item.size, item.color].filter(Boolean).join('/');
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ flex: 1 }}>{item.quantity}x {item.productName}{variant ? ` (${variant})` : ''}</span>
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{Number(item.totalPrice).toFixed(2)}€</span>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px dashed #8a7a6a', margin: '10px 0' }} />

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sous-total :</span>
                <span>{Number(previewOrder.subtotal).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Livraison :</span>
                <span>{Number(previewOrder.shippingCost) > 0 ? `${Number(previewOrder.shippingCost).toFixed(2)}€` : 'OFFERTE'}</span>
              </div>
              {Number(previewOrder.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Remise{previewOrder.promoCode?.code ? ` (${previewOrder.promoCode.code})` : ''} :</span>
                  <span>-{Number(previewOrder.discount).toFixed(2)}€</span>
                </div>
              )}

              <div style={{ borderTop: '1.5px solid #8a7a6a', margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                <span>TOTAL :</span>
                <span>{Number(previewOrder.total).toFixed(2)}€</span>
              </div>

              <div style={{ borderTop: '1px dashed #8a7a6a', margin: '10px 0' }} />

              <div style={{ textAlign: 'center', fontSize: '11px' }}>Payé par CB (Stripe)</div>

              {previewOrder.customerNotes && (
                <>
                  <div style={{ borderTop: '1px dashed #8a7a6a', margin: '10px 0' }} />
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>NOTE CLIENT :</div>
                  <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '3px' }}>{previewOrder.customerNotes}</div>
                </>
              )}

              <div style={{ borderTop: '1.5px solid #8a7a6a', margin: '10px 0' }} />
              <div style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>
                Merci pour votre commande !
              </div>
            </div>

            {/* Paper tear bottom */}
            <div style={{
              width: '400px',
              height: '16px',
              background: 'repeating-linear-gradient(90deg, #f0ebe0 0px, #f0ebe0 12px, transparent 12px, transparent 20px)',
              borderRadius: '0 0 3px 3px',
            }} />

            {/* Action buttons below receipt */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setPreviewOrder(null); handlePrint([previewOrder]); }}
                disabled={isPrinting}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                <Printer size={16} />
                {t.print}
              </button>
              <button
                onClick={() => setPreviewOrder(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
