'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Clock, Phone, Check, X, Search, Loader2, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

// Types
export type RelayCarrier = 'mondial_relay' | 'chronopost' | 'ups';

export interface RelayPoint {
  id: string;
  code?: string;
  carrier: RelayCarrier | string;
  name: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  country?: string;
  lat: number;
  lng: number;
  distance?: string;
  distanceMeters?: number;
  hours: { [key: string]: string };
  phone?: string;
  photo?: string;
  services?: string[];
}

interface RelayPointSelectorProps {
  darkMode: boolean;
  onSelect: (point: RelayPoint, carrier: RelayCarrier) => void;
  selectedPoint: RelayPoint | null;
  onClose: () => void;
}

// Only carriers with a Boxtal v3.1 relay shipping offer.
// Colissimo has no v3.1 relay offer, so it's not exposed here.
const carriers: { id: RelayCarrier; name: string; logo: string; color: string }[] = [
  { id: 'mondial_relay', name: 'Mondial Relay', logo: '/point-relais/mondial-relay.svg', color: '#E30613' },
  { id: 'chronopost', name: 'Chronopost', logo: '/point-relais/chronopost pickup.png', color: '#003DA5' },
  { id: 'ups', name: 'UPS Access Point', logo: '/point-relais/ups-access-point.avif', color: '#351C15' },
];

const SUPPORTED_CARRIERS: readonly string[] = ['mondial_relay', 'chronopost', 'ups'];

