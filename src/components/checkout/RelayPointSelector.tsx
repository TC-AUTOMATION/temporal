'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Clock, Phone, Check, X, Search, ChevronDown, ChevronUp, Loader2, Navigation } from 'lucide-react';

// Types
export type RelayCarrier = 'mondial_relay' | 'chronopost' | 'colissimo' | 'ups';

export interface RelayPoint {
  id: string;
  code?: string; // Boxtal code for creating shipments
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
  hours: {
    [key: string]: string;
  };
  phone?: string;
  photo?: string;
  services?: string[];
}

interface City {
  name: string;
  postalCode: string;
  lat: number;
  lng: number;
  department: string;
}

interface RelayPointSelectorProps {
  darkMode: boolean;
  onSelect: (point: RelayPoint, carrier: RelayCarrier) => void;
  selectedPoint: RelayPoint | null;
  onClose: () => void;
}

// Carrier data - Boxtal supported carriers
const carriers: { id: RelayCarrier; name: string; logo: string; color: string; delay: string; boxtalCode: string }[] = [
  { id: 'mondial_relay', name: 'Mondial Relay', logo: '/point-relais/mondial-relay.svg', color: '#E30613', delay: '3-5 jours', boxtalCode: 'MONR' },
  { id: 'colissimo', name: 'Colissimo', logo: '/point-relais/colissimo.png', color: '#FFCC00', delay: '2-3 jours', boxtalCode: 'SOGP' },
  { id: 'chronopost', name: 'Chronopost', logo: '/point-relais/chronopost pickup.png', color: '#003DA5', delay: '1-2 jours', boxtalCode: 'CHRP' },
  { id: 'ups', name: 'UPS Access Point', logo: '/point-relais/ups-access-point.avif', color: '#351C15', delay: '2-3 jours', boxtalCode: 'UPSE' },
];

