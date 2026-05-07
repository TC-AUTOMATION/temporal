import { NextRequest, NextResponse } from 'next/server';
import { fetchBoxtalRelayPoints } from '@/lib/boxtal';

interface RelayPoint {
  id: string;
  code?: string;
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

// ==================== CACHE ====================
// Cache relay points for 10 minutes to avoid hammering Overpass
const cache = new Map<string, { points: RelayPoint[]; coords: { lat: number; lng: number }; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour - relay points don't change often
const CACHE_STALE_TTL = 24 * 60 * 60 * 1000; // Serve stale cache up to 24h if fresh fetch fails

// Track Boxtal availability - don't retry for 5 min after failure
let boxtalDown = false;
let boxtalDownSince = 0;
const BOXTAL_RETRY_DELAY = 5 * 60 * 1000; // 5 min

// ==================== UTILS ====================
function calcDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function fmtDist(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

// ==================== GEO ====================
async function getCoords(postalCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=centre&format=json&limit=1`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0 && data[0].centre) {
        return { lng: data[0].centre.coordinates[0], lat: data[0].centre.coordinates[1] };
      }
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=France&format=json&limit=1`,
      { headers: { 'User-Agent': 'TemporalShop/1.0' }, signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch { /* ignore */ }

  return null;
}

// ==================== OVERPASS (OSM) ====================
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

async function fetchOSM(lat: number, lng: number, postalCode: string): Promise<RelayPoint[]> {
  // Smaller radius for dense areas, bigger for rural
  const isDense = postalCode.startsWith('75') || postalCode.startsWith('69') || postalCode.startsWith('13') || postalCode.startsWith('31') || postalCode.startsWith('33') || postalCode.startsWith('59') || postalCode.startsWith('06') || postalCode.startsWith('34') || postalCode.startsWith('44') || postalCode.startsWith('67');
  const radius = isDense ? 3000 : 15000;
  const limit = isDense ? 15 : 30;
  // Two separate queries: one for post offices/lockers, one for branded relay points
  // Regex queries are slow on Overpass, but exact brand match on a smaller set is OK
  const queryPostal = `[out:json][timeout:8];(node["amenity"="post_office"](around:${radius},${lat},${lng});node["amenity"="parcel_locker"](around:${radius},${lat},${lng});node["amenity"="parcel_pickup"](around:${radius},${lat},${lng}););out body ${limit};`;
  const queryRelay = `[out:json][timeout:8];(node["brand"="Mondial Relay"](around:${radius},${lat},${lng});node["brand"="Chronopost"](around:${radius},${lat},${lng});node["brand"="UPS"](around:${radius},${lat},${lng});node["brand"="Relais Colis"](around:${radius},${lat},${lng});node["brand"="Point Relais"](around:${radius},${lat},${lng}););out body ${limit};`;
  const query = queryPostal; // Primary query - always works

  const controllers: AbortController[] = [];

  // Helper to fetch from one Overpass server
  async function fetchFromOverpass(queryStr: string): Promise<any[]> {
    const ctrls: AbortController[] = [];
    try {
      const result = await Promise.any(
        OVERPASS_SERVERS.map(async (server, idx) => {
          const ctrl = new AbortController();
          ctrls.push(ctrl);
          controllers.push(ctrl);
          const res = await fetch(server, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'TemporalShop/1.0 (relay-points)',
            },
            body: `data=${encodeURIComponent(queryStr)}`,
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(`Overpass server ${idx} returned ${res.status}`);
          const json = await res.json();
          if (!json.elements || json.elements.length === 0) throw new Error(json.remark || `server ${idx}: no elements`);
          return json.elements;
        })
      );
      ctrls.forEach(c => c.abort());
      return result;
    } catch {
      ctrls.forEach(c => c.abort());
      return [];
    }
  }

  try {
    // Run postal and relay queries in parallel
    const [postalResult, relayResult] = await Promise.all([
      fetchFromOverpass(queryPostal),
      fetchFromOverpass(queryRelay),
    ]);

    const result = [...postalResult, ...relayResult];

    // Cancel any remaining
    controllers.forEach(c => c.abort());

    return (result as any[])
      .map((el: any) => {
        const pLat = el.lat || el.center?.lat;
        const pLng = el.lon || el.center?.lon;
        if (!pLat || !pLng) return null;

        const tags = el.tags || {};
        const dist = calcDist(lat, lng, pLat, pLng);
        const brand = (tags.brand || tags.operator || '').toLowerCase();

        const operator = (tags.operator || '').toLowerCase();
        let carrier = 'colissimo';
        if (brand.includes('mondial') || brand.includes('relais colis') || operator.includes('mondial')) carrier = 'mondial_relay';
        else if (brand.includes('chronopost') || operator.includes('chronopost')) carrier = 'chronopost';
        else if (brand.includes('ups') || operator.includes('ups')) carrier = 'ups';

        // Build a meaningful name from available tags
        const rawName = tags.name || '';
        const city = tags['addr:city'] || '';
        let name = '';

        if (tags.amenity === 'parcel_locker') {
          const shopName = tags['brand:name'] || tags.brand || tags.operator || '';
          name = shopName ? `${shopName} - Consigne auto` : 'Consigne automatique';
        } else if (tags.amenity === 'post_office') {
          // Post offices in OSM often have name = city name or "La Poste"
          // Make it clear it's a post office
          if (rawName && rawName !== 'La Poste' && rawName !== 'Poste' && rawName !== city) {
            name = `La Poste - ${rawName}`;
          } else if (city) {
            name = `La Poste - ${city}`;
          } else {
            name = rawName || 'La Poste';
          }
        } else {
          name = rawName || tags['brand:name'] || tags.brand || city || 'Point Relais';
        }
        const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : '';

        return {
          id: `osm-${carrier}-${el.id}`,
          code: `OSM-${el.id}`,
          carrier,
          name,
          address: street || tags['addr:full'] || (tags['addr:city'] ? tags['addr:city'] : postalCode),
          city: tags['addr:city'] || '',
          postalCode: tags['addr:postcode'] || postalCode,
          country: 'FR',
          lat: pLat,
          lng: pLng,
          distance: fmtDist(dist),
          distanceMeters: dist,
          hours: parseHours(tags.opening_hours) || { 'Lundi-Vendredi': '09:00-18:00', 'Samedi': '09:00-12:00', 'Dimanche': 'Fermé' },
          phone: tags.phone || (carrier === 'colissimo' ? '3631' : undefined),
          isOsmFallback: true, // Flag: not a real Boxtal point, shipping label must be created manually
        } as RelayPoint;
      })
      .filter((p): p is RelayPoint => p !== null)
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0))
      .slice(0, 25);
  } catch (err) {
    // All servers failed
    controllers.forEach(c => c.abort());
    console.error('OSM Overpass failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

function parseHours(raw?: string): Record<string, string> | null {
  if (!raw) return null;
  const dayMap: Record<string, string> = { Mo: 'Lundi', Tu: 'Mardi', We: 'Mercredi', Th: 'Jeudi', Fr: 'Vendredi', Sa: 'Samedi', Su: 'Dimanche' };
  const result: Record<string, string> = {};
  try {
    for (const part of raw.split(';').map(s => s.trim())) {
      const m = part.match(/^([A-Za-z,-]+)\s+(.+)$/);
      if (!m) continue;
      const rm = m[1].match(/^(\w{2})-(\w{2})$/);
      if (rm) {
        const all = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const s = all.indexOf(rm[1]), e = all.indexOf(rm[2]);
        if (s >= 0 && e >= 0) for (let i = s; i <= e; i++) result[dayMap[all[i]] || all[i]] = m[2];
      } else {
        result[dayMap[m[1]] || m[1]] = m[2];
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch { return null; }
}

// ==================== MAIN HANDLER ====================
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const postalCode = sp.get('postalCode') || '';
  const carrier = sp.get('carrier') as string | null;

  if (!postalCode) {
    return NextResponse.json({ success: false, error: 'Code postal requis' }, { status: 400 });
  }

  // Check cache first
  const cached = cache.get(postalCode);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      postalCode,
      coordinates: cached.coords,
      count: cached.points.length,
      points: cached.points,
    });
  }

  try {
    const coords = await getCoords(postalCode);
    if (!coords) {
      return NextResponse.json({ success: false, error: 'Code postal introuvable' }, { status: 400 });
    }

    // Launch Boxtal (if not known down) and OSM in parallel
    const shouldTryBoxtal = !boxtalDown || (Date.now() - boxtalDownSince > BOXTAL_RETRY_DELAY);

    const [boxtalResult, osmResult] = await Promise.allSettled([
      shouldTryBoxtal
        ? fetchBoxtalRelayPoints(postalCode, 'FR', carrier || undefined).then((points) => {
            if (points.length === 0) {
              // Boxtal returned no results (likely 403/502) - mark as down
              boxtalDown = true;
              boxtalDownSince = Date.now();
            }
            return points;
          }).catch((e) => {
            boxtalDown = true;
            boxtalDownSince = Date.now();
            console.error('Boxtal down, will retry in 5min:', e?.message || e);
            return [] as any[];
          })
        : Promise.resolve([]),
      fetchOSM(coords.lat, coords.lng, postalCode),
    ]);

    let points: RelayPoint[] = [];

    // Merge Boxtal results
    const boxtalPoints = boxtalResult.status === 'fulfilled' ? (boxtalResult.value || []) : [];
    if (boxtalPoints.length > 0) {
      boxtalDown = false; // Boxtal is back!
      points = boxtalPoints.map((p: any) => {
        if (p.lat && p.lng) {
          const d = calcDist(coords.lat, coords.lng, p.lat, p.lng);
          return { ...p, distance: fmtDist(d), distanceMeters: d };
        }
        return p;
      });
    }

    // Merge OSM results (deduplicate by proximity)
    const osmPoints = osmResult.status === 'fulfilled' ? (osmResult.value || []) : [];
    for (const op of osmPoints) {
      const isDup = points.some(p => Math.abs(p.lat - op.lat) < 0.001 && Math.abs(p.lng - op.lng) < 0.001);
      if (!isDup) points.push(op);
    }

    // Sort by distance
    points.sort((a, b) => (a.distanceMeters || 999999) - (b.distanceMeters || 999999));

    // Only cache if we got results (don't cache empty responses from timeouts)
    if (points.length > 0) {
      cache.set(postalCode, { points, coords, ts: Date.now() });
    }

    return NextResponse.json({
      success: true,
      postalCode,
      coordinates: coords,
      count: points.length,
      points,
    });
  } catch (error) {
    console.error('Relay points error:', error);
    // Serve stale cache if available
    const stale = cache.get(postalCode);
    if (stale && Date.now() - stale.ts < CACHE_STALE_TTL) {
      return NextResponse.json({
        success: true,
        postalCode,
        coordinates: stale.coords,
        count: stale.points.length,
        points: stale.points,
      });
    }
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
