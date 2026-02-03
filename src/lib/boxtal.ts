/**
 * Boxtal API Integration
 * Documentation: https://www.boxtal.com/fr/api
 */

const BOXTAL_API_URL = 'https://api.boxtal.com';

interface BoxtalCredentials {
  accessKey: string;
  secretKey: string;
}

interface BoxtalRelayPoint {
  code: string;
  name: string;
  address: string;
  city: string;
  zipcode: string;
  country: string;
  latitude: number;
  longitude: number;
  distance?: number;
  operator: string;
  schedule?: {
    [key: string]: string;
  };
  phone?: string;
}

interface RelayPoint {
  id: string;
  code: string; // Original Boxtal code for creating shipments
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

/**
 * Get API v3 credentials (for shipments)
 */
function getCredentials(): BoxtalCredentials {
  const accessKey = process.env.BOXTAL_ACCESS_KEY;
  const secretKey = process.env.BOXTAL_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error('Boxtal API v3 credentials not configured');
  }

  return { accessKey, secretKey };
}

/**
 * Get Map API credentials (for relay points)
 */
function getMapCredentials(): BoxtalCredentials {
  const accessKey = process.env.BOXTAL_MAP_ACCESS_KEY || process.env.BOXTAL_ACCESS_KEY;
  const secretKey = process.env.BOXTAL_MAP_SECRET_KEY || process.env.BOXTAL_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error('Boxtal Map API credentials not configured');
  }

  return { accessKey, secretKey };
}

function getAuthHeader(credentials: BoxtalCredentials): string {
  const auth = Buffer.from(`${credentials.accessKey}:${credentials.secretKey}`).toString('base64');
  return `Basic ${auth}`;
}

/**
 * Map Boxtal operator codes to our carrier names
 */
function mapOperatorToCarrier(operator: string): string {
  const mapping: Record<string, string> = {
    'MONR': 'mondial_relay',
    'SOGP': 'colissimo',
    'CHRP': 'chronopost',
    'UPSE': 'ups',
    'DHLE': 'dhl',
    'FEDX': 'fedex',
    'TNTE': 'tnt',
    'POFR': 'colissimo',
    'SODX': 'chronopost',
  };
  return mapping[operator] || operator.toLowerCase();
}

/**
 * Get carrier display name
 */
function getCarrierDisplayName(carrier: string): string {
  const names: Record<string, string> = {
    'mondial_relay': 'Mondial Relay',
    'colissimo': 'Colissimo',
    'chronopost': 'Chronopost',
    'ups': 'UPS',
    'dhl': 'DHL',
    'fedex': 'FedEx',
    'tnt': 'TNT',
  };
  return names[carrier] || carrier;
}

/**
 * Format distance for display
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Fetch relay points from Boxtal API
 */
export async function fetchBoxtalRelayPoints(
  postalCode: string,
  country: string = 'FR',
  carrier?: string
): Promise<RelayPoint[]> {
  try {
    const credentials = getMapCredentials();

    // Build query params
    const params = new URLSearchParams({
      zipcode: postalCode,
      country: country,
    });

    // If specific carrier requested, map to Boxtal operator code
    if (carrier) {
      const operatorMap: Record<string, string> = {
        'mondial_relay': 'MONR',
        'colissimo': 'SOGP',
        'chronopost': 'CHRP',
        'ups': 'UPSE',
      };
      if (operatorMap[carrier]) {
        params.append('operator', operatorMap[carrier]);
      }
    }

    const response = await fetch(
      `${BOXTAL_API_URL}/v1/parcelshops?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(credentials),
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Boxtal API error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    const points: BoxtalRelayPoint[] = data.parcelshops || data || [];

    return points.map((point): RelayPoint => {
      const carrierName = mapOperatorToCarrier(point.operator);
      return {
        id: `${carrierName}-${point.code}`,
        code: point.code, // Keep original Boxtal code for shipment creation
        carrier: carrierName,
        name: point.name || getCarrierDisplayName(carrierName),
        address: point.address,
        city: point.city,
        postalCode: point.zipcode,
        country: point.country,
        lat: point.latitude,
        lng: point.longitude,
        distance: point.distance ? formatDistance(point.distance) : undefined,
        distanceMeters: point.distance,
        hours: point.schedule || {
          'Lundi-Vendredi': '09:00-19:00',
          'Samedi': '09:00-12:30',
          'Dimanche': 'Fermé',
        },
        phone: point.phone,
        services: [getCarrierDisplayName(carrierName)],
      };
    });
  } catch (error) {
    console.error('Error fetching Boxtal relay points:', error);
    return [];
  }
}

/**
 * Get available carriers from Boxtal
 */
export async function getBoxtalCarriers(): Promise<string[]> {
  return ['mondial_relay', 'colissimo', 'chronopost', 'ups'];
}

/**
 * Create a shipment with Boxtal
 */
export async function createBoxtalShipment(params: {
  from: {
    name: string;
    company?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
  to: {
    name: string;
    company?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    relayPointCode?: string;
  };
  parcel: {
    weight: number; // in kg
    length: number; // in cm
    width: number;
    height: number;
  };
  carrier: string;
  service?: string;
}): Promise<{
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  error?: string;
}> {
  try {
    const credentials = getCredentials();

    // Map carrier to Boxtal operator code
    const operatorMap: Record<string, string> = {
      'mondial_relay': 'MONR',
      'colissimo': 'SOGP',
      'chronopost': 'CHRP',
      'ups': 'UPSE',
    };

    const operator = operatorMap[params.carrier] || params.carrier.toUpperCase();

    const shipmentData = {
      shipper: {
        name: params.from.name,
        company: params.from.company || params.from.name,
        street: params.from.street,
        city: params.from.city,
        zipcode: params.from.postalCode,
        country: params.from.country,
        phone: params.from.phone,
        email: params.from.email,
      },
      recipient: {
        name: params.to.name,
        company: params.to.company,
        street: params.to.street,
        city: params.to.city,
        zipcode: params.to.postalCode,
        country: params.to.country,
        phone: params.to.phone,
        email: params.to.email,
        parcelshop_code: params.to.relayPointCode,
      },
      parcels: [{
        weight: params.parcel.weight,
        length: params.parcel.length,
        width: params.parcel.width,
        height: params.parcel.height,
      }],
      operator: operator,
      service: params.service,
    };

    const response = await fetch(
      `${BOXTAL_API_URL}/v1/shipments`,
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(credentials),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Boxtal shipment error:', response.status, errorText);
      return {
        success: false,
        error: `Erreur Boxtal: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      trackingNumber: data.tracking_number || data.reference,
      labelUrl: data.label_url || data.documents?.label,
    };
  } catch (error) {
    console.error('Error creating Boxtal shipment:', error);
    return {
      success: false,
      error: 'Erreur lors de la création de l\'expédition',
    };
  }
}

