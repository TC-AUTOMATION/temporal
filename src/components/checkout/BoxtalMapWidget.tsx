'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X, AlertCircle, MapPin, Clock, Truck, Check } from 'lucide-react';
import Image from 'next/image';

// Boxtal parcel point type - structure réelle retournée par le widget
export interface BoxtalParcelPoint {
  code: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  network: string;
  distanceFromSearchedAddress?: number;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

// Notre type RelayPoint normalisé
export interface RelayPoint {
  id: string;
  code: string;
  carrier: string;
  carrierName: string;
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
}

interface BoxtalMapWidgetProps {
  darkMode: boolean;
  onSelect: (point: RelayPoint, carrier: string) => void;
  selectedPoint: RelayPoint | null;
  onClose: () => void;
}

// Mapping des réseaux Boxtal vers nos carriers
const NETWORK_CONFIG: Record<string, { carrier: string; name: string; logo: string; color: string }> = {
  'MONR_NETWORK': { carrier: 'mondial_relay', name: 'Mondial Relay', logo: '/point-relais/mondial-relay.svg', color: '#E30613' },
  'SOGP_NETWORK': { carrier: 'colissimo', name: 'Colissimo', logo: '/point-relais/colissimo.png', color: '#FFCC00' },
  'CHRP_NETWORK': { carrier: 'chronopost', name: 'Chronopost', logo: '/point-relais/chronopost pickup.png', color: '#003DA5' },
  'UPSE_NETWORK': { carrier: 'ups', name: 'UPS Access Point', logo: '/point-relais/ups-access-point.avif', color: '#351C15' },
  'POFR_NETWORK': { carrier: 'colissimo', name: 'La Poste', logo: '/point-relais/colissimo.png', color: '#FFCC00' },
};

// Jours de la semaine en français
const DAYS_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

// Convertir un point Boxtal vers notre format
function convertBoxtalPoint(point: BoxtalParcelPoint): RelayPoint {
  const networkConfig = NETWORK_CONFIG[point.network] || {
    carrier: point.network.toLowerCase().replace('_network', ''),
    name: point.network,
    logo: '',
    color: '#6D28D9',
  };

  // Convertir les horaires
  const hours: Record<string, string> = {};
  if (point.openingHours) {
    Object.entries(point.openingHours).forEach(([day, value]) => {
      if (value && DAYS_FR[day]) {
        hours[DAYS_FR[day]] = value;
      }
    });
  }

  // Si pas d'horaires, mettre des valeurs par défaut
  if (Object.keys(hours).length === 0) {
    hours['Lundi - Vendredi'] = '09:00 - 19:00';
    hours['Samedi'] = '09:00 - 12:30';
  }

  // Formater la distance
  let distance: string | undefined;
  if (point.distanceFromSearchedAddress) {
    const km = point.distanceFromSearchedAddress / 1000;
    distance = km < 1 ? `${Math.round(point.distanceFromSearchedAddress)} m` : `${km.toFixed(1)} km`;
  }

  return {
    id: `${networkConfig.carrier}-${point.code}`,
    code: point.code,
    carrier: networkConfig.carrier,
    carrierName: networkConfig.name,
    name: point.name || networkConfig.name,
    address: point.address || '',
    city: point.city || '',
    postalCode: point.zipCode || '',
    country: point.country || 'FR',
    lat: point.latitude,
    lng: point.longitude,
    distance,
    distanceMeters: point.distanceFromSearchedAddress,
    hours,
  };
}

// Declare global pour le widget Boxtal
declare global {
  interface Window {
    BoxtalParcelPointMap?: {
      BoxtalParcelPointMap: new (config: BoxtalConfig) => BoxtalMapsInstance;
    };
  }
}

interface BoxtalConfig {
  domToLoadMap: string;
  accessToken: string;
  config: {
    locale: string;
    parcelPointNetworks: Array<{
      code: string;
      markerTemplate?: { color: string };
    }>;
    options?: {
      primaryColor?: string;
      autoSelectNearestParcelPoint?: boolean;
    };
  };
  onMapLoaded?: () => void;
}

interface BoxtalMapsInstance {
  searchParcelPoints: (
    address: { country: string; zipCode: string; city?: string },
    callback: (point: BoxtalParcelPoint) => void
  ) => void;
}

export default function BoxtalMapWidget({
  darkMode,
  onSelect,
  selectedPoint: externalSelectedPoint,
  onClose,
}: BoxtalMapWidgetProps) {
  const boxtalMapsRef = useRef<BoxtalMapsInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<RelayPoint | null>(externalSelectedPoint);
  const [hasSearched, setHasSearched] = useState(false);

  // Charger le script Boxtal et initialiser la carte
  useEffect(() => {
    let mounted = true;

    const initializeBoxtal = async () => {
      try {
        // Récupérer le token d'accès
        const tokenResponse = await fetch('/api/boxtal/token');
        if (!tokenResponse.ok) {
          throw new Error('Impossible de récupérer le token Boxtal');
        }
        const { accessToken } = await tokenResponse.json();

        if (!mounted) return;

        // Charger le script Boxtal s'il n'est pas déjà chargé
        if (!window.BoxtalParcelPointMap) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://maps.boxtal.com/app/v3/assets/dependencies/@boxtal/parcel-point-map/dist/index.global.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Impossible de charger le script Boxtal'));
            document.head.appendChild(script);
          });
        }

        if (!mounted || !window.BoxtalParcelPointMap) return;

        // Initialiser la carte
        const BoxtalMaps = window.BoxtalParcelPointMap.BoxtalParcelPointMap;

        boxtalMapsRef.current = new BoxtalMaps({
          domToLoadMap: '#boxtal-map-container',
          accessToken,
          config: {
            locale: 'fr',
            parcelPointNetworks: [
              { code: 'MONR_NETWORK', markerTemplate: { color: '#E30613' } },
              { code: 'SOGP_NETWORK', markerTemplate: { color: '#FFCC00' } },
              { code: 'CHRP_NETWORK', markerTemplate: { color: '#003DA5' } },
              { code: 'UPSE_NETWORK', markerTemplate: { color: '#351C15' } },
            ],
            options: {
              primaryColor: '#6D28D9',
              autoSelectNearestParcelPoint: true,
            },
          },
          onMapLoaded: () => {
            if (mounted) {
              setIsLoading(false);
            }
          },
        });
      } catch (err) {
        if (mounted) {
          console.error('Erreur initialisation Boxtal:', err);
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
          setIsLoading(false);
        }
      }
    };

