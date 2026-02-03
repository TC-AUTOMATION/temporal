import { NextRequest, NextResponse } from 'next/server';
import { fetchBoxtalRelayPoints } from '@/lib/boxtal';

// Types
interface RelayPoint {
  id: string;
  carrier: string;
  name: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  distance?: string;
  distanceMeters?: number;
  hours: Record<string, string>;
  phone?: string;
  photo?: string;
  services?: string[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// ============================================
// FALLBACK - OSM pour les bureaux de poste
// ============================================
async function fetchColissimoPointsOSM(lat: number, lng: number, postalCode: string): Promise<RelayPoint[]> {
  try {
    const radius = 5000; // 5km
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="post_office"](around:${radius},${lat},${lng});
        way["amenity"="post_office"](around:${radius},${lat},${lng});
      );
      out body center;
    `;

    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: { 'User-Agent': 'TemporalShop/1.0' },
        next: { revalidate: 600 },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const elements = data.elements || [];

    return elements.slice(0, 15).map((point: any) => {
      const pointLat = point.lat || point.center?.lat;
      const pointLng = point.lon || point.center?.lon;
      if (!pointLat || !pointLng) return null;

      const distance = calculateDistance(lat, lng, pointLat, pointLng);

      return {
        id: `colissimo-osm-${point.id}`,
        carrier: 'colissimo',
        name: point.tags?.name || 'Bureau de Poste',
        address: point.tags?.['addr:street']
          ? `${point.tags?.['addr:housenumber'] || ''} ${point.tags?.['addr:street']}`.trim()
          : 'Voir sur place',
        city: point.tags?.['addr:city'] || '',
        postalCode: point.tags?.['addr:postcode'] || postalCode,
        country: 'FR',
        lat: pointLat,
        lng: pointLng,
        distance: formatDistance(distance),
        distanceMeters: distance,
        hours: {
          'Lundi-Vendredi': '09:00-18:00',
          'Samedi': '09:00-12:00',
          'Dimanche': 'Fermé',
        },
        phone: point.tags?.phone || '3631',
        services: ['Bureau de Poste', 'Retrait colis'],
      };
    }).filter(Boolean).sort((a: RelayPoint, b: RelayPoint) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  } catch (error) {
    console.error('Error fetching Colissimo points from OSM:', error);
    return [];
  }
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postalCode = searchParams.get('postalCode') || '';
  const city = searchParams.get('city') || '';
  const carrier = searchParams.get('carrier') as string | null;
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

  if (!postalCode && !lat) {
    return NextResponse.json(
      { success: false, error: 'postalCode ou coordonnées (lat/lng) requis' },
      { status: 400 }
    );
  }

  try {
    // Si pas de coordonnées, les récupérer via l'API geo
    let latitude = lat;
    let longitude = lng;

    if (!latitude || !longitude) {
      const geoResponse = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=centre&format=json&limit=1`
      );

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData.length > 0 && geoData[0].centre) {
          longitude = geoData[0].centre.coordinates[0];
          latitude = geoData[0].centre.coordinates[1];
        }
      }
    }

    // Fallback Nominatim si toujours pas de coordonnées
    if (!latitude || !longitude) {
      const nomResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=France&format=json&limit=1`,
        { headers: { 'User-Agent': 'TemporalShop/1.0' } }
      );

      if (nomResponse.ok) {
        const nomData = await nomResponse.json();
        if (nomData.length > 0) {
          latitude = parseFloat(nomData[0].lat);
          longitude = parseFloat(nomData[0].lon);
        }
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'Impossible de localiser ce code postal',
      }, { status: 400 });
    }

    let points: RelayPoint[] = [];

    // Utiliser Boxtal API
    try {
      const boxtalPoints = await fetchBoxtalRelayPoints(postalCode, 'FR', carrier || undefined);

      if (boxtalPoints.length > 0) {
        // Calculer les distances si on a les coordonnées
        points = boxtalPoints.map(point => {
          if (point.lat && point.lng && latitude && longitude) {
            const distance = calculateDistance(latitude, longitude, point.lat, point.lng);
            return {
              ...point,
              distance: formatDistance(distance),
              distanceMeters: distance,
            };
          }
          return point;
        });
      }
    } catch (boxtalError) {
      console.error('Boxtal API error, falling back to OSM:', boxtalError);
    }

    // Fallback vers OSM si Boxtal ne retourne rien
    if (points.length === 0) {
      console.log('Using OSM fallback for relay points');

      if (!carrier || carrier === 'colissimo') {
        const osmPoints = await fetchColissimoPointsOSM(latitude, longitude, postalCode);
        points = [...points, ...osmPoints];
      }
    }

    // Trier par distance
    points.sort((a, b) => (a.distanceMeters || 999999) - (b.distanceMeters || 999999));

    return NextResponse.json({
      success: true,
      postalCode,
      city,
      coordinates: { lat: latitude, lng: longitude },
      count: points.length,
      points,
    });
  } catch (error) {
    console.error('Error fetching relay points:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des points relais' },
      { status: 500 }
    );
  }
}
