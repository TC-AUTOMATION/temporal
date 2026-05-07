/**
 * Boxtal integration.
 *
 * Boxtal exposes several "API products" on different hosts and they are
 * NOT interchangeable:
 *
 *   1. https://api.boxtal.com/shipping/v3.1/*  — the PUBLIC partner API v3
 *      (docs: https://developer.boxtal.com). Requires credentials from a
 *      dedicated "v3 app" created in the developer portal — NOT the Mon
 *      Boxtal dashboard login. Use these env vars if they are set:
 *        BOXTAL_V3_ACCESS_KEY / BOXTAL_V3_SECRET_KEY
 *      `POST /shipping/v3.1/shipping-order` is the documented endpoint
 *      for creating a shipment ("placing an order"). Prerequisites on the
 *      Boxtal account: direct-debit deferred payment must be enabled.
 *
 *   2. https://private-gateway.boxtal.com/*  — the INTERNAL BFF behind
 *      the https://shipping.boxtal.com merchant dashboard. We use it only
 *      for *reading*: parcel-point lookup, content categories, rate
 *      shopping. Writing a shipment here is not supported by the public
 *      contract; the dashboard itself uses a cookie-based session from a
 *      logged-in browser that we can't mint from a server process.
 *
 *   3. https://maps.boxtal.com/*  — the parcel-point map widget (iframed
 *      on the checkout page). Uses its own map-scoped credentials:
 *        BOXTAL_MAP_ACCESS_KEY / BOXTAL_MAP_SECRET_KEY
 *
 * Shipment creation MUST go through path #1 with real v3 credentials.
 * Without them, the code falls back to the shared BOXTAL_ACCESS_KEY but
 * that will fail with a 400 (the dashboard keys are not scoped for the
 * public v3 API).
 */

const BOXTAL_API_URL = 'https://api.boxtal.com';

interface BoxtalCredentials {
  accessKey: string;
  secretKey: string;
}

interface RelayPoint {
  id: string;
  code: string;
  carrier: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  distance?: string;
  distanceMeters?: number;
  hours: Record<string, string>;
  phone?: string;
  services?: string[];
}

// ==================== CREDENTIALS ====================

function getCredentials(): BoxtalCredentials {
  const accessKey = process.env.BOXTAL_ACCESS_KEY;
  const secretKey = process.env.BOXTAL_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error('Boxtal API credentials not configured');
  }
  return { accessKey, secretKey };
}

/**
 * Credentials for the PUBLIC v3 API (developer.boxtal.com > "API v3 app").
 * Falls back to the dashboard keys so the rest of the integration still
 * works; shipment creation will fail with a clear error in that case.
 */
function getV3Credentials(): BoxtalCredentials {
  const accessKey = process.env.BOXTAL_V3_ACCESS_KEY || process.env.BOXTAL_ACCESS_KEY;
  const secretKey = process.env.BOXTAL_V3_SECRET_KEY || process.env.BOXTAL_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error('Boxtal v3 API credentials not configured');
  }
  return { accessKey, secretKey };
}

function hasDedicatedV3Credentials(): boolean {
  return !!(process.env.BOXTAL_V3_ACCESS_KEY && process.env.BOXTAL_V3_SECRET_KEY);
}

function getMapCredentials(): BoxtalCredentials {
  const accessKey = process.env.BOXTAL_MAP_ACCESS_KEY || process.env.BOXTAL_ACCESS_KEY;
  const secretKey = process.env.BOXTAL_MAP_SECRET_KEY || process.env.BOXTAL_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error('Boxtal Map API credentials not configured');
  }
  return { accessKey, secretKey };
}

function basicAuthHeader(c: BoxtalCredentials): string {
  const auth = Buffer.from(`${c.accessKey}:${c.secretKey}`).toString('base64');
  return `Basic ${auth}`;
}

// ==================== TOKEN CACHE ====================

interface CachedToken { token: string; expiresAt: number }
const tokenCache: Record<string, CachedToken> = {};