    initializeBoxtal();

    return () => {
      mounted = false;
    };
  }, []);

  // Rechercher les points relais
  const handleSearch = () => {
    if (!boxtalMapsRef.current || postalCode.length !== 5) return;

    setHasSearched(true);

    boxtalMapsRef.current.searchParcelPoints(
      {
        country: 'FR',
        zipCode: postalCode,
      },
      (boxtalPoint: BoxtalParcelPoint) => {
        console.log('Point sélectionné Boxtal:', boxtalPoint);
        const point = convertBoxtalPoint(boxtalPoint);
        console.log('Point converti:', point);
        setSelectedPoint(point);
      }
    );
  };

  // Confirmer la sélection
  const handleConfirm = () => {
    if (selectedPoint) {
      onSelect(selectedPoint, selectedPoint.carrier);
      onClose();
    }
  };

  // Obtenir le config du carrier
  const getCarrierConfig = (carrier: string) => {
    return Object.values(NETWORK_CONFIG).find(c => c.carrier === carrier) || {
      carrier,
      name: carrier,
      logo: '',
      color: '#6D28D9',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                CHOISIR UN POINT RELAIS
              </h2>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                Mondial Relay • Colissimo • Chronopost • UPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Code postal (ex: 75001)"
                maxLength={5}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent text-base focus:outline-none focus:border-primary transition-colors ${
                  darkMode
                    ? 'border-white/20 placeholder-white/40'
                    : 'border-black/20 placeholder-black/40'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={postalCode.length !== 5 || isLoading}
              className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              RECHERCHER
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map container */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: darkMode ? '#18181b' : '#fff' }}>
                <div className="text-center">
                  <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Chargement de la carte...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: darkMode ? '#18181b' : '#fff' }}>
                <div className="text-center p-8">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 font-medium mb-2">Erreur de chargement</p>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && !hasSearched && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center p-8">
                  <MapPin size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
                  <p className={`text-lg font-medium ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    Entrez votre code postal pour rechercher les points relais
                  </p>
                </div>
              </div>
            )}

            <div
              id="boxtal-map-container"
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Selected point panel */}
          {selectedPoint && (
            <div className={`w-80 border-l flex flex-col ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-gray-50'}`}>
              {/* Carrier header */}
              <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="flex items-center gap-3">
                  {getCarrierConfig(selectedPoint.carrier).logo && (
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
                      <Image
                        src={getCarrierConfig(selectedPoint.carrier).logo}
                        alt={selectedPoint.carrierName}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {selectedPoint.carrierName}
                    </p>
                    {selectedPoint.distance && (
                      <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                        à {selectedPoint.distance}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Point details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Name & Address */}
                <div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{selectedPoint.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                        {selectedPoint.address}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                        {selectedPoint.postalCode} {selectedPoint.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opening hours */}
                {Object.keys(selectedPoint.hours).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-primary" />
                      <p className="font-semibold text-sm">Horaires d'ouverture</p>
                    </div>
                    <div className={`text-sm space-y-1 pl-6 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                      {Object.entries(selectedPoint.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span>{day}</span>
                          <span>{hours || 'Fermé'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code point relais */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    Code point relais
                  </p>
                  <p className="font-mono font-bold">{selectedPoint.code}</p>
                </div>
              </div>

              {/* Confirm button */}
              <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Check size={18} />
                  CONFIRMER CE POINT RELAIS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