/**
 * Shop/sender information for shipments
 */
const SHOP_INFO = {
  name: 'Temporal',
  company: 'Temporal',
  street: '22 Rue Pierre Brossolette',
  city: 'Évreux',
  postalCode: '27000',
  country: 'FR',
  phone: '+33768281395',
  email: 'contact@temporal-clothes.com',
};

/**
 * Default parcel dimensions for clothing
 */
const DEFAULT_PARCEL = {
  weight: 0.5, // kg
  length: 30, // cm
  width: 25,
  height: 5,
};

/**
 * Create shipment for an order (called after payment confirmation)
 */
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
  // For relay points, stored in customerNotes or shippingStreet
  relayCarrier?: string;
  relayPointCode?: string;
  relayPointName?: string;
}): Promise<{
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  error?: string;
}> {
  // Skip for hand delivery
  if (order.deliveryMethod === 'HAND_DELIVERY') {
    return { success: true, trackingNumber: 'MAIN_PROPRE' };
  }

  try {
    // Parse relay info from shippingStreet if it's a relay delivery
    let relayPointCode = order.relayPointCode;
    let carrier = order.relayCarrier || 'colissimo';

    // Check if shippingStreet contains relay info [RELAY:carrier-code]
    if (order.shippingStreet?.startsWith('[RELAY:')) {
      const match = order.shippingStreet.match(/\[RELAY:([^\]]+)\]/);
      if (match) {
        const relayId = match[1];
        // relayId format: carrier-code (e.g., mondial_relay-12345)
        const parts = relayId.split('-');
        if (parts.length >= 2) {
          carrier = parts[0];
          relayPointCode = parts.slice(1).join('-');
        }
      }
    }

    // Determine if this is a relay or home delivery
    const isRelay = !!relayPointCode;

    const shipmentParams = {
      from: SHOP_INFO,
      to: {
        name: `${order.customerFirstName} ${order.customerLastName}`,
        street: isRelay ? (order.relayPointName || 'Point Relais') : (order.shippingStreet || ''),
        city: order.shippingCity || '',
        postalCode: order.shippingPostalCode || '',
        country: order.shippingCountry || 'FR',
        phone: order.customerPhone,
        email: order.customerEmail,
        relayPointCode: relayPointCode,
      },
      parcel: DEFAULT_PARCEL,
      carrier: carrier,
    };

    const result = await createBoxtalShipment(shipmentParams);

    if (result.success) {
      console.log(`Shipment created for order ${order.orderNumber}: tracking=${result.trackingNumber}`);
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

/**
 * Get shipping rates from Boxtal
 */
export async function getBoxtalRates(params: {
  from: {
    postalCode: string;
    country: string;
  };
  to: {
    postalCode: string;
    country: string;
  };
  parcel: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
}): Promise<Array<{
  carrier: string;
  service: string;
  price: number;
  deliveryTime: string;
}>> {
  try {
    const credentials = getCredentials();

    const response = await fetch(
      `${BOXTAL_API_URL}/v1/quotes`,
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(credentials),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipper: {
            zipcode: params.from.postalCode,
            country: params.from.country,
          },
          recipient: {
            zipcode: params.to.postalCode,
            country: params.to.country,
          },
          parcels: [{
            weight: params.parcel.weight,
            length: params.parcel.length,
            width: params.parcel.width,
            height: params.parcel.height,
          }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Boxtal rates error:', response.status);
      return [];
    }

    const data = await response.json();
    const quotes = data.quotes || data || [];

    return quotes.map((quote: any) => ({
      carrier: mapOperatorToCarrier(quote.operator),
      service: quote.service || 'Standard',
      price: parseFloat(quote.price) || 0,
      deliveryTime: quote.delivery_time || '2-4 jours',
    }));
  } catch (error) {
    console.error('Error getting Boxtal rates:', error);
    return [];
  }
}