async function getBearerToken(
  credentials: BoxtalCredentials,
  baseUrl: string = BOXTAL_API_URL
): Promise<string> {
  const key = `${baseUrl}::${credentials.accessKey}`;
  const cached = tokenCache[key];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const response = await fetch(`${baseUrl}/iam/account-app/token`, {
    method: 'POST',
    headers: {
      'Authorization': basicAuthHeader(credentials),
      'Accept': 'application/json',
    },
    // Empty body is required - Boxtal rejects JSON bodies here
    body: '',
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Boxtal token error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const token = data.accessToken || data.access_token;
  if (!token) {
    throw new Error('Boxtal token response missing accessToken');
  }
  const expiresIn = data.expiresIn || data.expires_in || 3600;

  tokenCache[key] = {
    token,
    expiresAt: Date.now() + (expiresIn - 300) * 1000, // 5min safety buffer
  };
  return token;
}

async function boxtalFetch(
  path: string,
  init: RequestInit,
  credentials: BoxtalCredentials = getCredentials()
): Promise<Response> {
  const token = await getBearerToken(credentials);
  return fetch(`${BOXTAL_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
}

// ==================== MAPPING HELPERS ====================

const CARRIER_TO_OPERATOR: Record<string, string> = {
  mondial_relay: 'MONR',
  colissimo: 'POFR',
  chronopost: 'CHRP',
  ups: 'UPSE',
};

function mapOperatorToCarrier(operator: string): string {
  const op = operator.replace('_NETWORK', '');
  const mapping: Record<string, string> = {
    MONR: 'mondial_relay',
    POFR: 'colissimo',
    SOGP: 'colissimo',
    CHRP: 'chronopost',
    UPSE: 'ups',
    COPR: 'colis_prive',
    DHLE: 'dhl',
    FEDX: 'fedex',
    TNTE: 'tnt',
    SODX: 'chronopost',
  };
  return mapping[op] || op.toLowerCase();
}

function getCarrierDisplayName(carrier: string): string {
  const names: Record<string, string> = {
    mondial_relay: 'Mondial Relay',
    colissimo: 'Colissimo',
    chronopost: 'Chronopost',
    ups: 'UPS',
    dhl: 'DHL',
    fedex: 'FedEx',
    tnt: 'TNT',
  };
  return names[carrier] || carrier;
}

function pickShippingOfferCode(deliveryMethod: 'DELIVERY' | 'RELAY', carrier: string): string {
  if (deliveryMethod === 'DELIVERY') {
    // Home delivery: POFR-ColissimoAccess by default.
    // For Chronopost home: CHRP-Chrono13 / CHRP-Chrono18 / CHRP-ChronoClassic.
    if (carrier === 'chronopost') return 'CHRP-Chrono18';
    if (carrier === 'ups') return 'UPSE-Standard';
    return 'POFR-ColissimoAccess';
  }
  // Relay offers (verified against vz777/BoxtalShipping v3.1)
  const relayOffers: Record<string, string> = {
    mondial_relay: 'MONR-Standard',
    chronopost: 'CHRP-ChronoRelais',
    ups: 'UPSE-StandardAP',
  };
  // Colissimo has no public v3.1 relay offer — fall back to Mondial Relay
  return relayOffers[carrier] || 'MONR-Standard';
}

/**
 * Split an address string into a street number and street name.
 * Boxtal requires `number` and `street` separately.
 */
function splitAddress(full: string): { number: number; street: string } {
  const trimmed = full.trim();
  const match = trimmed.match(/^(\d+)\s*(?:bis|ter)?[\s,]*(.+)$/i);
  if (match) {
    return { number: parseInt(match[1], 10) || 1, street: match[2].trim() || trimmed };
  }
  return { number: 1, street: trimmed };
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ==================== RELAY POINTS ====================

interface BoxtalParcelPointEntry {
  distanceFromSearchLocation?: number;
  parcelPoint?: {
    code?: string;
    name?: string;
    network?: string;
    status?: string;
    location?: {
      street?: string;
      number?: string | number;
      postalCode?: string;
      city?: string;
      countryIsoCode?: string;
      position?: { latitude?: number; longitude?: number };
    };
    openingDays?: Record<string, Array<{ openingTime: string; closingTime: string }>>;
    phone?: string;
  };
}

function formatOpeningDays(
  days?: Record<string, Array<{ openingTime: string; closingTime: string }>>
): Record<string, string> {
  if (!days) {
    return { 'Lundi-Vendredi': '09:00-19:00', Samedi: '09:00-12:30', Dimanche: 'Fermé' };
  }
  const dayLabels: Record<string, string> = {
    MONDAY: 'Lundi',
    TUESDAY: 'Mardi',
    WEDNESDAY: 'Mercredi',
    THURSDAY: 'Jeudi',
    FRIDAY: 'Vendredi',
    SATURDAY: 'Samedi',
    SUNDAY: 'Dimanche',
  };
  const result: Record<string, string> = {};
  for (const [key, slots] of Object.entries(days)) {
    const label = dayLabels[key] || key;
    if (!slots || slots.length === 0) {
      result[label] = 'Fermé';
    } else {
      result[label] = slots.map(s => `${s.openingTime}-${s.closingTime}`).join(', ');
    }
  }
  return result;
}

export async function fetchBoxtalRelayPoints(
  postalCode: string,
  country: string = 'FR',
  carrier?: string
): Promise<RelayPoint[]> {
  try {
    const credentials = getMapCredentials();

    // Note: the `networks` query param is accepted but ignored by v3.1 —
    // we always receive all networks and must filter client-side.
    const params = new URLSearchParams({
      postalCode,
      countryIsoCode: country,
    });

    const response = await boxtalFetch(
      `/shipping/v3.1/parcel-point?${params.toString()}`,
      { method: 'GET', signal: AbortSignal.timeout(5000) },
      credentials
    );

    if (!response.ok) {
      console.error('Boxtal parcel-point error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    const entries: BoxtalParcelPointEntry[] = data.content || [];

    const points = entries
      .map((entry): RelayPoint | null => {
        const pp = entry.parcelPoint;
        if (!pp || pp.status === 'UNAVAILABLE') return null;
        const network = pp.network || '';
        const carrierName = mapOperatorToCarrier(network);
        const loc = pp.location || {};
        const pos = loc.position || {};
        const addressStr = [loc.number, loc.street].filter(Boolean).join(' ') || '';
        return {
          id: `${carrierName}-${pp.code || ''}`,
          code: pp.code || '',
          carrier: carrierName,
          name: pp.name || getCarrierDisplayName(carrierName),
          address: addressStr,
          city: loc.city || '',
          postalCode: loc.postalCode || '',
          country: loc.countryIsoCode || 'FR',
          lat: pos.latitude ?? 0,
          lng: pos.longitude ?? 0,
          distanceMeters: entry.distanceFromSearchLocation,
          distance: entry.distanceFromSearchLocation != null
            ? formatDistance(entry.distanceFromSearchLocation)
            : undefined,
          hours: formatOpeningDays(pp.openingDays),
          phone: pp.phone,
          services: [getCarrierDisplayName(carrierName)],
        };
      })
      .filter((p): p is RelayPoint => p !== null);

    if (carrier) {
      // Colis Privé and "sogp" share carrier labels - match the requested one exactly
      return points.filter(p => p.carrier === carrier);
    }

    return points;
  } catch (error) {
    console.error('Error fetching Boxtal relay points:', error);
    return [];
  }
}

export async function getBoxtalCarriers(): Promise<string[]> {
  return ['mondial_relay', 'colissimo', 'chronopost', 'ups'];
}

// ==================== SHIPMENT CREATION ====================

interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

interface ParcelDims {
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface CreateShipmentParams {
  externalId: string;
  from: Address;
  to: Address;
  parcel: ParcelDims;
  declaredValue: number;
  deliveryMethod: 'DELIVERY' | 'RELAY';
  carrier: string;
  relayPointCode?: string;
  shippingOfferCode?: string;
}

export interface CreateShipmentResult {
  success: boolean;
  shipmentId?: string;
  trackingNumber?: string;
  labelUrl?: string;
  error?: string;
}

/**
 * Build the shipping-order v3.1 address block.
 */
function buildV3AddressBlock(
  addr: Address,
  type: 'BUSINESS' | 'RESIDENTIAL'
) {
  const split = splitAddress(addr.street);
  return {
    type,
    contact: {
      email: addr.email,
      phone: addr.phone,
      ...(type === 'BUSINESS' && addr.company ? { company: addr.company.slice(0, 35) } : {}),
      firstName: addr.firstName,
      lastName: addr.lastName,
    },
    location: {
      city: addr.city,
      number: split.number,
      street: split.street,
      postalCode: addr.postalCode,
      countryIsoCode: addr.country || 'FR',
    },
  };
}

/**
 * Compute the next business day offset, formatted as YYYY-MM-DD.
 * The v3 API rejects dates in the past, on weekends, or >21 days out.
 */
function nextBusinessDay(offsetDays: number = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}

/**
 * Create a shipment via the PUBLIC Boxtal API v3.1.
 *
 *   POST https://api.boxtal.com/shipping/v3.1/shipping-order
 *
 * This is the documented endpoint for "placing a shipping order" on the
 * Boxtal developer portal (https://developer.boxtal.com/fr/en/apiv3/guide).
 *
 * REQUIRED SETUP on the Boxtal side (if this call returns 400):
 *
 *   1. Log in to https://developer.boxtal.com with the Mon Boxtal account
 *   2. Create an "API v3 application" → generates a dedicated access_key
 *      and secret_key (different from the Mon Boxtal dashboard password
 *      and different from the map widget keys)
 *   3. Set those keys in this project's env as:
 *        BOXTAL_V3_ACCESS_KEY=...
 *        BOXTAL_V3_SECRET_KEY=...
 *   4. In https://shipping.boxtal.com → Préférences de facturation, enable
 *      "paiement différé par prélèvement" (mandatory for API orders)
 *
 * Until step 1-4 is done, this call will fail with 400 BAD_REQUEST
 * because the dashboard login credentials are not scoped for the public
 * v3 API. The admin UI exposes a "Préparer envoi manuel" fallback that
 * lets the admin recreate the shipment on the Boxtal dashboard in a
 * couple of clicks.
 */
export async function createBoxtalShipment(
  params: CreateShipmentParams
): Promise<CreateShipmentResult> {
  try {
    const shippingOfferCode = params.shippingOfferCode
      || pickShippingOfferCode(params.deliveryMethod, params.carrier);

    const fromBlock = buildV3AddressBlock(params.from, 'BUSINESS');
    const toBlock = buildV3AddressBlock(params.to, 'RESIDENTIAL');
    const returnBlock = buildV3AddressBlock(params.from, 'BUSINESS');

    // content:v1:40110 = "Tissus, vêtements neufs" on /shipping/v3.1/content-category
    const CONTENT_ID = 'content:v1:40110';
    const CONTENT_LABEL = 'Tissus, vêtements neufs';

    const shipmentData = {
      insured: false,
      shipment: {
        externalId: params.externalId,
        ...(params.relayPointCode ? { pickupPointCode: params.relayPointCode } : {}),
        packages: [
          {
            type: 'PARCEL',
            value: { value: params.declaredValue, currency: 'EUR' },
            length: params.parcel.length,
            width: params.parcel.width,
            height: params.parcel.height,
            weight: params.parcel.weight,
            content: { id: CONTENT_ID, description: CONTENT_LABEL },
            stackable: true,
            externalId: params.externalId,
          },
        ],
        fromAddress: fromBlock,
        toAddress: toBlock,
        returnAddress: returnBlock,
      },
      labelType: 'PDF_A4',
      shippingOfferCode,
      expectedTakingOverDate: nextBusinessDay(2),
    };

    const credentials = getV3Credentials();
    const token = await getBearerToken(credentials, BOXTAL_API_URL);
    console.log('Boxtal v3.1 shipment payload:', JSON.stringify(shipmentData, null, 2));
    const response = await fetch(`${BOXTAL_API_URL}/shipping/v3.1/shipping-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipmentData),
      signal: AbortSignal.timeout(20000),
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error('Boxtal v3.1 shipment error:', response.status, raw || '(empty body)');
      let errorMsg = `Erreur Boxtal ${response.status}`;
      if (raw) {
        try {
          const err = JSON.parse(raw);
          const firstErr = Array.isArray(err.errors) ? err.errors[0] : undefined;
          const fieldErrs = firstErr?.parameters && Array.isArray(firstErr.parameters)
            ? firstErr.parameters
                .map((p: { field?: string; code?: string; message?: string }) =>
                  `${p.field || p.code}: ${p.message || p.code}`)
                .join('; ')
            : undefined;
          const detail = fieldErrs || err.message || firstErr?.message || firstErr?.code || err.error;
          if (detail) errorMsg += ` — ${detail}`;
        } catch {
          errorMsg += ` — ${raw.slice(0, 200)}`;
        }
      }
      // Helpful hint when the credentials are still the dashboard ones
      if (response.status === 400 && !hasDedicatedV3Credentials()) {
        errorMsg += ' — Credentials API v3 manquants. Créez une application API v3 sur developer.boxtal.com, puis ajoutez BOXTAL_V3_ACCESS_KEY et BOXTAL_V3_SECRET_KEY à .env.';
      }
      return { success: false, error: errorMsg };
    }

    const data = raw ? JSON.parse(raw) : {};
    const content = data.content || data;

    return {
      success: true,
      shipmentId: content.shipmentId || content.id || content.reference,
      trackingNumber: content.trackingNumber || content.shipmentId || content.reference,
      labelUrl: content.labelUrl || content.documents?.label,
    };
  } catch (error) {
    console.error('Error creating Boxtal shipment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'expédition',
    };
  }
}

