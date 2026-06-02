import { useState, useEffect } from 'react';
import { db, DB_URL } from '@/lib/firebase';
import { ref, get, runTransaction, update, set, remove } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Calendar, MapPin, Share2, Loader2, Edit3, X, Send, MessageCircle, Heart, Tag, Bookmark, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';
import { pushNotification } from '@/utils/notifications';
import { Link, useNavigate, useParams, createFileRoute } from '@tanstack/react-router';

export const PlanDetail = () => {
  const { id, slug } = useParams({ strict: false });
  const planIdentifier = slug || id; // prefer slug, fallback to legacy id
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const [plan, setPlan] = useState(null);
  const [planKey, setPlanKey] = useState(null); // actual Firebase key
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({ title: '', date: '', time: '', location: '', vibe: 'chill' });
  const [commentText, setCommentText] = useState('');
  const [planComments, setPlanComments] = useState([]);
  const [likesArr, setLikesArr] = useState([]);
  const [saved, setSaved] = useState(false);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const liked = user && likesArr.includes(user.uid);

  // Check if current user follows the plan creator
  useEffect(() => {
    if (!user || !plan || !plan.creatorId || plan.creatorId === user.uid) return;
    get(ref(db, `users/${user.uid}/followingList/${plan.creatorId}`))
      .then(snap => setIsFollowingCreator(snap.exists()))
      .catch(() => {});
  }, [user, plan]);

  // Check if plan is saved
  useEffect(() => {
    if (!user || !planKey) return;
    get(ref(db, `users/${user.uid}/savedPlans/${planKey}`))
      .then(snap => setSaved(snap.exists()))
      .catch(() => {});
  }, [user, planKey]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        let activePlan = null;
        let activeKey = null;

        // Strategy 1: Direct key lookup (legacy /plan/:id or slug IS the key)
        const planRef = ref(db, `plans/${planIdentifier}`);
        const snapshot = await get(planRef);

        if (snapshot.exists()) {
          activePlan = snapshot.val();
          activeKey = snapshot.key;
        } else {
          // Strategy 2: Lookup by slug field (for slug-based URLs)
          try {
            const slugRes = await fetch(`${DB_URL}/plans.json?orderBy="slug"&equalTo="${planIdentifier}"&limitToFirst=1`);
            const slugData = await slugRes.json();
            if (slugData && !slugData.error && Object.keys(slugData).length > 0) {
              const [key, val] = Object.entries(slugData)[0];
              activePlan = val;
              activeKey = key;
            } else {
              // Fallback: full scan (if index not configured)
              const allRes = await fetch(`${DB_URL}/plans.json`);
              const allData = await allRes.json();
              if (allData) {
                const match = Object.entries(allData).find(([, v]) => v.slug === planIdentifier);
                if (match) {
                  const [key, val] = match;
                  activePlan = val;
                  activeKey = key;
                }
              }
            }
          } catch {
            // Full scan fallback on network error
            const allRes = await fetch(`${DB_URL}/plans.json`);
            const allData = await allRes.json();
            if (allData) {
              const match = Object.entries(allData).find(([, v]) => v.slug === planIdentifier);
              if (match) {
                const [key, val] = match;
                activePlan = val;
                activeKey = key;
              }
            }
          }
        }

        if (activePlan) {
          const data = { id: activeKey, ...activePlan };
          setPlan(data);
          setPlanKey(activeKey);
          setPlanComments(data.commentsList || []);
          setLikesArr(data.likes || []);
          setEditData({
            title: data.title || '',
            date: data.date || '',
            time: data.time || '',
            location: data.location || '',
            vibe: data.vibe || 'chill'
          });
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planIdentifier]);

  const handleSave = async () => {
    if (!user) return addToast('Silakan login dulu!', 'error');
    const savedRef = ref(db, `users/${user.uid}/savedPlans/${plan.id}`);
    if (saved) {
      await remove(savedRef);
      setSaved(false);
      addToast('Plan dihapus dari koleksi', 'info');
    } else {
      await set(savedRef, true);
      setSaved(true);
      addToast('Plan disimpan! 🔖', 'success');
    }
  };

  const handleJoinLeave = async () => {
    if (!user) return addToast('Silakan login dulu!', 'error');
    if (!plan) return;

    const planRef = ref(db, `plans/${plan.id}`);

    try {
      await runTransaction(planRef, (currentPlan) => {
        if (currentPlan) {
          if (!currentPlan.participants) {
            currentPlan.participants = [];
          }
          const isJoined = currentPlan.participants.includes(user.uid);
          if (isJoined) {
            currentPlan.participants = currentPlan.participants.filter(uid => uid !== user.uid);
          } else {
            currentPlan.participants.push(user.uid);
          }
        }
        return currentPlan;
      });
      
      // Local state update
      const isJoinedLocally = plan.participants?.includes(user.uid);
      if (isJoinedLocally) {
        setPlan({ ...plan, participants: plan.participants.filter(uid => uid !== user.uid) });
        addToast('Kamu keluar dari plan ini', 'info');
      } else {
        setPlan({ ...plan, participants: [...(plan.participants || []), user.uid] });
        addToast('Berhasil bergabung! 🚀', 'success');
        if (plan.creatorId && plan.creatorId !== user.uid) {
          pushNotification(plan.creatorId, {
            type: 'join', fromName: user.displayName || 'Seseorang',
            fromAvatar: user.photoURL || '', text: `bergabung ke plan "${plan.title}"`,
            link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating participation:', error);
      addToast('Gagal update partisipasi', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gas-darker">
      <Loader2 className="w-10 h-10 animate-spin text-gas-green" />
    </div>
  );
  if (!plan) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gas-darker px-6 text-center">
      <div className="w-20 h-20 bg-gas-card rounded-full flex items-center justify-center border border-gray-800 mb-4">
        <MapPin className="w-8 h-8 text-gray-600" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Plan tidak ditemukan</h2>
      <p className="text-gray-500 text-sm mb-6">Mungkin plan ini sudah dihapus atau URL-nya salah.</p>
      <button onClick={() => navigate({ to: '/' })} className="px-6 py-3 bg-gas-green text-gas-darker font-bold rounded-2xl">
        Ke Beranda
      </button>
    </div>
  );

  const isJoined = user && plan.participants && plan.participants.includes(user.uid);
  const isCreator = user && plan.creatorId === user.uid;

  const handleDeletePlan = async () => {
    try {
      await remove(ref(db, `plans/${plan.id}`));
      addToast('Plan berhasil dihapus! 🗑️', 'success');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Error deleting plan:', error);
      addToast('Gagal menghapus plan', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const planRef = ref(db, `plans/${plan.id}`);
      await update(planRef, editData);
      setPlan({ ...plan, ...editData });
      setShowEditModal(false);
      addToast('Plan berhasil diperbarui! ✨', 'success');
    } catch (error) {
      console.error('Error updating plan:', error);
      addToast('Gagal memperbarui plan', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gas-darker pb-28 md:pb-8 md:px-0 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto relative">
      {/* Hero Image Section */}
      <div className="relative h-[40vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-gas-dark to-gas-darker z-0">
          <img src={plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&q=80'} alt="Cover" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gas-darker via-gas-darker/60 to-transparent z-10"></div>
        
        <header className="absolute top-0 w-full z-20 px-4 py-6 flex items-center justify-between">
          <button onClick={() => navigate({ to: -1 })} className="p-3 glass-card rounded-full text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {isCreator && (
              <>
                <button onClick={() => setShowEditModal(true)} className="p-3 bg-gas-orange rounded-full text-white shadow-lg">
                  <Edit3 className="w-6 h-6" />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-500/80 rounded-full text-white shadow-lg">
                  <Trash2 className="w-6 h-6" />
                </button>
              </>
            )}
            <button className="p-3 glass-card rounded-full text-white" onClick={async () => {
              const planUrl = `${window.location.origin}/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`;
              const shareData = { title: plan.title, text: `Yuk ikut plan "${plan.title}"!`, url: planUrl };
              if (navigator.share) { try { await navigator.share(shareData); } catch { /* ignore */ } }
              else { await navigator.clipboard.writeText(shareData.url); addToast('Link plan disalin! 📋', 'success'); }
            }}>
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="absolute bottom-0 w-full z-20 px-5 pb-6">
          <div className="inline-block px-4 py-1.5 bg-gas-green text-gas-darker font-black rounded-full shadow-lg transform -rotate-2 mb-3">
            {(plan.vibe || 'chill').toUpperCase()}
          </div>
          <h1 className="text-4xl font-black text-white leading-tight drop-shadow-lg">{plan.title}</h1>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-6 relative z-20">
        
        {/* Tags */}
        {plan.tags && plan.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {plan.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gas-green/10 border border-gas-green/30 text-gas-green text-xs font-bold rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}
        {/* Bento Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bento-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gas-darker flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gas-orange" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Tanggal</p>
              <p className="font-bold text-white text-sm">{plan.date}</p>
              <p className="font-bold text-gas-orange text-sm">{plan.time}</p>
            </div>
          </div>
          <div className="bento-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gas-darker flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gas-green" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Lokasi</p>
              <p className="font-bold text-white text-sm line-clamp-2">{plan.location}</p>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bento-card flex items-center justify-between">
          <Link to={`/${plan.creatorUsername || 'u'}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={plan.creatorAvatar} alt="Creator" className="w-12 h-12 rounded-full border-2 border-gray-600" />
            <div>
              <p className="text-xs font-bold text-gray-500">Dibuat oleh</p>
              <p className="font-bold text-white">{plan.creatorName}</p>
              {plan.creatorUsername && <p className="text-[11px] text-gas-green font-bold">@{plan.creatorUsername}</p>}
            </div>
          </Link>
          {user && plan.creatorId !== user.uid && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={followLoading}
              onClick={async () => {
                if (!user || !plan.creatorId) return;
                setFollowLoading(true);
                try {
                  if (isFollowingCreator) {
                    await remove(ref(db, `users/${user.uid}/followingList/${plan.creatorId}`));
                    await remove(ref(db, `users/${plan.creatorId}/followersList/${user.uid}`));
                    await runTransaction(ref(db, `users/${plan.creatorId}/followers`), c => Math.max((c||0)-1, 0));
                    await runTransaction(ref(db, `users/${user.uid}/following`), c => Math.max((c||0)-1, 0));
                    setIsFollowingCreator(false);
                    addToast(`Unfollow ${plan.creatorName}`, 'info');
                  } else {
                    await set(ref(db, `users/${user.uid}/followingList/${plan.creatorId}`), true);
                    await set(ref(db, `users/${plan.creatorId}/followersList/${user.uid}`), true);
                    await runTransaction(ref(db, `users/${plan.creatorId}/followers`), c => (c||0)+1);
                    await runTransaction(ref(db, `users/${user.uid}/following`), c => (c||0)+1);
                    setIsFollowingCreator(true);
                    addToast(`Mengikuti ${plan.creatorName} ✅`, 'success');
                    pushNotification(plan.creatorId, {
                      type: 'follow', fromName: user.displayName || 'Seseorang',
                      fromAvatar: user.photoURL || '', text: 'mulai mengikuti kamu 🎉',
                      link: '/',
                    });
                  }
                } catch (e) {
                  console.error('Follow error:', e);
                  addToast('Gagal, coba lagi', 'error');
                } finally { setFollowLoading(false); }
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${isFollowingCreator ? 'bg-gas-card border border-gray-700 text-white hover:border-red-500/50' : 'bg-gas-green text-gas-darker'}`}
            >
              {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowingCreator ? 'Mengikuti' : 'Follow'}
            </motion.button>
          )}
        </div>

        {/* Participants - Overlapping Avatars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-300 text-lg">Ikutan ({plan.participants.length})</h3>
            <span className="text-xs font-bold text-gas-green bg-gas-green/10 px-2 py-1 rounded-md">
              {plan.maxParticipants ? `${plan.maxParticipants - plan.participants.length} slot tersisa` : 'Unlimited'}
            </span>
          </div>
          <div className="flex items-center">
            {[...Array(Math.min(5, plan.participants.length))].map((_, i) => (
               <img 
                 key={i} 
                 src={`https://ui-avatars.com/api/?name=P&background=random`} 
                 alt="Participant" 
                 className={`w-14 h-14 rounded-full border-4 border-gas-darker object-cover ${i > 0 ? '-ml-4' : ''} relative z-[10]`} 
               />
            ))}
            {plan.participants.length > 5 && (
              <div className="w-14 h-14 rounded-full border-4 border-gas-darker bg-gas-card flex items-center justify-center -ml-4 relative z-0">
                <span className="text-sm font-bold text-white">+{plan.participants.length - 5}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {plan.description && (
          <div className="bento-card">
            <h3 className="font-bold text-gray-400 text-sm mb-2">Tentang Plan Ini</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{plan.description}</p>
          </div>
        )}

        {/* Like button */}
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.8 }} onClick={async () => {
            if (!user) return;
            const currentlyLiked = likesArr.includes(user.uid);
            const newLikes = currentlyLiked ? likesArr.filter(uid => uid !== user.uid) : [...likesArr, user.uid];
            setLikesArr(newLikes);
            await update(ref(db, `plans/${plan.id}`), { likes: newLikes });
            if (!currentlyLiked && plan.creatorId && plan.creatorId !== user.uid) {
              pushNotification(plan.creatorId, {
                type: 'like', fromName: user.displayName || 'Seseorang',
                fromAvatar: user.photoURL || '', text: `menyukai plan "${plan.title}" ❤️`,
                link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
              });
            }
          }} className="flex items-center gap-2 bento-card !p-3">
            <Heart className={`w-6 h-6 transition-colors ${liked ? 'text-gas-orange fill-gas-orange' : 'text-gray-400'}`} />
            <span className="font-bold text-white text-sm">{likesArr.length} suka</span>
          </motion.button>
          <div className="flex items-center gap-2 bento-card !p-3">
            <MessageCircle className="w-6 h-6 text-gray-400" />
            <span className="font-bold text-white text-sm">{planComments.length} komentar</span>
          </div>
          <motion.button whileTap={{ scale: 0.8 }} onClick={handleSave} className="flex items-center gap-2 bento-card !p-3 ml-auto">
            <Bookmark className={`w-6 h-6 transition-colors ${saved ? 'text-gas-green fill-gas-green' : 'text-gray-400'}`} />
          </motion.button>
        </div>

        {/* Comments */}
        <div>
          <h3 className="font-bold text-gray-300 text-lg mb-3">Komentar</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar mb-3">
            {planComments.length > 0 ? planComments.map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <img src={c.userAvatar} alt="" className="w-9 h-9 rounded-full object-cover mt-0.5" />
                <div className="flex-1 bg-gas-card rounded-2xl p-3">
                  <span className="text-xs font-bold text-white">{c.userName}</span>
                  <p className="text-sm text-gray-300 mt-0.5">{c.text}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">Belum ada komentar. Jadi yang pertama!</p>
            )}
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!commentText.trim() || !user) return;
            const newComment = { userId: user.uid, userName: user.displayName || 'User', userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`, text: commentText.trim(), createdAt: Date.now() };
            const updated = [...planComments, newComment];
            setPlanComments(updated);
            setCommentText('');
            await update(ref(db, `plans/${plan.id}`), { commentsList: updated });
            addToast('Komentar terkirim!', 'success');
            if (plan.creatorId && plan.creatorId !== user.uid) {
              pushNotification(plan.creatorId, {
                type: 'comment', fromName: user.displayName || 'Seseorang',
                fromAvatar: user.photoURL || '', text: `berkomentar di plan "${plan.title}"`,
                link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
              });
            }
          }} className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Tulis komentar..." className="flex-1 bg-gas-card border border-gray-800 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-gas-green" />
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="p-2.5 bg-gas-green rounded-full text-gas-darker"><Send className="w-4 h-4" /></motion.button>
          </form>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-40">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJoinLeave}
          className={`w-full font-black text-xl py-5 rounded-3xl transition-all shadow-[0_6px_0_0_rgba(0,0,0,0.5)] flex justify-center items-center gap-2 ${
            isJoined 
              ? 'bg-gas-card text-white border-2 border-gray-700' 
              : 'bg-gas-green text-gas-darker border-4 border-gas-green shadow-[0_6px_0_0_#00c077,0_0_30px_rgba(0,255,159,0.3)]'
          }`}
        >
          {isJoined ? 'Batal Ikut 😔' : 'GAS IKUTAN! 🚀'}
        </motion.button>
      </div>

      {/* Edit Plan Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gas-darker border-t border-gray-800 rounded-t-[40px] p-6 pb-12 w-full max-w-xl mx-auto flex flex-col h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 shrink-0" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white">Edit Plan</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 bg-gas-card rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Judul Plan</label>
                  <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal</label>
                    <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Jam</label>
                    <input type="time" value={editData.time} onChange={e => setEditData({...editData, time: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Lokasi</label>
                  <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Vibe</label>
                  <select value={editData.vibe} onChange={e => setEditData({...editData, vibe: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none">
                    <option value="chill">Chill</option>
                    <option value="party">Party</option>
                    <option value="sport">Sport</option>
                    <option value="study">Study</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.95 }} className="w-full bg-gas-orange text-white font-black text-xl py-4 rounded-2xl mt-6">
                  Simpan Perubahan
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-gas-darker border border-red-500/20 rounded-3xl p-6 w-[85%] max-w-sm"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-2">Hapus Plan Ini?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">Plan "{plan.title}" akan dihapus permanen dan tidak bisa dikembalikan.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gas-card rounded-xl font-bold text-white hover:bg-gas-card/80 transition-colors">Batal</button>
                <button onClick={handleDeletePlan} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 transition-colors">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Route = createFileRoute('/_auth/$username/$slug')({
  component: PlanDetail,
});
