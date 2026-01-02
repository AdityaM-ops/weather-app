
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin, Check, Crosshair, Loader2, Search, Target, LocateFixed } from 'lucide-react';
import { geocodeLocation } from '../services/weatherService';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lon: number) => void;
  initialPos: { lat: number; lon: number };
}

// Fix for Leaflet default marker icons in ESM environments
const icon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onSelect, initialPos }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedPos, setSelectedPos] = useState(initialPos);
  const [isLocating, setIsLocating] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sync internal selectedPos with initialPos when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedPos(initialPos);
    }
  }, [isOpen, initialPos]);

  // Initialize Map
  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([initialPos.lat, initialPos.lon], initialPos.lat === 20 && initialPos.lon === 0 ? 2 : 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      markerRef.current = L.marker([initialPos.lat, initialPos.lon], {
        draggable: true,
        icon: icon
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updatePosition(lat, lng);
      });

      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        updatePosition(position.lat, position.lng, false);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const updatePosition = (lat: number, lon: number, fly = true) => {
    setSelectedPos({ lat, lon });
    markerRef.current?.setLatLng([lat, lon]);
    if (fly) {
      mapRef.current?.flyTo([lat, lon], 14, { duration: 1.5 });
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updatePosition(latitude, longitude);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleInternalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    setIsSearching(true);
    const result = await geocodeLocation(mapSearch);
    if (result) {
      updatePosition(result.lat, result.lon);
    }
    setIsSearching(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white/20">
        {/* Modal Header with Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 bg-white">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <form onSubmit={handleInternalSearch} className="relative flex-1 group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
              <input 
                type="text" 
                placeholder="Jump to city or coordinates..."
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
            </form>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleLocateMe}
              disabled={isLocating}
              className="bg-slate-100 p-3 rounded-2xl text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center gap-2 font-bold text-xs"
              title="Detect my GPS"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Target className="w-4 h-4 text-blue-600" />}
              GPS
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />
          
          {/* Action Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-[2] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                   <LocateFixed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-0.5">Deployment Target</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-bold text-slate-900">
                      {selectedPos.lat.toFixed(5)}°, {selectedPos.lon.toFixed(5)}°
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={onClose}
                  className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onSelect(selectedPos.lat, selectedPos.lon)}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 active:scale-95"
                >
                  <Check className="w-5 h-5" />
                  Apply Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
