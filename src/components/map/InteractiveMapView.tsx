import React, { useEffect, useMemo, useState } from 'react';
import { Coordinates, MechanicShop } from '../../types';
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Car,
  CheckCircle2,
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { calculateDistanceKm, calculateETA, formatINR } from '../../utils/geo';

interface InteractiveMapViewProps {
  customerCoords: Coordinates;
  mechanics?: MechanicShop[];
  selectedMechanicId?: string | null;
  onSelectMechanic?: (id: string) => void;
  mechanicLiveLocation?: Coordinates | null;
  activeRoute?: boolean;
  trackingStatus?: string;
  height?: string | number;
  className?: string;
  showSearchAreaBadge?: boolean;
}

// Controller sub-component to pan map dynamically
const MapController: React.FC<{ center: Coordinates; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      if (zoom) map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
};

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  customerCoords,
  mechanics = [],
  selectedMechanicId,
  onSelectMechanic,
  mechanicLiveLocation,
  activeRoute = false,
  trackingStatus,
  height = '100%',
  className = '',
  showSearchAreaBadge = true,
}) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<MechanicShop | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [zoom, setZoom] = useState(14);
  const [mapCenter, setMapCenter] = useState<Coordinates>(customerCoords);
  const [isExpanded, setIsExpanded] = useState(false);

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAiGfVHqJL-YqqOzZF47oQHXsP2SJLgwAU';

  // Sync selected mechanic from outside
  useEffect(() => {
    if (selectedMechanicId) {
      const match = mechanics.find((m) => m.id === selectedMechanicId);
      if (match) {
        setSelectedWorkshop(match);
        setMapCenter(match.coords);
      }
    }
  }, [selectedMechanicId, mechanics]);

  const recenterToUser = () => {
    setMapCenter(customerCoords);
    setZoom(15);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-slate-100 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl h-[calc(100vh-2rem)]' : ''
      } ${className}`}
      style={{ height: isExpanded ? 'calc(100vh - 2rem)' : height }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: customerCoords.lat, lng: customerCoords.lng }}
          center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          defaultZoom={14}
          zoom={zoom}
          onZoomChanged={(ev) => setZoom(ev.detail.zoom)}
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <MapController center={mapCenter} zoom={zoom} />

          {/* 1. Customer Stranded Vehicle Marker Pin */}
          <Marker
            position={{ lat: customerCoords.lat, lng: customerCoords.lng }}
            title="Your Location (Stranded Vehicle)"
            onClick={() => {
              setMapCenter(customerCoords);
            }}
          />

          {/* 2. Mechanics & Workshops Markers */}
          {mechanics.map((mechanic) => {
            const isSelected = selectedMechanicId === mechanic.id;
            return (
              <Marker
                key={mechanic.id}
                position={{ lat: mechanic.coords.lat, lng: mechanic.coords.lng }}
                title={`${mechanic.shopName} (★ ${mechanic.rating})`}
                onClick={() => {
                  setSelectedWorkshop(mechanic);
                  if (onSelectMechanic) onSelectMechanic(mechanic.id);
                }}
              />
            );
          })}

          {/* 3. Live Mechanic Technician Marker (When en route) */}
          {mechanicLiveLocation && (
            <Marker
              position={{ lat: mechanicLiveLocation.lat, lng: mechanicLiveLocation.lng }}
              title="Technician En Route"
            />
          )}

          {/* 4. Interactive Info Window on Selected Workshop */}
          {selectedWorkshop && (
            <InfoWindow
              position={{ lat: selectedWorkshop.coords.lat, lng: selectedWorkshop.coords.lng }}
              onCloseClick={() => setSelectedWorkshop(null)}
            >
              <div className="p-2 text-slate-800 max-w-[240px] text-xs font-sans">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-extrabold text-sm text-slate-900 leading-tight">
                    {selectedWorkshop.shopName}
                  </span>
                  {selectedWorkshop.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#24963F] text-white px-1.5 py-0.5 rounded font-extrabold text-[11px] flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-white" />
                    {selectedWorkshop.rating}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {calculateDistanceKm(customerCoords, selectedWorkshop.coords).toFixed(1)} km away •{' '}
                    {calculateETA(calculateDistanceKm(customerCoords, selectedWorkshop.coords))} mins
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                  {selectedWorkshop.address}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-[#E23744] text-xs">
                    From {formatINR(selectedWorkshop.pricingRange.min)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectMechanic) onSelectMechanic(selectedWorkshop.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#E23744] text-white font-bold text-[11px] hover:bg-[#D32332] transition-colors"
                  >
                    Select Workshop
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Top Left Badge: Original Google Maps & Verified Search Radius */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#24963F] animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight">Google Maps Live Radar</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 text-[#E23744]">
                15 MIN SOS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {mechanics.length} certified workshops active nearby
            </p>
          </div>
        </div>

        {trackingStatus && (
          <div className="bg-[#E23744] text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-extrabold flex items-center gap-1.5 animate-pulse pointer-events-auto">
            <Truck className="w-3.5 h-3.5" />
            <span>{trackingStatus}</span>
          </div>
        )}
      </div>

      {/* Floating Map Controls on Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        {/* Map Type Switcher */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setMapTypeId('roadmap')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              mapTypeId === 'roadmap' ? 'bg-[#E23744] text-white' : 'hover:bg-slate-100'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapTypeId('hybrid')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              mapTypeId === 'hybrid' ? 'bg-[#E23744] text-white' : 'hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title={isExpanded ? 'Minimize Map' : 'Maximize Map'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Bottom Right Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={recenterToUser}
          className="p-2.5 rounded-2xl bg-white shadow-lg border border-slate-200 text-[#E23744] hover:bg-red-50 transition-colors"
          title="Recenter on My Location"
        >
          <Navigation className="w-5 h-5 fill-[#E23744]/20" />
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col divide-y divide-slate-100 overflow-hidden text-slate-700">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(20, z + 1))}
            className="p-2 hover:bg-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(10, z - 1))}
            className="p-2 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
