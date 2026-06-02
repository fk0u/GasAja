import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, RefreshCw, TrendingUp, Flame, MapPin, MessageCircle, ArrowRight, Zap, Sparkles, Navigation, Heart, Calendar, Clock, Users, Shield, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router';
import { ref, onValue } from 'firebase/database';
import { db, DB_URL } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { useCacheStore } from '@/store/useCacheStore';
import StoryViewer from '@/components/ui/StoryViewer';
import PostCard from '@/components/feed/PostCard';
import PlanCard from '@/components/feed/PlanCard';
import TrendingPlanCard from '@/components/feed/TrendingPlanCard';

// ----------------------------------------------------
// AUTHENTICATED VIEW (HOME FEED)
// ----------------------------------------------------
const HomeFeed = () => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyStartIndex, setStoryStartIndex] = useState(0);

  const [now] = useState(() => Date.now());

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [plansRes, postsRes, usersRes, storiesRes] = await Promise.all([
        fetch(`${DB_URL}/plans.json`).then(r => r.json()),
        fetch(`${DB_URL}/posts.json`).then(r => r.json()),
        fetch(`${DB_URL}/users.json`).then(r => r.json()),
        fetch(`${DB_URL}/stories.json`).then(r => r.json()),
      ]);
      const plansArr = plansRes ? Object.entries(plansRes).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.createdAt||0) - (a.createdAt||0)) : [];
      const postsArr = postsRes ? Object.entries(postsRes).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.createdAt||0) - (a.createdAt||0)) : [];
      const usersArr = usersRes ? Object.entries(usersRes).map(([id, val]) => ({ id, ...val })) : [];
      const storiesArr = storiesRes ? Object.entries(storiesRes).map(([id, val]) => ({ id, ...val })).filter(s => s.expiresAt > Date.now()) : [];
      setPlans(plansArr);
      setPosts(postsArr);
      setActiveUsers(usersArr);
      setStories(storiesArr.sort((a, b) => (b.createdAt||0) - (a.createdAt||0)));
      useToastStore.getState().addToast('Feed diperbarui! ✨', 'success');
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      const cachedPlans = useCacheStore.getState().getPlans();
      const cachedPosts = useCacheStore.getState().getPosts();

      if (cachedPlans) {
        setPlans(cachedPlans);
        setLoading(false);
      }
      if (cachedPosts) {
        setPosts(cachedPosts);
        setLoading(false);
      }

      try {
        const [plansRes, postsRes, usersRes, storiesRes] = await Promise.all([
          fetch(`${DB_URL}/plans.json`).then(r => r.json()),
          fetch(`${DB_URL}/posts.json`).then(r => r.json()),
          fetch(`${DB_URL}/users.json`).then(r => r.json()),
          fetch(`${DB_URL}/stories.json`).then(r => r.json()),
        ]);

        const plansArr = plansRes ? Object.entries(plansRes).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.createdAt||0) - (a.createdAt||0)) : [];
        setPlans(plansArr);
        useCacheStore.getState().setPlans(plansArr);

        const postsArr = postsRes ? Object.entries(postsRes).map(([id, val]) => ({ id, ...val })).sort((a, b) => (b.createdAt||0) - (a.createdAt||0)) : [];
        setPosts(postsArr);
        useCacheStore.getState().setPosts(postsArr);

        const usersArr = usersRes ? Object.entries(usersRes).map(([id, val]) => ({ id, ...val })) : [];
        setActiveUsers(usersArr);

        const storiesArr = storiesRes ? Object.entries(storiesRes)
          .map(([id, val]) => ({ id, ...val }))
          .filter(s => s.expiresAt > Date.now()) : [];
        setStories(storiesArr.sort((a, b) => (b.createdAt||0) - (a.createdAt||0)));

      } catch (e) {
        console.error('[GasAja] Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const plansRef = ref(db, 'plans');
    const postsRef = ref(db, 'posts');
    const storiesRef = ref(db, 'stories');

    const cleanups = [
      onValue(plansRef, (snap) => {
        const arr = [];
        if (snap.exists()) snap.forEach(c => arr.push({ id: c.key, ...c.val() }));
        if (arr.length > 1) {
          setPlans(arr.sort((a, b) => (b.createdAt||0) - (a.createdAt||0)));
        }
      }),
      onValue(postsRef, (snap) => {
        const arr = [];
        if (snap.exists()) snap.forEach(c => arr.push({ id: c.key, ...c.val() }));
        if (arr.length > 1) {
          setPosts(arr.sort((a, b) => (b.createdAt||0) - (a.createdAt||0)));
        }
      }),
      onValue(storiesRef, (snap) => {
        const arr = [];
        if (snap.exists()) snap.forEach(c => {
          const s = c.val();
          if (s.expiresAt > Date.now()) arr.push({ id: c.key, ...s });
        });
        if (arr.length > 0) setStories(arr.sort((a, b) => (b.createdAt||0) - (a.createdAt||0)));
      })
    ];

    return () => {
      cleanups.forEach(unsub => unsub());
    };
  }, []);

  const filtered = (items, type) => items.filter(item => {
    const q = searchQuery.toLowerCase();
    if (type === 'plan') return (item.title?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q) || item.creatorName?.toLowerCase().includes(q));
    return (item.content?.toLowerCase().includes(q) || item.userName?.toLowerCase().includes(q));
  });

  const openStory = (i) => { setStoryStartIndex(i); setStoryViewerOpen(true); };
  const trendingPlans = [...plans].sort((a, b) => (b.likes?.length||0) - (a.likes?.length||0)).slice(0, 5);

  const scoredFeed = (() => {
    const ONE_DAY = 86400000;
    const raw = [
      ...filtered(plans, 'plan').map(p => ({ ...p, _type: 'plan' })),
      ...filtered(posts, 'post').map(p => ({ ...p, _type: 'post' }))
    ];

    const scored = raw.map(item => {
      const likes = Array.isArray(item.likes) ? item.likes.length : 0;
      const comments = (item.comments?.length || item.commentsList?.length || 0);
      const participants = (item.participants?.length || 0);
      const engagement = Math.min((likes * 3 + comments * 5 + participants * 4) / 50, 1);

      const age = now - (item.createdAt || 0);
      const recency = Math.max(0, 1 - (age / ONE_DAY));

      const hasMedia = (item.coverImage || item.image) ? 0.15 : 0;

      const hash = (item.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const random = ((hash * 9301 + 49297) % 233280) / 233280;

      const score = (engagement * 0.40) + (recency * 0.35) + (hasMedia * 0.15) + (random * 0.10);
      return { ...item, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);

    const interleaved = [];
    const planQueue = scored.filter(i => i._type === 'plan');
    const postQueue = scored.filter(i => i._type === 'post');
    let pi = 0, po = 0, consecutiveSame = 0, lastType = null;

    while (pi < planQueue.length || po < postQueue.length) {
      let next;
      const planNext = pi < planQueue.length ? planQueue[pi] : null;
      const postNext = po < postQueue.length ? postQueue[po] : null;

      if (!planNext) { next = postNext; po++; }
      else if (!postNext) { next = planNext; pi++; }
      else if (consecutiveSame >= 2 && lastType === 'plan') { next = postNext; po++; }
      else if (consecutiveSame >= 2 && lastType === 'post') { next = planNext; pi++; }
      else if (planNext._score >= postNext._score) { next = planNext; pi++; }
      else { next = postNext; po++; }

      if (next._type === lastType) consecutiveSame++;
      else consecutiveSame = 1;
      lastType = next._type;
      interleaved.push(next);
    }

    return interleaved;
  })();

  const allFeed = scoredFeed;

  const tabs = [
    { id: 'all', label: 'For You', icon: Flame },
    { id: 'plans', label: 'Plans', icon: MapPin },
    { id: 'posts', label: 'Posts', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-4 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gas-darker/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-2xl font-black italic tracking-tighter md:hidden">Gas<span className="text-gas-green">Aja!</span></h1>
          <h1 className="hidden md:block text-xl font-black">🏠 Beranda</h1>
          <div className="flex gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="w-9 h-9 rounded-xl bg-gas-card flex items-center justify-center border border-gray-800 hover:border-gas-green/30 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin text-gas-green' : ''}`} />
            </button>
            <Link to="/create-post" className="w-9 h-9 rounded-xl bg-gas-card flex items-center justify-center border border-gray-800">
              <Plus className="text-gas-green w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type="text" className="w-full pl-9 pr-3 py-2.5 border border-gray-800 rounded-xl bg-gas-card/60 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gas-green transition-colors font-medium" placeholder="Cari plan, post, teman..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </header>

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide">
        <Link to="/create-story" className="flex flex-col items-center gap-1 min-w-[64px]">
          <div className="w-[60px] h-[60px] rounded-full bg-gas-card flex items-center justify-center border-2 border-dashed border-gas-green/50">
            <Plus className="text-gas-green w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-500">Story</span>
        </Link>
        {stories.map((story, idx) => (
          <button key={story.id} onClick={() => openStory(idx)} className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-gas-orange to-gas-green">
              <img src={story.userAvatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-gas-darker" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 truncate w-14 text-center">{story.userName.split(' ')[0]}</span>
          </button>
        ))}
        {activeUsers.filter(u => !stories.find(s => s.userId === u.id)).slice(0, 4).map(u => (
          <div key={u.id} className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gray-800">
              <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.displayName}`} alt="" className="w-full h-full rounded-full object-cover border-2 border-gas-darker" />
            </div>
            <span className="text-[10px] font-bold text-gray-600 truncate w-14 text-center">{(u.displayName||'').split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Trending Plans Carousel */}
      {!searchQuery && trendingPlans.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-black text-white flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-gas-orange" /> Trending Plans</h2>
            <Link to="/explore" className="text-xs text-gas-green font-bold">Lihat Semua</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scrollbar-hide pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {trendingPlans.map(p => <TrendingPlanCard key={p.id} plan={p} />)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-gas-green text-gas-darker shadow-[0_0_12px_rgba(0,255,159,0.2)]' : 'bg-gas-card/50 text-gray-500 border border-gray-800/50'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gas-green" /></div>
      ) : (
        <div className="md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-4 md:px-4">
          {activeTab === 'all' && allFeed.map(item => (
            item._type === 'plan'
              ? <PlanCard key={`plan-${item.id}`} plan={item} currentUser={user} />
              : <PostCard key={`post-${item.id}`} post={item} currentUser={user} />
          ))}
          {activeTab === 'plans' && filtered(plans, 'plan').map(plan => <PlanCard key={plan.id} plan={plan} currentUser={user} />)}
          {activeTab === 'posts' && filtered(posts, 'post').map(post => <PostCard key={post.id} post={post} currentUser={user} />)}

          {/* End of feed */}
          {!loading && ((activeTab === 'all' && allFeed.length > 0) || (activeTab === 'plans' && filtered(plans, 'plan').length > 0) || (activeTab === 'posts' && filtered(posts, 'post').length > 0)) && (
            <div className="text-center py-10 px-4 w-full col-span-full">
              <p className="text-gray-600 text-sm font-bold">Kamu sudah lihat semuanya! 🎉</p>
              <Link to="/create-plan" className="inline-block mt-3 text-xs font-bold text-gas-green bg-gas-green/10 px-5 py-2 rounded-full">Buat Plan Baru</Link>
            </div>
          )}
          {((activeTab === 'all' && allFeed.length === 0) || (activeTab === 'plans' && filtered(plans, 'plan').length === 0) || (activeTab === 'posts' && filtered(posts, 'post').length === 0)) && (
            <div className="text-center py-16 text-gray-500 font-bold col-span-full">Belum ada konten. Yuk bikin yang pertama! 🚀</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {storyViewerOpen && stories.length > 0 && (
          <StoryViewer stories={stories} initialIndex={storyStartIndex} onClose={() => setStoryViewerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};


// ----------------------------------------------------
// PUBLIC VIEW (ADVANCED LANDING PAGE)
// ----------------------------------------------------
const MOCK_WIZARD_DATA = {
  chill: {
    title: '☕ Kopi Santai Sore',
    desc: 'Nongkrong rileks sambil laptopan atau ngobrol asik bareng temen di cafe aesthetic.',
    cover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    tags: ['Gratis', 'Indoor', 'Bawa Laptop'],
    vibe: 'CHILL'
  },
  party: {
    title: '🎉 Malming Party Gas',
    desc: 'Malmingan seru bareng-bareng! Denger musik keras, nyanyi bareng, and high energy vibe!',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
    tags: ['18+', 'Weekend', 'BYOB'],
    vibe: 'PARTY'
  },
  sport: {
    title: '⚽ Mini Soccer Spontan',
    desc: 'Cari keringat sore-sore! Langsung kumpul di lapangan futsal, seru-seruan tanpa overthinking.',
    cover: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    tags: ['Outdoor', 'Pemula OK', 'Gratis'],
    vibe: 'SPORT'
  }
};

const MOCK_AI_RESPONSES = {
  cafe: `✨ **Rekomendasi Cafe Aesthetic di Banjarmasin** ✨

Berikut spot hangout paling *aesthetic* buat akhir pekanmu:

1. **Warkop 88, Kayutangi** ☕
   - *Vibe:* Cozy, chill, ada live music mini di malam hari.
   - *Budget:* Sangat ramah kantong (Rp15k - Rp35k).
   - *Gas Rating:* ⭐ 4.8/5 (Selalu ramai Gen Z).

2. **Kopi Senja, Antasan Besar** 🌇
   - *Vibe:* Spot sunset terbaik pinggir sungai, super instagrammable.
   - *Budget:* Sedang (Rp20k - Rp45k).
   - *Tags:* [Outdoor] [Senja]`,
  spontan: `🚀 **Rencana Malming Spontan Keren** 🚀

Jangan cuma mager di kamar! Ini plan instan buat malam ini:

- **19.30** — Kumpul di *Siring Menara Pandang* buat jajan pentol bakar dan liat kelap-kelip sungai. 🍢
- **21.00** — Geser ke *Kopi Senja* buat acoustic session dan deep talk sampai larut. 🎶
- **Estimasi Biaya:** Cukup Rp40k aja udah kenyang dan dapet foto estetik!`,
  budget: `💸 **Plan Hangout Berempat - Budget Hemat (Total 200rb)** 💸

Main seru bareng squad tanpa bikin dompet nangis (50rb/orang):

1. **Destinasi:** *Taman Kamboja* (Gratis masuk, luas buat ngobrol/main gitar). 🌳
2. **Konsumsi:** Jajan es kelapa muda + gorengan hangat di sekitar taman (Rp25k/orang). 🥥
3. **Aktivitas:** Bikin konten TikTok bareng atau main kartu Uno (Rp0).
4. **Sisa Budget:** Rp25k bisa ditabung atau buat patungan bensin!`
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [wizardVibe, setWizardVibe] = useState('chill');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [aiOutput, setAiOutput] = useState('Pilih salah satu prompt di atas untuk menguji kecerdasan Gemini AI... 🤖');
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [mockLikes, setMockLikes] = useState(88);
  const [mockLiked, setMockLiked] = useState(false);

  const handleDoubleTap = () => {
    if (!mockLiked) {
      setMockLikes(prev => prev + 1);
      setMockLiked(true);
    }
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 800);
  };

  const handleLikeClick = () => {
    if (mockLiked) {
      setMockLikes(prev => prev - 1);
      setMockLiked(false);
    } else {
      setMockLikes(prev => prev + 1);
      setMockLiked(true);
    }
  };

  const runAiDemo = (key, text) => {
    setAiPrompt(text);
    setAiTyping(true);
    setAiOutput('');
    let index = 0;
    const response = MOCK_AI_RESPONSES[key];
    
    const interval = setInterval(() => {
      if (index < response.length) {
        setAiOutput(prev => prev + response.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, 15);
  };

  return (
    <div className="min-h-screen bg-gas-darker text-white overflow-hidden relative font-sans">
      {/* Dynamic Grid Overlay & Glow Blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,159,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-gas-green opacity-[0.08] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-gas-orange opacity-[0.08] rounded-full blur-[150px] pointer-events-none" />

      {/* ─── NAVBAR ─── */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-gas-green animate-pulse" />
          <span className="text-2xl font-black italic tracking-tighter">Gas<span className="text-gas-green">Aja!</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate({ to: '/login' })} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gas-card text-gray-300 border border-gray-800 hover:border-gas-green/30 transition-all">
            Login
          </button>
          <button onClick={() => navigate({ to: '/login' })} className="px-5 py-2.5 rounded-xl text-xs font-black bg-gas-green text-gas-darker shadow-[0_0_20px_rgba(0,255,159,0.3)] hover:brightness-110 active:scale-95 transition-all">
            Daftar Kuy!
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gas-green/10 border border-gas-green/20 rounded-full text-gas-green text-xs font-bold uppercase tracking-wider animate-bounce w-fit mx-auto lg:mx-0">
            <Sparkles className="w-3.5 h-3.5" /> Hangout Planning Revolution
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7.5xl font-black leading-[1.05] tracking-tight">
            Dari <span className="text-gray-600">"Mau kemana ges?"</span><br />
            Jadi <span className="text-gradient">GasAja! 🚀</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Platform hangout & sosial Gen Z yang bikin koordinasi ngumpul secepat kirim meme. Spontan, terorganisir, dan penuh vibe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <button onClick={() => navigate({ to: '/login' })} className="px-8 py-5 rounded-2xl font-black text-lg bg-gas-green text-gas-darker flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,159,0.4)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,255,159,0.6)] active:scale-95 transition-all">
              Mulai Gas Sekarang <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#features" className="px-8 py-5 rounded-2xl font-bold text-lg bg-gas-card text-white border-2 border-gray-800 hover:border-gray-600 flex items-center justify-center transition-all">
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Floating Preview Bento Cards */}
        <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] w-full flex items-center justify-center">
          {/* Card 1: Vibe Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -5, x: -60, y: -60 }}
            whileHover={{ y: -80, scale: 1.05, rotate: -2, zIndex: 30 }}
            className="absolute bg-gas-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl w-60 z-10 cursor-pointer"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl">☕</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black">CHILL</span>
            </div>
            <h4 className="font-black text-white text-sm">Deep Talk & Chill Kopi</h4>
            <p className="text-gray-500 text-[11px] mt-1 line-clamp-2">Ngobrolin masa depan atau sekadar sambat santai.</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400 font-bold">
              <Users className="w-3.5 h-3.5 text-gas-green" /> <span>5/8 orang ikut</span>
            </div>
          </motion.div>

          {/* Card 2: Main mockup card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            whileHover={{ y: -15, scale: 1.03, zIndex: 30 }}
            className="absolute bg-gradient-to-br from-gas-card to-gray-900 border border-white/[0.08] rounded-3xl p-6 shadow-2xl w-68 sm:w-76 z-20 cursor-pointer"
          >
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent flex flex-col justify-end p-3">
                <span className="text-[9px] bg-gas-orange text-white px-2 py-0.5 rounded font-black w-fit mb-1">🎉 PARTY</span>
                <h4 className="font-black text-white text-sm">Malming Karaoke Gas!</h4>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 font-bold mb-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gas-orange" /> Kayutangi</span>
              <span className="text-gas-green">2 Slot Sisa!</span>
            </div>
            <div className="flex -space-x-2 overflow-hidden mb-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://ui-avatars.com/api/?name=${i}&background=random`} alt="" className="inline-block h-7 w-7 rounded-full ring-2 ring-gas-darker" />
              ))}
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white ring-2 ring-gas-darker">+2</div>
            </div>
            <button onClick={() => navigate({ to: '/login' })} className="w-full py-2.5 bg-gas-green text-gas-darker font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition-all">
              GAS IKUTAN! 🚀
            </button>
          </motion.div>

          {/* Card 3: Small user card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 6, x: 80, y: 70 }}
            whileHover={{ y: 50, scale: 1.05, rotate: 2, zIndex: 30 }}
            className="absolute bg-gas-card/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl w-48 z-10 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <img src="https://ui-avatars.com/api/?name=Budi&background=00FF9F&color=0a0a0a" alt="" className="w-7 h-7 rounded-full object-cover" />
              <div>
                <h5 className="font-black text-white text-xs">Budi_Gas</h5>
                <span className="text-[8px] text-gray-500 font-semibold">12 mins ago</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-300 leading-tight">"Akhirnya ga wacana lagi, langsung gas malming ini gokil!"</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE BENTO GRID ─── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.04]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black italic">Advanced Features</h2>
          <p className="text-gray-400 text-sm md:text-base font-medium">Bukan sekadar aplikasi wacana. GasAja! menghadirkan bento box penuh interaksi mutakhir.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Cell 1: Mock Phone Scroll Feed */}
          <div className="md:col-span-7 bento-card relative overflow-hidden flex flex-col justify-between group min-h-[380px]">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gas-green opacity-10 rounded-full blur-[60px]" />
            <div className="max-w-md">
              <span className="text-2xl">📱</span>
              <h3 className="text-xl font-black text-white mt-3">Interactive Social Feed</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">Rasakan keseruan sosmed hybrid. Bikin story instan 24 jam, post momen hangout dengan double-tap ledakan jantung, and direct plan binding.</p>
            </div>
            
            {/* Interactive Phone Frame Mock */}
            <div className="mt-6 mx-auto w-full max-w-[280px] bg-gas-darker border-4 border-gray-800 rounded-t-3xl overflow-hidden relative aspect-[9/10] shadow-2xl">
              <AnimatePresence>
                {doubleTapHeart && (
                  <motion.div initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1.3 }} exit={{ opacity: 0, scale: 2 }} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <Heart className="w-20 h-20 text-gas-orange fill-gas-orange drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-2 p-3 pb-1.5" onDoubleClick={handleDoubleTap}>
                <img src="https://ui-avatars.com/api/?name=Budi&background=random" alt="" className="w-7 h-7 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white leading-none">budi_gas</p>
                  <span className="text-[8px] text-gray-500">Baru saja</span>
                </div>
                <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black">POST</span>
              </div>
              <p className="px-3 text-[9px] text-gray-300 mb-2">Akhirnya nyobain warkop baru ini. Aesthetic parah gass! ☕</p>
              
              <div className="w-full aspect-[4/3] bg-gray-900 relative cursor-pointer overflow-hidden" onDoubleClick={handleDoubleTap}>
                <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="text-[10px] bg-black/60 px-2 py-1 rounded text-white font-bold pointer-events-none">Double Tap Me! ❤️</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 px-3 py-2">
                <button onClick={handleLikeClick} className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 transition-colors ${mockLiked ? 'text-gas-orange fill-gas-orange' : 'text-gray-400'}`} />
                  <span className="text-[9px] font-bold text-gray-400">{mockLikes}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400">12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Hangout Planner Wizard */}
          <div className="md:col-span-5 bento-card relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gas-orange opacity-10 rounded-full blur-[50px]" />
            <div>
              <span className="text-2xl">📅</span>
              <h3 className="text-xl font-black text-white mt-3">Plan Creator Wizard</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">Bikin plan semudah chatting. Klik tombol vibe di bawah untuk melihat cover, vibe tag, dan detail plan ter-render dinamis!</p>
            </div>
            
            {/* Interactive Live Card Creator Demo */}
            <div className="my-5 p-2 bg-gas-darker border border-gray-800/80 rounded-2xl relative shadow-lg">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                <img src={MOCK_WIZARD_DATA[wizardVibe].cover} alt="" className="w-full h-full object-cover transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-3">
                  <span className="text-[8px] bg-gas-orange text-white px-2 py-0.5 rounded font-black w-fit mb-1">✨ {MOCK_WIZARD_DATA[wizardVibe].vibe}</span>
                  <h4 className="font-black text-white text-xs leading-none transition-all">{MOCK_WIZARD_DATA[wizardVibe].title}</h4>
                  <p className="text-gray-400 text-[9px] line-clamp-1 mt-1">{MOCK_WIZARD_DATA[wizardVibe].desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {MOCK_WIZARD_DATA[wizardVibe].tags.map(t => (
                  <span key={t} className="text-[8px] bg-gas-card px-2 py-0.5 rounded text-gas-green font-bold">{t}</span>
                ))}
              </div>
            </div>

            {/* Vibe Selection Chips */}
            <div className="flex gap-2">
              {['chill', 'party', 'sport'].map(v => (
                <button key={v} onClick={() => setWizardVibe(v)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${wizardVibe === v ? 'bg-gas-orange text-white shadow-lg' : 'bg-gas-card text-gray-500 border border-gray-800/60'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Bento Cell 3: Mapbox Pulse Location */}
          <div className="md:col-span-5 bento-card relative overflow-hidden flex flex-col justify-between min-h-[350px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,159,0.06),transparent)]" />
            <div>
              <span className="text-2xl">📍</span>
              <h3 className="text-xl font-black text-white mt-3">Geotargeting & Location Radar</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">Cari rekomendasi terdekat di Banjarmasin otomatis. Cukup check-in saat kumpul dan langsung post foto hangout-mu terikat ke peta.</p>
            </div>
            
            {/* Live Map Radar Sweep Animation */}
            <div className="my-6 mx-auto w-40 h-40 bg-gas-darker border-2 border-gray-800 rounded-full relative flex items-center justify-center overflow-hidden shadow-2xl">
              {/* Concentric rings */}
              <div className="absolute inset-2 border border-gray-800/60 rounded-full" />
              <div className="absolute inset-8 border border-gray-800/40 rounded-full" />
              <div className="absolute inset-16 border border-gray-800/20 rounded-full" />
              
              {/* Pulse Radar Line */}
              <div className="absolute w-[200px] h-[200px] bg-gradient-to-tr from-gas-green/0 via-gas-green/10 to-gas-green/40 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '4s', originX: 'center', originY: 'center' }} />
              
              {/* Map pins */}
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-8 left-8"><MapPin className="w-5 h-5 text-gas-orange drop-shadow-[0_0_8px_rgba(255,77,0,0.5)]" /></motion.div>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="absolute bottom-10 right-8"><MapPin className="w-5 h-5 text-gas-green drop-shadow-[0_0_8px_rgba(0,255,159,0.5)]" /></motion.div>
              <div className="absolute w-4 h-4 bg-gas-green rounded-full border-3 border-gas-darker shadow-2xl" />
            </div>
            
            <p className="text-[10px] text-gray-500 font-bold text-center tracking-wider uppercase">Near Kayutangi & Duta Mall</p>
          </div>

          {/* Bento Cell 4: Google Calendar & Reminders */}
          <div className="md:col-span-7 bento-card relative overflow-hidden flex flex-col justify-between min-h-[350px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
            <div>
              <span className="text-2xl">🔔</span>
              <h3 className="text-xl font-black text-white mt-3">Smart Reminder & Google Calendar</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">Sinkronisasi instan ke Google Calendar dengan sekali klik. Nikmati pengingat pintar otomatis (1 hari & 2 jam sebelum acara) agar ga ada lagi squad yang ketiduran!</p>
            </div>
            
            {/* Calendar UI Mock */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gas-darker border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Google Calendar</span>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                </div>
                <h4 className="font-black text-sm text-white leading-tight">Sync Status: Active ✅</h4>
                <p className="text-[10px] text-gray-500 mt-1">Acara otomatis masuk kalender Google semua peserta yang join.</p>
              </div>
              <div className="bg-gas-darker border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Reminders</span>
                  <div className="w-2.5 h-2.5 bg-gas-green rounded-full animate-ping" />
                </div>
                <h4 className="font-black text-sm text-white leading-tight">"Gas! 2 Jam Lagi Acara Dimulai"</h4>
                <p className="text-[10px] text-gray-500 mt-1">Smart notification dikirim langsung ke smartphone kamu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE GEMINI AI SANDBOX ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gas-orange/10 border border-gas-orange/20 rounded-full text-gas-orange text-xs font-bold uppercase tracking-wider w-fit">
              <Shield className="w-3.5 h-3.5" /> Intelligent AI Engine
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic leading-none">Gemini AI Recommendation</h2>
            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
              Bingung mau nongkrong kemana? Gemini AI terintegrasi siap mencarikan cafe, event akhir pekan, hingga menyusun rancangan hangout spontan sesuai budget dan vibe-mu secara cerdas.
            </p>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coba Demo Klik:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => runAiDemo('cafe', 'Rekomendasi cafe aesthetic di Banjarmasin')} disabled={aiTyping}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-green/30 text-left transition-all">
                  ☕ Cafe Aesthetic
                </button>
                <button onClick={() => runAiDemo('spontan', 'Buatin plan malming spontan keren')} disabled={aiTyping}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-orange/30 text-left transition-all">
                  ⚡ Malming Spontan
                </button>
                <button onClick={() => runAiDemo('budget', 'Hangout berempat budget hemat total 200rb')} disabled={aiTyping}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gas-card border border-gray-800 hover:border-gas-green/30 text-left transition-all">
                  💸 Patungan Hemat
                </button>
              </div>
            </div>
          </div>

          {/* Interactive AI Terminal Console */}
          <div className="lg:col-span-7 bg-gas-card/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 shadow-2xl relative min-h-[350px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gas-green opacity-5 rounded-full blur-[50px] pointer-events-none" />
            
            {/* Header console */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-gas-green" />
              </div>
              <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">Gemini AI Sandbox</span>
            </div>

            {/* Content console */}
            <div className="flex-1 overflow-y-auto text-xs text-gray-300 leading-relaxed font-mono custom-scrollbar mb-4 space-y-4">
              {aiPrompt && (
                <div className="flex gap-2 items-start text-gas-green">
                  <span className="shrink-0 font-bold">&gt;_ PROMPT:</span>
                  <p className="font-bold">{aiPrompt}</p>
                </div>
              )}
              <div className="whitespace-pre-line text-gray-200">
                {aiOutput}
              </div>
            </div>

            {/* Input console */}
            <div className="relative shrink-0 border-t border-white/5 pt-4">
              <span className="absolute left-3 top-7 -translate-y-1/2 text-gray-600 font-bold">&gt;</span>
              <input type="text" readOnly placeholder="Silakan klik prompt rekomendasi di sebelah kiri..." className="w-full pl-7 pr-10 py-3 bg-gas-darker border border-gray-800 rounded-xl text-xs text-white outline-none cursor-not-allowed font-mono" />
              <button disabled className="absolute right-3 top-7 -translate-y-1/2 text-gray-600"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF & STATS ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.04]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bento-card py-8">
            <h4 className="text-4xl md:text-5xl font-black text-white italic">10K+</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Hangouts Created</p>
          </div>
          <div className="bento-card py-8">
            <h4 className="text-4xl md:text-5xl font-black text-white italic">25K+</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Active Users</p>
          </div>
          <div className="bento-card py-8">
            <h4 className="text-4xl md:text-5xl font-black text-white italic">150+</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Neon Spots</p>
          </div>
          <div className="bento-card py-8">
            <h4 className="text-4xl md:text-5xl font-black text-white italic">99.8%</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Success Rate</p>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CALL TO ACTION ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-gas-card to-gray-900 border border-white/[0.08] rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-gas-green/5 via-gas-orange/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">Udah siap buat hang out tanpa ribet?</h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Buat akunmu sekarang gratis dan mulailah merencanakan nongkrong seru bersama squad terbaikmu!</p>
            <div className="pt-4">
              <button onClick={() => navigate({ to: '/login' })} className="px-8 py-5 rounded-2xl font-black text-lg bg-gas-green text-gas-darker flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,159,0.4)] hover:shadow-[0_0_40px_rgba(0,255,159,0.7)] active:scale-95 transition-all mx-auto">
                Daftar Kuy, Gratis! 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.04] text-center text-xs text-gray-600 font-bold space-y-4">
        <div className="flex justify-center items-center gap-2">
          <Flame className="w-5 h-5 text-gas-green" />
          <span className="text-sm font-black italic tracking-tighter text-white">Gas<span className="text-gas-green">Aja!</span></span>
        </div>
        <p>© 2026 GasAja! Team • Made with 💚 and lots of vibes for Gen Z Indonesia</p>
      </footer>
    </div>
  );
};


// ----------------------------------------------------
// DYNAMIC ROUTE ENTRY POINT
// ----------------------------------------------------
const RouteEntry = () => {
  const { user } = useAuthStore();
  
  if (user) {
    return <HomeFeed />;
  }
  return <LandingPage />;
};

export const Route = createFileRoute('/')({
  component: RouteEntry,
});