// ==================== SHOP DEFAULTS ====================

const SHOP_INFO: Address = {
  firstName: 'Tom',
  lastName: 'Pradel',
  company: 'Temporal',
  street: '22 Rue Pierre Brossolette',
  city: 'Évreux',
  postalCode: '27000',
  country: 'FR',
  phone: '0768281395',
  email: 'contact@temporal-clothes.com',
};

const DEFAULT_PARCEL: ParcelDims = {
  weight: 0.5,
  length: 30,
  width: 25,
  height: 5,
};

// ==================== HIGH-LEVEL ORDER HELPER ====================

export async function createShipmentForOrder(order: {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: 'DELIVERY' | 'RELAY' | 'HAND_DELIVERY';
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
  declaredValue?: number;
  parcel?: Partial<ParcelDims>;
}): Promise<CreateShipmentResult> {
  if (order.deliveryMethod === 'HAND_DELIVERY') {
    return { success: true };
  }

  try {
    // Parse legacy relay info embedded in shippingStreet, if present
    let relayPointCode = order.relayPointCode;
    let carrier = order.relayCarrier || 'colissimo';

    if (!relayPointCode && order.shippingStreet?.startsWith('[RELAY:')) {
      const match = order.shippingStreet.match(/\[RELAY:([^\]]+)\]/);
      if (match) {
        const parts = match[1].split('-');
        if (parts.length >= 2) {
          carrier = parts[0];
          relayPointCode = parts.slice(1).join('-');
        }
      }
    }

    if (relayPointCode?.startsWith('OSM-')) {
      return {
        success: false,
        error: 'Le point relais sélectionné (code OSM) n\'est pas compatible avec l\'expédition automatique. Créez l\'envoi manuellement.',
      };
    }

    const isRelay = !!relayPointCode && order.deliveryMethod === 'RELAY';

    const parcel: ParcelDims = {
      weight: order.parcel?.weight ?? DEFAULT_PARCEL.weight,
      length: order.parcel?.length ?? DEFAULT_PARCEL.length,
      width: order.parcel?.width ?? DEFAULT_PARCEL.width,
      height: order.parcel?.height ?? DEFAULT_PARCEL.height,
    };

    // For relay orders, toAddress must be the customer's real (billing) address —
    // shippingStreet is the relay point name, not a postal address.
    const toStreet = isRelay
      ? (order.billingStreet || order.shippingStreet || '')
      : (order.shippingStreet || '');
    const toCity = isRelay
      ? (order.billingCity || order.shippingCity || '')
      : (order.shippingCity || '');
    const toPostalCode = isRelay
      ? (order.billingPostalCode || order.shippingPostalCode || '')
      : (order.shippingPostalCode || '');
    const toCountryRaw = isRelay
      ? (order.billingCountry || order.shippingCountry || 'FR')
      : (order.shippingCountry || 'FR');
    const toCountry = toCountryRaw === 'France' ? 'FR' : toCountryRaw;

    const result = await createBoxtalShipment({
      externalId: order.orderNumber,
      from: SHOP_INFO,
      to: {
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        street: toStreet,
        city: toCity,
        postalCode: toPostalCode,
        country: toCountry,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
      parcel,
      declaredValue: order.declaredValue ?? 50,
      deliveryMethod: isRelay ? 'RELAY' : 'DELIVERY',
      carrier,
      relayPointCode: isRelay ? relayPointCode : undefined,
    });

    if (result.success) {
      console.log(`Shipment created for order ${order.orderNumber}: shipmentId=${result.shipmentId}`);
    } else {
      console.error(`Failed to create shipment for order ${order.orderNumber}: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error(`Error creating shipment for order ${order.orderNumber}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
