import { NextResponse } from 'next/server';

export interface ShippingMethod {
  id: string;
  name: string;
  nameFr: string;
  nameEn: string;
  price: number;
  delay: string;
  delayFr: string;
  delayEn: string;
  description?: string;
  descriptionFr?: string;
  descriptionEn?: string;
}

// Configurable shipping methods
// In the future, these could be fetched from database
const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'relay',
    name: 'Point Relais',
    nameFr: 'Point Relais',
    nameEn: 'Relay Point',
    price: 3.90,
    delay: '2-3 jours',
    delayFr: '2-3 jours',
    delayEn: '2-3 days',
    description: 'Retrait en point relais',
    descriptionFr: 'Retrait en point relais',
    descriptionEn: 'Pickup at relay point',
  },
  {
    id: 'delivery',
    name: 'Livraison à domicile',
    nameFr: 'Livraison à domicile',
    nameEn: 'Home Delivery',
    price: 5.90,
    delay: '48-72h',
    delayFr: '48-72h',
    delayEn: '48-72h',
    description: 'Colissimo avec suivi',
    descriptionFr: 'Colissimo avec suivi',
    descriptionEn: 'Tracked delivery',
  },
  {
    id: 'handDelivery',
    name: 'Remise en main propre',
    nameFr: 'Remise en main propre',
    nameEn: 'Hand Delivery',
    price: 0,
    delay: 'Sur rendez-vous',
    delayFr: 'Sur rendez-vous',
    delayEn: 'By appointment',
    description: 'Réservé aux contacts proches',
    descriptionFr: 'Réservé aux contacts proches',
    descriptionEn: 'Reserved for close contacts',
  },
];

/**
 * GET /api/shipping-methods
 * Get available shipping methods
 */
export async function GET() {
  try {
    return NextResponse.json({
      shippingMethods: SHIPPING_METHODS,
    });
  } catch (error) {
    console.error('GET /api/shipping-methods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}
