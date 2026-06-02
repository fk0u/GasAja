import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin, Search, X, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/lib/firebase';

const QUICK_SUGGESTIONS = [
  { name: 'Warkop 88, Kayutangi', lat: -3.3167, lng: 114.5833, category: '☕ Cafe' },
  { name: 'Kopi Senja, Antasan Besar', lat: -3.3200, lng: 114.5900, category: '☕ Cafe' },
  { name: 'Duta Mall Banjarmasin', lat: -3.3174, lng: 114.5910, category: '🛍️ Mall' },
  { name: 'Siring Menara Pandang', lat: -3.3244, lng: 114.5895, category: '🏞️ Landmark' },
  { name: 'GOR Hasanuddin', lat: -3.3120, lng: 114.5760, category: '⚽ Olahraga' },
  { name: 'Pasar Lama Banjarmasin', lat: -3.3190, lng: 114.5915, category: '🍜 Kuliner' },
  { name: 'Taman Kamboja', lat: -3.3260, lng: 114.5870, category: '🌳 Taman' },
  { name: 'Perpustakaan Daerah Kalsel', lat: -3.3140, lng: 114.5850, category: '📚 Edukasi' },
];

const LocationPicker = ({ isOpen, onClose, onSelect, currentLocation }) => {
  const [viewport] = useState({ latitude: -3.3194, longitude: 114.5907, zoom: 13 });
  const [marker, setMarker] = useState(currentLocation?.lat ? { lat: currentLocation.lat, lng: currentLocation.lng } : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState(currentLocation?.name || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const mapRef = useRef(null);
  const searchTimeout = useRef(null);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      setShowQuick(val.length > 0);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      setShowQuick(false);
    }
  };

  // Mapbox Geocoding API search
  useEffect(() => {
    if (searchQuery.length < 2) return;

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
          `access_token=${MAPBOX_TOKEN}&limit=6&language=id&country=ID&proximity=114.5907,-3.3194&types=poi,address,place,locality`
        );
        const data = await res.json();
        const results = (data.features || []).map(f => ({
          name: f.place_name,
          shortName: f.text,
          category: f.properties?.category || f.place_type?.[0] || '',
          lat: f.center[1],
          lng: f.center[0],
        }));
        setSearchResults(results);
      } catch (e) {
        console.error('Geocoding error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Filter quick suggestions
  const filteredQuick = QUICK_SUGGESTIONS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMapClick = useCallback(async (e) => {
    const { lng, lat } = e.lngLat;
    setMarker({ lat, lng });
    // Reverse geocode to get place name
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=id&limit=1`
      );
      const data = await res.json();
      const name = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setSelectedName(name);
    } catch {
      setSelectedName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, []);

  const handleResultClick = (result) => {
    setMarker({ lat: result.lat, lng: result.lng });
    setSelectedName(result.name || result.shortName);
    setSearchQuery('');
    setSearchResults([]);
    setShowQuick(false);
    mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 15, duration: 1200 });
  };

  const handleConfirm = () => {
    if (marker && selectedName) {
      onSelect({ name: selectedName, lat: marker.lat, lng: marker.lng });
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasDropdown = searchResults.length > 0 || (showQuick && filteredQuick.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-gas-darker border-t border-gray-800 rounded-t-[40px] w-full max-w-xl mx-auto flex flex-col h-[85vh]"
      >
        <div className="p-6 pb-3 shrink-0">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-black text-white">Pilih Lokasi</h3>
            <button onClick={onClose} className="p-2 bg-gas-card rounded-full"><X className="w-6 h-6" /></button>
          </div>
          
          {/* Search with Mapbox Geocoding */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="h-5 w-5 text-gas-green animate-spin" /> : <Search className="h-5 w-5 text-gray-500" />}
            </div>
            <input type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => { if (searchQuery.length > 0 && searchQuery.length < 2) setShowQuick(true); }}
              placeholder="Cari tempat, alamat, kota..."
              className="w-full pl-10 pr-10 py-3 bg-gas-card border-2 border-gray-800 rounded-2xl text-white font-bold focus:border-gas-green outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowQuick(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {hasDropdown && (
            <div className="absolute left-6 right-6 bg-gas-dark border border-gray-800 rounded-2xl z-30 max-h-64 overflow-y-auto shadow-2xl">
              {/* Mapbox results */}
              {searchResults.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hasil Pencarian</div>
                  {searchResults.map((r, i) => (
                    <button key={`geo-${i}`} onClick={() => handleResultClick(r)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gas-card transition-colors text-left border-b border-white/[0.03] last:border-0">
                      <div className="w-8 h-8 bg-gas-green/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-gas-green" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-bold truncate">{r.shortName}</p>
                        <p className="text-gray-500 text-[10px] truncate">{r.name}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {/* Quick suggestions */}
              {showQuick && filteredQuick.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider border-t border-white/[0.04]">Rekomendasi</div>
                  {filteredQuick.map((s, i) => (
                    <button key={`q-${i}`} onClick={() => handleResultClick(s)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gas-card transition-colors text-left">
                      <div className="w-8 h-8 bg-gas-orange/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-gas-orange" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-bold">{s.name}</p>
                        <p className="text-gray-500 text-[10px]">{s.category}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 mx-4 rounded-2xl overflow-hidden border-2 border-gray-800">
          <Map
            ref={mapRef}
            initialViewState={viewport}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />
            {marker && (
              <Marker latitude={marker.lat} longitude={marker.lng} anchor="bottom">
                <div className="relative">
                  <div className="w-8 h-8 bg-gas-orange rounded-full flex items-center justify-center border-3 border-white shadow-lg animate-bounce">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gas-orange rotate-45" />
                </div>
              </Marker>
            )}
          </Map>
        </div>

        {/* Selected location + confirm */}
        <div className="p-4 shrink-0">
          {selectedName && (
            <div className="flex items-center gap-3 bg-gas-card rounded-xl p-3 mb-3">
              <MapPin className="w-5 h-5 text-gas-orange shrink-0" />
              <span className="text-white text-sm font-bold flex-1 truncate">{selectedName}</span>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleConfirm}
            disabled={!marker}
            className="w-full bg-gas-green text-gas-darker font-black text-lg py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Konfirmasi Lokasi
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationPicker;