// Dynamic Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function RelayPointSelector({ darkMode, onSelect, selectedPoint, onClose }: RelayPointSelectorProps) {
  const [postalCode, setPostalCode] = useState('');
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carrierFilter, setCarrierFilter] = useState<RelayCarrier | 'all'>('all');
  const [expandedPoint, setExpandedPoint] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 46.6, lng: 1.9 });
  const [mapKey, setMapKey] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Search relay points as soon as postal code has 5 digits
  const searchPoints = useCallback(async (code: string) => {
    if (code.length !== 5) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/relay-points?postalCode=${code}`);
      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur');

      // Only keep points from carriers we can actually ship to via Boxtal v3.1
      const allPoints: RelayPoint[] = data.points || [];
      const points = allPoints.filter(p => SUPPORTED_CARRIERS.includes(p.carrier));
      setRelayPoints(points);

      if (data.coordinates) {
        setMapCenter(data.coordinates);
        setMapKey(k => k + 1);
      }

      if (points.length === 0) {
        setError('Aucun point relais trouvé pour ce code postal. Essayez un code postal voisin.');
      }
    } catch (err) {
      console.error('Relay search error:', err);
      setError('Impossible de charger les points relais. Veuillez réessayer.');
      setRelayPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when 5 digits entered
  useEffect(() => {
    if (postalCode.length === 5) {
      const timer = setTimeout(() => searchPoints(postalCode), 200);
      return () => clearTimeout(timer);
    }
  }, [postalCode, searchPoints]);

  // Filter by carrier
  const filteredPoints = carrierFilter === 'all'
    ? relayPoints
    : relayPoints.filter(p => p.carrier === carrierFilter);

  // Carrier counts
  const carrierCounts: Record<string, number> = {};
  relayPoints.forEach(p => {
    carrierCounts[p.carrier] = (carrierCounts[p.carrier] || 0) + 1;
  });

  const handleSelect = (point: RelayPoint) => {
    const carrier = (point.carrier as RelayCarrier) || 'mondial_relay';
    onSelect(point, carrier);
  };

  const getCarrierInfo = (carrierId: string) => carriers.find(c => c.id === carrierId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
        darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'
      }`}>
        {/* Header + Search - compact */}
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="text-primary" size={18} />
              </div>
              <h2 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                POINT RELAIS
              </h2>
            </div>
            <button onClick={onClose} className={`w-9 h-9 rounded-full flex items-center justify-center ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-[200px]">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`} />
              <input
                ref={inputRef}
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Code postal"
                maxLength={5}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-primary ${
                  darkMode ? 'bg-white/5 border-white/15 placeholder-white/30' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                }`}
                onKeyDown={e => e.key === 'Enter' && searchPoints(postalCode)}
              />
            </div>

            {/* Carrier filter pills - only after search */}
            {hasSearched && relayPoints.length > 0 && (
              <div className="flex gap-1.5 items-center overflow-x-auto">
                <button
                  onClick={() => setCarrierFilter('all')}
                  className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    carrierFilter === 'all'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : darkMode ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                >
                  TOUS ({relayPoints.length})
                </button>
                {carriers.map(c => {
                  const count = carrierCounts[c.id] || 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCarrierFilter(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                        carrierFilter === c.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : darkMode ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }}
                    >
                      <Image src={c.logo} alt={c.name} width={16} height={16} className="object-contain" />
                      {c.name.split(' ')[0]} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Loading / Empty / Error states */}
          {!hasSearched && !isLoading && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MapPin size={40} className={`mx-auto mb-3 ${darkMode ? 'text-white/15' : 'text-gray-200'}`} />
                <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  Entrez votre code postal pour trouver les points relais
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
                <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Recherche des points relais...</p>
              </div>
            </div>
          )}

          {hasSearched && !isLoading && error && relayPoints.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MapPin size={40} className="text-red-400 mx-auto mb-3" />
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{error}</p>
              </div>
            </div>
          )}

          {/* No results for this carrier filter */}
          {hasSearched && !isLoading && filteredPoints.length === 0 && relayPoints.length > 0 && (
            <div className={`p-6 text-center rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <MapPin size={32} className={`mx-auto mb-3 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
              <p className={`text-sm mb-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Aucun point disponible pour ce transporteur dans cette zone.
              </p>
              <button
                onClick={() => setCarrierFilter('all')}
                className="text-primary text-sm hover:underline"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                VOIR TOUS LES POINTS ({relayPoints.length})
              </button>
            </div>
          )}

          {/* Map + List */}
          {hasSearched && !isLoading && filteredPoints.length > 0 && (
            <>
              {/* Map */}
              <div className="hidden md:block md:w-1/2 relative">
                {typeof window !== 'undefined' && (
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
                )}
                <MapContainer
                  key={mapKey}
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredPoints.map(point => {
                    if (!point.lat || !point.lng) return null;
                    return (
                      <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        eventHandlers={{ click: () => handleSelect(point) }}
                      >
                        <Popup>
                          <div className="p-1 min-w-[150px]">
                            <p className="font-bold text-sm">{point.name}</p>
                            <p className="text-xs text-gray-600">{point.address}</p>
                            <p className="text-xs text-gray-600">{point.postalCode} {point.city}</p>
                            {point.distance && <p className="text-xs text-purple-600 font-medium mt-1">{point.distance}</p>}
                            <button
                              onClick={() => handleSelect(point)}
                              className="mt-2 w-full py-1.5 bg-purple-600 text-white rounded text-xs font-bold"
                            >
                              CHOISIR
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* List */}
              <div className={`flex-1 md:w-1/2 flex flex-col border-l ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <div className={`px-4 py-2.5 border-b text-xs flex justify-between ${darkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                  <span>POINTS DE RETRAIT</span>
                  <span>{filteredPoints.length} résultat{filteredPoints.length > 1 ? 's' : ''}</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredPoints.map((point, idx) => {
                    const isSelected = selectedPoint?.id === point.id;
                    const isExpanded = expandedPoint === point.id;
                    const carrierInfo = getCarrierInfo(point.carrier);

                    return (
                      <div
                        key={point.id}
                        className={`border-b transition-colors ${
                          isSelected ? 'bg-primary/10' : ''
                        } ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <button onClick={() => handleSelect(point)} className="w-full p-3 text-left">
                          <div className="flex items-start gap-3">
                            {/* Number */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              isSelected ? 'bg-primary text-white' : darkMode ? 'bg-white/10 text-white/50' : 'bg-gray-200 text-gray-500'
                            }`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {carrierInfo && (
                                  <Image src={carrierInfo.logo} alt="" width={16} height={16} className="object-contain flex-shrink-0" />
                                )}
                                <h4 className="font-bold text-sm truncate" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                                  {point.name}
                                </h4>
                                {isSelected && (
                                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check size={10} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                {point.address} - {point.postalCode} {point.city}
                              </p>
                              {point.distance && (
                                <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                                  <Navigation size={9} /> {point.distance}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={e => { e.stopPropagation(); setExpandedPoint(isExpanded ? null : point.id); }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className={`px-3 pb-3 ml-9 space-y-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {point.hours && Object.keys(point.hours).length > 0 && (
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock size={11} className="text-primary" />
                                  <span className="font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>Horaires</span>
                                </div>
                                {Object.entries(point.hours).map(([day, h]) => (
                                  <div key={day} className="flex justify-between">
                                    <span>{day}</span>
                                    <span className={h === 'Fermé' ? 'text-red-400' : ''}>{h}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {point.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone size={11} className="text-primary" />
                                <span>{point.phone}</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleSelect(point)}
                              className={`w-full py-2 rounded-lg text-xs font-bold ${
                                isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {isSelected ? 'SÉLECTIONNÉ' : 'CHOISIR CE POINT'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer - selected point */}
        {selectedPoint && (
          <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {selectedPoint.name}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    {selectedPoint.address}, {selectedPoint.postalCode} {selectedPoint.city}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0 ml-3"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                CONFIRMER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { carriers };
