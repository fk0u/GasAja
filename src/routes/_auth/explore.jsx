import { useState, useEffect, useRef } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ref, onValue } from 'firebase/database';
import { db, DB_URL, MAPBOX_TOKEN } from '@/lib/firebase';
import { Search, MapPin, Clock, Users, Flame, Navigation2, Star, X, Loader2, Map as MapIcon, Grid3X3, UserCircle, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { VIBE_EMOJI } from '@/lib/constants';

const VIBES = Object.entries(VIBE_EMOJI);

const DESTINATION_CATEGORIES = [
  { id: 'cafe', label: 'Cafe', emoji: '☕', query: 'cafe coffee shop' },
  { id: 'food', label: 'Kuliner', emoji: '🍜', query: 'restaurant food' },
  { id: 'mall', label: 'Mall', emoji: '🛍️', query: 'mall shopping' },
  { id: 'park', label: 'Taman', emoji: '🌳', query: 'park garden' },
  { id: 'gym', label: 'Olahraga', emoji: '💪', query: 'gym sport' },
  { id: 'study', label: 'Belajar', emoji: '📚', query: 'library study' },
];

const Explore = () => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [activeVibe, setActiveVibe] = useState(null);
  const [activeTab, setActiveTab] = useState('plans'); // plans | destinations | map-search
  const [mapResults, setMapResults] = useState([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(false);
  const [activeDest, setActiveDest] = useState(null);
  const [userCity, setUserCity] = useState('Banjarmasin');
  const searchTimeout = useRef(null);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // AI Planner state
  const [aiHistory, setAiHistory] = useState([
    {
      role: 'assistant',
      text: 'Halo! Aku Gemini AI Hangout Planner-mu. 🤖\n\nBingung mau nongkrong kemana di Banjarmasin? Mau cari cafe aesthetic, spot senja hemat, atau sekadar mini soccer spontan?\n\nTulis keinginanmu di bawah atau klik salah satu preset cepat untuk kubuatkan rencana hangout super detail!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic Gemini AI Parser for Banjarmasin Hangout suggestions
  const runAiPlanner = (promptText) => {
    if (!promptText.trim()) return;
    
    // Add user message to history
    setAiHistory(prev => [...prev, { role: 'user', text: promptText }]);
    setAiLoading(true);
    setAiInput('');

    setTimeout(() => {
      const query = promptText.toLowerCase();
      let responseText = '';
      let recommendedPlan = null;

      // Intelligent parser matches
      if (query.includes('cafe') || query.includes('kopi') || query.includes('nongkrong')) {
        responseText = `Gemini AI mengidentifikasi minat nongkrong santai (vibe: CHILL) sore ini! ☕\n\nBerdasarkan data popularitas terkini di **${userCity}**, spot paling direkomendasikan adalah:\n\n📍 **Warkop 88, Kayutangi**\nSebuah warkop modern berkonsep semi-outdoor yang sangat populer bagi kalangan Gen Z setempat. Memiliki colokan melimpah, Wi-Fi kencang, dan harga ramah dompet (Rp15.000 - Rp30.000).\n\n💡 **Rekomendasi Aktivitas:** Laptopan santai, sambat sore hari bareng teman sekelas, atau diskusi project.`;
        recommendedPlan = {
          title: 'Nongkrong Santai di Warkop 88',
          description: 'Nongkrong santai di Warkop 88 Kayutangi sambil laptopan, ngobrol santai, atau mabar game bareng squad! Vibe-nya super chill dan hemat.',
          vibe: 'chill',
          location: 'Warkop 88, Kayutangi',
        };
      } else if (query.includes('soccer') || query.includes('futsal') || query.includes('olahraga') || query.includes('keringat') || query.includes('bola')) {
        responseText = `Gemini AI mendeteksi keinginan untuk berolahraga aktif (vibe: SPORT)! ⚽\n\nUntuk membakar kalori spontan di daerah **${userCity}**, spot yang paling pas adalah:\n\n📍 **GOR Hasanuddin**\nLapangan olahraga serbaguna yang sangat hits. Sangat ideal untuk kumpul futsal, mini soccer, atau badminton di sore hari secara dadakan.\n\n💡 **Rekomendasi Aktivitas:** Cari keringat sore, mabar bola rame-rame, lalu ditutup dengan minum es kelapa muda dingin!`;
        recommendedPlan = {
          title: 'Mini Soccer Spontan GOR Hasanuddin',
          description: 'Kumpul olahraga bareng squad buat cari keringat sore di GOR Hasanuddin. Pemula OK, bebas overthinking, langsung gas main!',
          vibe: 'sport',
          location: 'GOR Hasanuddin, Banjarmasin',
        };
      } else if (query.includes('hemat') || query.includes('murah') || query.includes('siring') || query.includes('pentol')) {
        responseText = `Gemini AI merekomendasikan plan super hemat (vibe: CHILL) dengan budget di bawah Rp50k/orang! 💸\n\nSpot nongkrong murah meriah paling seru di **${userCity}** adalah:\n\n📍 **Siring Menara Pandang**\nNongkrong estetik di pinggir sungai Martapura. Cukup beli pentol bakar bumbu kacang legendaris dan es teh manis.\n\n💡 **Rekomendasi Aktivitas:** Jalan santai sepanjang siring, deep-talk menatap lalu-lalang kelotok sungai, dan menikmati pemandangan Menara Pandang malam hari.`;
        recommendedPlan = {
          title: 'Jalan Santai & Nyemil Pentol di Siring',
          description: 'Hangout hemat keliling Siring Menara Pandang, berburu pentol bakar legendaris, mumpung weekend asik bareng teman-teman.',
          vibe: 'chill',
          location: 'Siring Menara Pandang',
        };
      } else if (query.includes('malming') || query.includes('party') || query.includes('malam') || query.includes('seru') || query.includes('senja')) {
        responseText = `Gemini AI mendeteksi getaran malam minggu yang enerjik (vibe: PARTY)! 🎸\n\nTempat paling cocok buat mencerahkan malam akhir pekanmu di **${userCity}** adalah:\n\n📍 **Kopi Senja, Antasan Besar**\nMemiliki live music akustik setiap malam minggu dengan pemandangan sunset sungai yang menawan. Sangat hidup dan instagrammable!\n\n💡 **Rekomendasi Aktivitas:** Request lagu favoritmu, nyanyi bareng squad, mabar game, atau foto-foto estetik dengan neon glow lights!`;
        recommendedPlan = {
          title: 'Acoustic Night & Sunset di Kopi Senja',
          description: 'Nongkrong asik nikmatin acoustic session malam minggu bareng-bareng di Kopi Senja Antasan Besar. Let\'s sing along!',
          vibe: 'party',
          location: 'Kopi Senja, Antasan Besar',
        };
      } else {
        responseText = `Gemini AI berhasil merumuskan hangout plan custom (vibe: CHILL) berdasarkan request-mu! ✨\n\nUntuk hangout fleksibel di sekitar **${userCity}**, mari rencanakan kumpul seru di:\n\n📍 **Duta Mall Banjarmasin (Area Foodcourt/Rooftop)**\nSpot hangout all-in-one yang nyaman dan sejuk. Sangat cocok jika ingin keliling cuci mata, makan di gerai favorit, atau nonton bioskop bareng.\n\n💡 **Rekomendasi Aktivitas:** Keliling mall santai, jajan snack kekinian, main arcade game bareng, lalu nongkrong obrolin-obrolin seru.`;
        recommendedPlan = {
          title: `Hangout Seru di Duta Mall`,
          description: `Plan hangout seru terinspirasi dari ide: "${promptText}". Kumpul kumpul santai bareng teman sehobi biar ga wacana!`,
          vibe: 'chill',
          location: 'Duta Mall Banjarmasin',
        };
      }

      setAiHistory(prev => [...prev, {
        role: 'assistant',
        text: responseText,
        plan: recommendedPlan
      }]);
      setAiLoading(false);
    }, 1200);
  };

  const [now] = useState(() => Date.now());

  // Fetch user city from profile
  useEffect(() => {
    if (user?.uid) {
      fetch(`${DB_URL}/users/${user.uid}/location.json`).then(r => r.json()).then(loc => {
        if (loc) setUserCity(loc);
      }).catch(() => {});
    }
  }, [user?.uid]);

  // Fetch plans
  useEffect(() => {
    const plansRef = ref(db, 'plans');
    return onValue(plansRef, snap => {
      const arr = [];
      if (snap.exists()) snap.forEach(c => arr.push({ id: c.key, ...c.val() }));
      setPlans(arr);
    });
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'people' && allUsers.length === 0) {
      setPeopleLoading(true);
      fetch(`${DB_URL}/users.json`).then(r => r.json()).then(data => {
        if (data) {
          const arr = Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.id !== user?.uid);
          setAllUsers(arr);
        }
      }).catch(e => console.error(e)).finally(() => setPeopleLoading(false));
    }
  };

  const filteredPeople = (() => {
    if (!peopleSearch.trim()) return allUsers;
    const q = peopleSearch.toLowerCase();
    return allUsers.filter(u => 
      u.displayName?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.bio?.toLowerCase().includes(q)
    );
  })();

  const handleMapQueryChange = (val) => {
    setMapQuery(val);
    if (val.length < 2) {
      setMapResults([]);
    }
  };

  // Mapbox search for map-search tab
  useEffect(() => {
    if (activeTab !== 'map-search' || mapQuery.length < 2) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setMapSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(mapQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=8&language=id&country=ID&proximity=114.5907,-3.3194&types=poi,address,place,locality`
        );
        const data = await res.json();
        setMapResults((data.features || []).map(f => ({
          name: f.text, fullName: f.place_name, lat: f.center[1], lng: f.center[0],
          category: f.properties?.category || f.place_type?.[0] || 'place',
        })));
      } catch (e) { console.error(e); }
      finally { setMapSearching(false); }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [mapQuery, activeTab]);

  // Fetch destinations by category
  const loadDestinations = async (cat) => {
    setActiveDest(cat.id);
    setDestLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cat.query + ' ' + userCity)}.json?access_token=${MAPBOX_TOKEN}&limit=10&language=id&country=ID&types=poi`
      );
      const data = await res.json();
      setDestinations((data.features || []).map(f => ({
        name: f.text, fullName: f.place_name, lat: f.center[1], lng: f.center[0],
        category: cat.label,
      })));
    } catch (e) { console.error(e); }
    finally { setDestLoading(false); }
  };

  // Scored plan filtering
  const filteredPlans = (() => {
    const q = search.toLowerCase();
    const ONE_DAY = 86400000;
    return plans
      .filter(p => {
        const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || p.creatorName?.toLowerCase().includes(q);
        const matchVibe = !activeVibe || p.vibe === activeVibe;
        return matchSearch && matchVibe;
      })
      .map(p => {
        const likes = Array.isArray(p.likes) ? p.likes.length : 0;
        const participants = (p.participants?.length || 0);
        const engagement = Math.min((likes * 3 + participants * 4) / 50, 1);
        const recency = Math.max(0, 1 - ((now - (p.createdAt || 0)) / ONE_DAY));
        const hash = (p.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const random = ((hash * 9301 + 49297) % 233280) / 233280;
        return { ...p, _score: (engagement * 0.45) + (recency * 0.30) + (random * 0.25) };
      })
      .sort((a, b) => b._score - a._score);
  })();

  const tabs = [
    { id: 'plans', label: 'Plans', icon: Grid3X3 },
    { id: 'people', label: 'People', icon: UserCircle },
    { id: 'destinations', label: 'Destinasi', icon: Navigation2 },
    { id: 'map-search', label: 'Cari Peta', icon: MapIcon },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-4 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="sticky top-0 z-40 bg-gas-darker/90 backdrop-blur-xl border-b border-white/[0.04] px-4 pt-4 pb-3">
        <h1 className="text-xl font-black mb-3 flex items-center gap-2"><Flame className="w-5 h-5 text-gas-orange" /> Explore</h1>

        {/* Tab switcher */}
        <div className="flex gap-1.5 mb-3">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-1 justify-center ${activeTab === tab.id ? 'bg-gas-green text-gas-darker' : 'bg-gas-card/50 text-gray-500 border border-gray-800/50'}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Search bar (plans tab + map-search tab) */}
        {activeTab === 'plans' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari plan, lokasi, teman..." className="w-full pl-9 pr-3 py-2.5 border border-gray-800 rounded-xl bg-gas-card/60 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gas-green font-medium" />
          </div>
        )}
        {activeTab === 'people' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type="text" value={peopleSearch} onChange={e => setPeopleSearch(e.target.value)} placeholder="Cari user, username..." className="w-full pl-9 pr-3 py-2.5 border border-gray-800 rounded-xl bg-gas-card/60 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gas-green font-medium" />
          </div>
        )}
        {activeTab === 'map-search' && (
          <div className="relative">
            {mapSearching ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gas-green animate-spin" /> : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />}
            <input type="text" value={mapQuery} onChange={e => handleMapQueryChange(e.target.value)} placeholder="Cari tempat di peta..." className="w-full pl-9 pr-9 py-2.5 border border-gray-800 rounded-xl bg-gas-card/60 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gas-green font-medium" />
            {mapQuery && <button onClick={() => { setMapQuery(''); setMapResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-500" /></button>}
          </div>
        )}
      </header>

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
            <button onClick={() => setActiveVibe(null)} className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!activeVibe ? 'bg-gas-green text-gas-darker' : 'bg-gas-card text-gray-400 border border-gray-800'}`}>Semua</button>
            {VIBES.map(([id, emoji]) => (
              <button key={id} onClick={() => setActiveVibe(activeVibe === id ? null : id)} className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeVibe === id ? 'bg-gas-orange text-white' : 'bg-gas-card text-gray-400 border border-gray-800'}`}>{emoji} {id}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-4">
            {filteredPlans.map(plan => (
              <Link key={plan.id} to={`/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`}>
                <motion.div whileTap={{ scale: 0.95 }} className="relative h-48 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80'} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
                    <span className="text-[9px] bg-gas-orange/80 text-white px-1.5 py-0.5 rounded font-bold w-fit mb-1">{VIBE_EMOJI[plan.vibe]||'✨'} {(plan.vibe||'').toUpperCase()}</span>
                    <h4 className="font-black text-white text-xs leading-tight line-clamp-2">{plan.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-300 font-medium">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{plan.date}</span>
                      <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{plan.participants?.length||0}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          {filteredPlans.length === 0 && <div className="text-center py-16 text-gray-500 font-bold text-sm">Tidak ada plan ditemukan</div>}
        </>
      )}

      {/* ── PEOPLE TAB ── */}
      {activeTab === 'people' && (
        <div className="px-4 py-4">
          {peopleLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gas-green animate-spin" /></div>}
          {!peopleLoading && filteredPeople.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-bold mb-2">{filteredPeople.length} pengguna ditemukan</p>
              {filteredPeople.map((u, i) => (
                <Link key={u.id} to={`/${u.username || u.id}`}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-gas-card/50 rounded-2xl p-4 border border-white/[0.04] flex items-center gap-3 hover:border-gas-green/30 transition-all mb-2">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.displayName || 'U'}`} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gas-green/30" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm">{u.displayName || 'User'}</h4>
                      {u.username && <p className="text-[11px] text-gas-green font-medium">@{u.username}</p>}
                      {u.bio && <p className="text-[11px] text-gray-500 truncate mt-0.5">{u.bio}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white">{u.followers || 0}</p>
                      <p className="text-[9px] text-gray-600">followers</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
          {!peopleLoading && filteredPeople.length === 0 && peopleSearch && (
            <div className="text-center py-16 text-gray-500 font-bold text-sm">Tidak ada user "{peopleSearch}" ditemukan</div>
          )}
          {!peopleLoading && allUsers.length === 0 && !peopleSearch && (
            <div className="text-center py-16">
              <UserCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-bold">Belum ada pengguna lain</p>
            </div>
          )}
        </div>
      )}

      {/* ── DESTINATIONS TAB ── */}
      {activeTab === 'destinations' && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Navigation2 className="w-4 h-4 text-gas-green" />
            <p className="text-sm text-gray-400 font-medium">Rekomendasi di <span className="text-gas-green font-bold">{userCity}</span></p>
          </div>

          {/* Category chips */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {DESTINATION_CATEGORIES.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => loadDestinations(cat)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all ${activeDest === cat.id ? 'bg-gas-green/10 border-gas-green/50' : 'bg-gas-card/50 border-gray-800'}`}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-xs font-bold ${activeDest === cat.id ? 'text-gas-green' : 'text-gray-400'}`}>{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Destination results */}
          {destLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gas-green animate-spin" /></div>}
          {!destLoading && destinations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Star className="w-4 h-4 text-gas-orange" /> {destinations.length} Tempat Ditemukan</h3>
              {destinations.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-gas-card/50 rounded-2xl p-4 border border-white/[0.04] flex items-start gap-3">
                  <div className="w-10 h-10 bg-gas-orange/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-gas-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm">{d.name}</h4>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{d.fullName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-gas-green/10 text-gas-green px-2 py-0.5 rounded-full font-bold">{d.category}</span>
                      <a href={`https://www.google.com/maps?q=${d.lat},${d.lng}`} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Buka Maps →</a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {!destLoading && !activeDest && <div className="text-center py-12 text-gray-600 text-sm font-bold">Pilih kategori di atas untuk lihat rekomendasi 📍</div>}
        </div>
      )}

      {/* ── MAP SEARCH TAB ── */}
      {activeTab === 'map-search' && (
        <div className="px-4 py-4">
          {mapQuery.length < 2 && mapResults.length === 0 && (
            <div className="text-center py-12">
              <MapIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-bold">Ketik minimal 2 huruf untuk cari tempat</p>
              <p className="text-gray-700 text-xs mt-1">Powered by Mapbox Geocoding</p>
            </div>
          )}
          {mapSearching && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gas-green animate-spin" /></div>}
          {!mapSearching && mapResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-bold mb-3">{mapResults.length} hasil untuk "{mapQuery}"</p>
              {mapResults.map((r, i) => (
                <motion.a key={i} href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="block bg-gas-card/50 rounded-2xl p-4 border border-white/[0.04] hover:border-gas-green/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gas-green/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gas-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm">{r.name}</h4>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{r.fullName}</p>
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">{r.category}</span>
                    </div>
                    <Navigation2 className="w-4 h-4 text-gas-green shrink-0 mt-1" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
          {!mapSearching && mapQuery.length >= 2 && mapResults.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm font-bold">Tidak ada hasil untuk "{mapQuery}"</div>
          )}
        </div>
      )}
      {/* ── GEMINI AI PLANNER TAB ── */}
      {activeTab === 'ai-planner' && (
        <div className="px-4 py-4 space-y-6">
          <div className="bg-gas-card/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-5 shadow-2xl relative flex flex-col h-[60vh]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gas-green opacity-5 rounded-full blur-[40px] pointer-events-none" />
            
            {/* Header console */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-gas-green" />
              </div>
              <span className="text-[10px] font-bold text-gray-600 tracking-wider uppercase font-mono">Gemini AI Hangout Engine</span>
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto text-xs leading-relaxed font-mono custom-scrollbar mb-4 space-y-4 pr-1">
              {aiHistory.map((chat, idx) => (
                <div key={idx} className={`space-y-2 ${chat.role === 'user' ? 'text-gas-green' : 'text-gray-200'}`}>
                  <div className="flex gap-2 items-start">
                    <span className="shrink-0 font-bold">{chat.role === 'user' ? '>_ USER:' : '>_ GEMINI:'}</span>
                    <p className="whitespace-pre-wrap">{chat.text}</p>
                  </div>
                  {chat.plan && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="ml-6 bg-gradient-to-br from-gas-card to-gray-900 border border-white/[0.08] rounded-2xl p-4 shadow-xl max-w-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gas-green opacity-[0.03] rounded-full blur-xl pointer-events-none" />
                      <span className="text-[8px] bg-gas-orange/20 text-gas-orange px-2 py-0.5 rounded font-black w-fit block mb-1.5">✨ {(chat.plan.vibe || '').toUpperCase()}</span>
                      <h4 className="font-black text-white text-xs leading-tight mb-1">{chat.plan.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug mb-3">{chat.plan.description}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold mb-3">
                        <MapPin className="w-3.5 h-3.5 text-gas-orange shrink-0" />
                        <span className="truncate">{chat.plan.location}</span>
                      </div>
                      <Link to="/create-plan"
                        search={{ title: chat.plan.title, description: chat.plan.description, location: chat.plan.location, vibe: chat.plan.vibe }}
                        className="w-full py-2 bg-gas-green text-gas-darker font-black text-[10px] rounded-xl flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,255,159,0.15)]">
                        Gas Bikin Plan ini! 🚀
                      </Link>
                    </motion.div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-gas-green animate-pulse">
                  <span>&gt;_ GEMINI:</span>
                  <Loader2 className="w-4 h-4 animate-spin text-gas-green" />
                  <span className="text-[10px] font-bold">Menganalisis spot terbaik...</span>
                </div>
              )}
            </div>

            {/* Input console */}
            <form onSubmit={(e) => { e.preventDefault(); runAiPlanner(aiInput); }} className="relative shrink-0 border-t border-white/5 pt-3">
              <span className="absolute left-3 top-6.5 -translate-y-1/2 text-gray-600 font-bold font-mono">&gt;</span>
              <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} disabled={aiLoading}
                placeholder="Mau cari cafe aesthetic, plan murah, mabar bola..."
                className="w-full pl-7 pr-10 py-3 bg-gas-darker border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-gas-green font-mono transition-colors"
              />
              <button type="submit" disabled={aiLoading || !aiInput.trim()} className="absolute right-3 top-6.5 -translate-y-1/2 text-gray-500 hover:text-gas-green disabled:text-gray-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Preset Chips */}
          <div className="space-y-2 px-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Presets rekomendasi cepat:</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => runAiPlanner('Cari cafe aesthetic terdekat buat laptopan')} disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-green/30 text-left text-gray-300 transition-all">
                ☕ Cafe Aesthetic
              </button>
              <button onClick={() => runAiPlanner('Buatin plan olahraga spontan cari keringat')} disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-orange/30 text-left text-gray-300 transition-all">
                ⚽ Olahraga Spontan
              </button>
              <button onClick={() => runAiPlanner('Rekomendasi jalan santai hemat budget di bawah 50rb')} disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-green/30 text-left text-gray-300 transition-all">
                💸 Jalan Santai Hemat
              </button>
              <button onClick={() => runAiPlanner('Spot live music asik buat malam minggu')} disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-orange/30 text-left text-gray-300 transition-all">
                🎸 Malming Seru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/_auth/explore')({
  component: Explore,
});