// All carriers are enabled via Boxtal
const enabledCarriers = carriers;

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function RelayPointSelector({ darkMode, onSelect, selectedPoint, onClose }: RelayPointSelectorProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<RelayCarrier | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [expandedPoint, setExpandedPoint] = useState<string | null>(null);

  // API state
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carrierCounts, setCarrierCounts] = useState<Record<RelayCarrier, number>>({
    mondial_relay: 0,
    chronopost: 0,
    colissimo: 0,
    ups: 0,
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 46.603354, lng: 1.888334 }); // France center
  const [mapKey, setMapKey] = useState(0); // Force map re-render

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cities when postal code changes
  useEffect(() => {
    const fetchCities = async () => {
      if (postalCode.length !== 5) {
        setCities([]);
        setSelectedCity(null);
        return;
      }

      setIsLoadingCities(true);
      try {
        const response = await fetch(`/api/geo/cities?postalCode=${postalCode}`);
        const data = await response.json();

        if (data.success && data.cities.length > 0) {
          setCities(data.cities);
          // Auto-select if only one city
          if (data.cities.length === 1) {
            setSelectedCity(data.cities[0]);
            setShowCityDropdown(false);
          } else {
            setShowCityDropdown(true);
          }
        } else {
          setCities([]);
          setSelectedCity(null);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [postalCode]);

  // Fetch relay points from API - always fetch ALL carriers
  const fetchRelayPoints = useCallback(async (city: City) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        postalCode: city.postalCode,
        city: city.name,
        lat: city.lat.toString(),
        lng: city.lng.toString(),
      });

      // Always fetch all carriers, filtering is done client-side
      const response = await fetch(`/api/relay-points?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error fetching relay points');
      }

      const data = await response.json();

      if (data.success) {
        setRelayPoints(data.points || []);
        setMapCenter(data.coordinates || { lat: city.lat, lng: city.lng });
        setMapKey(prev => prev + 1); // Force map re-render

        // Update carrier counts
        const counts: Record<RelayCarrier, number> = {
          mondial_relay: 0,
          chronopost: 0,
          colissimo: 0,
          ups: 0,
        };

        (data.points || []).forEach((point: RelayPoint) => {
          if (point.carrier in counts) {
            counts[point.carrier as RelayCarrier]++;
          }
        });

        setCarrierCounts(counts);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching relay points:', err);
      setError(err instanceof Error ? err.message : 'Connection error');
      setRelayPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when city is selected (only once, not when carrier changes)
  useEffect(() => {
    if (selectedCity) {
      fetchRelayPoints(selectedCity);
    }
  }, [selectedCity, fetchRelayPoints]);

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
  };

  // Filter points by selected carrier
  const filteredPoints = selectedCarrier
    ? relayPoints.filter(p => p.carrier === selectedCarrier)
    : [];

  // Get carrier info
  const getCarrierInfo = (carrierId: RelayCarrier) => {
    return carriers.find(c => c.id === carrierId);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
        darkMode ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'border-white/10' : 'border-black/10'
        }`}>
          <div>
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              CHOOSE A RELAY POINT
            </h2>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
              Enter your postal code to find nearby relay points
            </p>
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

        {/* Search bar with postal code and city */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Postal code input */}
            <div className="relative w-full sm:w-48">
              <label className={`text-[10px] font-medium mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                     style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                POSTAL CODE
              </label>
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/30' : 'text-black/30'}`} />
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setPostalCode(value);
                  }}
                  placeholder="Ex: 75001"
                  maxLength={5}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-transparent text-sm focus:outline-none focus:border-primary transition-colors ${
                    darkMode ? 'border-white/10 text-white placeholder-white/30' : 'border-black/10 text-black placeholder-black/30'
                  }`}
                />
                {isLoadingCities && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* City dropdown */}
            <div className="relative flex-1" ref={dropdownRef}>
              <label className={`text-[10px] font-medium mb-1 block ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                     style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                CITY
              </label>
              <button
                onClick={() => cities.length > 1 && setShowCityDropdown(!showCityDropdown)}
                disabled={cities.length === 0}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent text-sm text-left flex items-center justify-between transition-colors ${
                  darkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'
                } ${cities.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
              >
                <span className={!selectedCity ? (darkMode ? 'text-white/30' : 'text-black/30') : ''}>
                  {selectedCity ? selectedCity.name : (postalCode.length === 5 ? 'Select a city' : 'Enter a postal code')}
                </span>
                {cities.length > 1 && <ChevronDown size={16} className={`transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />}
              </button>

              {/* Dropdown list */}
              {showCityDropdown && cities.length > 1 && (
                <div className={`absolute z-20 mt-1 w-full rounded-xl border-2 shadow-xl max-h-48 overflow-y-auto ${
                  darkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-black/10'
                }`}>
                  {cities.map((city, index) => (
                    <button
                      key={`${city.postalCode}-${city.name}-${index}`}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedCity?.name === city.name
                          ? 'bg-primary/10 text-primary'
                          : darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {city.department}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show carriers only if city is selected */}
        {selectedCity && (
          <>
            {/* Carrier selection */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                 style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                CHOOSE YOUR CARRIER
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {enabledCarriers.map((carrier) => {
                  const pointCount = carrierCounts[carrier.id] || 0;
                  return (
                    <button
                      key={carrier.id}
                      onClick={() => setSelectedCarrier(carrier.id)}
                      disabled={isLoading}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        selectedCarrier === carrier.id
                          ? 'border-primary bg-primary/10 scale-[1.02]'
                          : darkMode
                            ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                            : 'border-black/10 hover:border-black/20 bg-black/[0.02]'
                      } ${isLoading ? 'opacity-50' : ''}`}
                    >
                      {selectedCarrier === carrier.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}

                      <div className="h-8 mb-2 flex items-center justify-center">
                        <Image
                          src={carrier.logo}
                          alt={carrier.name}
                          width={80}
                          height={28}
                          className="object-contain max-h-8"
                        />
                      </div>

                      <p className={`text-[10px] text-center ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {carrier.delay}
                      </p>
                      <p className={`text-[10px] text-center font-medium mt-0.5 ${pointCount > 0 ? 'text-primary' : darkMode ? 'text-white/20' : 'text-black/20'}`}>
                        {isLoading ? '...' : pointCount > 0 ? `${pointCount} point${pointCount > 1 ? 's' : ''}` : 'None'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map and list */}
            {selectedCarrier && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[400px]">
                {/* Map */}
                <div className="md:w-1/2 h-64 md:h-auto relative">
                  {isLoading ? (
                    <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                      <div className="text-center">
                        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
                        <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-black/60'}`}>Loading relay points...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      {typeof window !== 'undefined' && (
                        <link
                          rel="stylesheet"
                          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                          crossOrigin=""
                        />
                      )}
                      <MapContainer
                        key={mapKey}
                        center={[mapCenter.lat, mapCenter.lng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredPoints.map((point) => {
                          if (!point.lat || !point.lng) return null;
                          const isSelected = selectedPoint?.id === point.id;

                          return (
                            <Marker
                              key={point.id}
                              position={[point.lat, point.lng]}
                              eventHandlers={{
                                click: () => onSelect(point as RelayPoint, selectedCarrier),
                              }}
                            >
                              <Popup>
                                <div className="p-1">
                                  <p className="font-bold text-sm">{point.name}</p>
                                  <p className="text-xs text-gray-600">{point.address}</p>
                                  <p className="text-xs text-gray-600">{point.postalCode} {point.city}</p>
                                  {point.distance && (
                                    <p className="text-xs text-primary font-medium mt-1">{point.distance}</p>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    </div>
                  )}
                </div>

                {/* List */}
                <div className={`md:w-1/2 flex flex-col border-l ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                         style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                        PICKUP POINTS
                      </p>
                      <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {filteredPoints.length} result{filteredPoints.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <Loader2 size={32} className="animate-spin text-primary mb-3" />
                        <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                          Searching...
                        </p>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <X size={40} className="text-red-500 mb-3" />
                        <p className="text-red-500 text-sm text-center">{error}</p>
                      </div>
                    ) : filteredPoints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <MapPin size={40} className={`mb-3 ${darkMode ? 'text-white/20' : 'text-black/20'}`} />
                        <p className={`text-sm text-center ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                          No relay point found for this carrier
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-black/5'}`}>
                        {filteredPoints.map((point, index) => {
                          const isSelected = selectedPoint?.id === point.id;
                          const isExpanded = expandedPoint === point.id;

                          return (
                            <div
                              key={point.id}
                              onMouseEnter={() => setHoveredPoint(point.id)}
                              onMouseLeave={() => setHoveredPoint(null)}
                              className={`transition-all ${
                                isSelected
                                  ? 'bg-primary/10'
                                  : hoveredPoint === point.id
                                    ? darkMode ? 'bg-white/5' : 'bg-black/5'
                                    : ''
                              }`}
                            >
                              <button
                                onClick={() => onSelect(point as RelayPoint, selectedCarrier)}
                                className="w-full p-4 text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                      isSelected
                                        ? 'bg-primary text-white'
                                        : darkMode ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'
                                    }`}
                                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                                  >
                                    {index + 1}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-sm truncate" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                                        {point.name}
                                      </h4>
                                      {isSelected && (
                                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                          <Check size={12} className="text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                      {point.address}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                      {point.postalCode} {point.city}
                                    </p>
                                    {point.distance && (
                                      <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                                        <Navigation size={10} />
                                        {point.distance}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedPoint(isExpanded ? null : point.id);
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                      darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                                    }`}
                                  >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                              </button>

                              {isExpanded && (
                                <div className={`px-4 pb-4 pt-0 ml-10 space-y-3 ${
                                  darkMode ? 'text-white/60' : 'text-black/60'
                                }`}>
                                  {point.hours && Object.keys(point.hours).length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Clock size={12} className="text-primary" />
                                        <span className="text-[10px] font-medium uppercase" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                                          Hours
                                        </span>
                                      </div>
                                      <div className="text-xs space-y-0.5">
                                        {Object.entries(point.hours).map(([day, hours]) => (
                                          <div key={day} className="flex justify-between">
                                            <span>{day}</span>
                                            <span className={hours === 'Closed' ? 'text-red-400' : ''}>{hours}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {point.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone size={12} className="text-primary" />
                                      <span className="text-xs">{point.phone}</span>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => onSelect(point as RelayPoint, selectedCarrier)}
                                    className={`w-full py-2 rounded-lg text-xs transition-all ${
                                      isSelected
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                    }`}
                                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                                  >
                                    {isSelected ? 'SELECTED' : 'SELECT THIS POINT'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state when no city selected */}
        {!selectedCity && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
              darkMode ? 'bg-white/5' : 'bg-black/5'
            }`}>
              <Search size={40} className={darkMode ? 'text-white/20' : 'text-black/20'} />
            </div>
            <p className={`text-center text-lg mb-2 ${darkMode ? 'text-white/60' : 'text-black/60'}`}
               style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
              ENTER YOUR POSTAL CODE
            </p>
            <p className={`text-center text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
              To find nearby relay points
            </p>
          </div>
        )}

        {/* Footer */}
        {selectedPoint && (
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {selectedPoint.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {selectedPoint.address}, {selectedPoint.city}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export carriers for use in checkout
export { carriers };
