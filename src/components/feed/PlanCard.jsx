import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, MapPin, Clock, Users, Loader2, Bookmark, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ref, update, get, set as fbSet, remove as fbRemove, runTransaction } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToastStore } from '@/store/useToastStore';
import { pushNotification } from '@/utils/notifications';
import { VIBE_EMOJI } from '@/lib/constants';

/**
 * PlanCard — renders a single plan card in the feed with join, like, comment, save, share.
 * @param {{ plan: Object, currentUser: Object }} props
 */
const PlanCard = ({ plan, currentUser }) => {
  const [likesArr, setLikesArr] = useState(plan.likes || []);
  const [saved, setSaved] = useState(false);
  const [participants, setParticipants] = useState(plan.participants || []);
  const [joining, setJoining] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [planComments, setPlanComments] = useState(plan.commentsList || []);

  const liked = currentUser && likesArr.includes(currentUser.uid);
  const isJoined = currentUser && participants.includes(currentUser.uid);

  const handlePlanComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    const newComment = { userId: currentUser.uid, userName: currentUser.displayName || 'User', userAvatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=U`, text: commentText.trim(), createdAt: Date.now() };
    const updated = [...planComments, newComment];
    setPlanComments(updated); setCommentText('');
    await update(ref(db, `plans/${plan.id}`), { commentsList: updated });
    if (plan.creatorId && plan.creatorId !== currentUser.uid) {
      pushNotification(plan.creatorId, {
        type: 'comment', fromName: currentUser.displayName || 'Seseorang',
        fromAvatar: currentUser.photoURL || '', text: `berkomentar di plan "${plan.title}": "${commentText.trim().slice(0, 40)}"`,
        link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
      });
    }
    useToastStore.getState().addToast('Komentar terkirim! 💬', 'success');
  };

  useEffect(() => {
    if (currentUser && plan.id) {
      get(ref(db, `users/${currentUser.uid}/savedPlans/${plan.id}`)).then(s => setSaved(s.exists())).catch(() => {});
    }
  }, [currentUser, plan.id]);

  const handleLike = async () => {
    if (!currentUser) return;
    const currentlyLiked = likesArr.includes(currentUser.uid);
    const newLikes = currentlyLiked ? likesArr.filter(uid => uid !== currentUser.uid) : [...likesArr, currentUser.uid];
    setLikesArr(newLikes);
    await update(ref(db, `plans/${plan.id}`), { likes: newLikes });
    if (!currentlyLiked && plan.creatorId && plan.creatorId !== currentUser.uid) {
      pushNotification(plan.creatorId, {
        type: 'like', fromName: currentUser.displayName || 'Seseorang',
        fromAvatar: currentUser.photoURL || '', text: `menyukai plan "${plan.title}" ❤️`,
        link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
      });
    }
  };

  const handleJoinFromFeed = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      useToastStore.getState().addToast('Login dulu untuk ikutan! 🔑', 'error');
      return;
    }
    setJoining(true);
    try {
      await runTransaction(ref(db, `plans/${plan.id}`), (currentPlan) => {
        if (currentPlan) {
          if (!currentPlan.participants) currentPlan.participants = [];
          const idx = currentPlan.participants.indexOf(currentUser.uid);
          if (idx >= 0) {
            currentPlan.participants.splice(idx, 1);
          } else {
            currentPlan.participants.push(currentUser.uid);
          }
        }
        return currentPlan;
      });
      if (isJoined) {
        setParticipants(participants.filter(uid => uid !== currentUser.uid));
        useToastStore.getState().addToast('Keluar dari plan', 'info');
      } else {
        setParticipants([...participants, currentUser.uid]);
        useToastStore.getState().addToast('Berhasil ikutan! 🚀', 'success');
        if (plan.creatorId && plan.creatorId !== currentUser.uid) {
          pushNotification(plan.creatorId, {
            type: 'join', fromName: currentUser.displayName || 'Seseorang',
            fromAvatar: currentUser.photoURL || '', text: `bergabung ke plan "${plan.title}"`,
            link: `/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`,
          });
        }
      }
    } catch (err) {
      console.error('Join error:', err);
      useToastStore.getState().addToast('Gagal, coba lagi', 'error');
    } finally {
      setJoining(false);
    }
  };

  const vibeEmoji = VIBE_EMOJI[plan.vibe] || '✨';
  const coverImg = plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4 rounded-3xl overflow-hidden border border-white/[0.04] bg-gas-card/40">
      <div className="flex items-center gap-3 p-4 pb-2">
        <Link to={`/${plan.creatorUsername || 'u'}`}>
          <img src={plan.creatorAvatar || `https://ui-avatars.com/api/?name=${plan.creatorName}`} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gas-orange/50 hover:ring-gas-orange transition-all" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/${plan.creatorUsername || 'u'}`} className="font-bold text-white text-sm hover:text-gas-green transition-colors">{plan.creatorName}</Link>
          {plan.creatorUsername && <span className="text-[10px] text-gray-600 ml-1.5">@{plan.creatorUsername}</span>}
          <div className="flex items-center text-[11px] text-gray-500 gap-1"><MapPin className="w-3 h-3 text-gas-orange" /><span className="truncate">{plan.location}</span></div>
        </div>
        <span className="text-[10px] bg-gas-orange/20 text-gas-orange px-2 py-0.5 rounded-full font-bold">{vibeEmoji} PLAN</span>
      </div>

      <Link to={`/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`}>
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img src={coverImg} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <h4 className="font-black text-xl text-white drop-shadow-md leading-tight">{plan.title}</h4>
            {plan.description && <p className="text-gray-300 text-xs mt-1 line-clamp-2">{plan.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-[11px] bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-gas-green font-bold"><Clock className="w-3 h-3" />{plan.date} • {plan.time}</span>
              <span className="flex items-center gap-1 text-[11px] bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-gas-green font-bold"><Users className="w-3 h-3" />{participants.length}/{plan.maxParticipants}</span>
            </div>
          </div>
        </div>
      </Link>

      {plan.tags && plan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {plan.tags.map(t => <span key={t} className="text-[10px] bg-gas-green/10 text-gas-green px-2 py-0.5 rounded-full font-bold">{t}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex items-center gap-1.5">
            <Heart className={`w-5 h-5 transition-colors ${liked ? 'text-gas-orange fill-gas-orange' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-gray-400">{likesArr.length}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5">
            <MessageCircle className={`w-5 h-5 transition-colors ${showComments ? 'text-blue-400' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-gray-400">{planComments.length}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={async () => {
            if (!currentUser) return;
            const sRef = ref(db, `users/${currentUser.uid}/savedPlans/${plan.id}`);
            if (saved) { await fbRemove(sRef); setSaved(false); useToastStore.getState().addToast('Dihapus dari koleksi', 'info'); }
            else { await fbSet(sRef, true); setSaved(true); useToastStore.getState().addToast('Plan disimpan! 📖', 'success'); }
          }}>
            <Bookmark className={`w-5 h-5 transition-colors ${saved ? 'text-gas-green fill-gas-green' : 'text-gray-400'}`} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={async () => {
            const shareUrl = `${window.location.origin}/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`;
            const shareData = { title: plan.title, text: `${plan.title} — ${plan.location}`, url: shareUrl };
            if (navigator.share) { try { await navigator.share(shareData); } catch (err) { console.debug('Navigator share skipped or cancelled:', err); } }
            else { await navigator.clipboard.writeText(shareUrl); useToastStore.getState().addToast('Link disalin! 📋', 'success'); }
          }}>
            <Share2 className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleJoinFromFeed}
          disabled={joining}
          className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
            isJoined
              ? 'bg-gas-card border border-gray-700 text-white hover:border-red-500/30'
              : 'bg-gas-green/10 text-gas-green hover:bg-gas-green/20'
          }`}
        >
          {joining ? <Loader2 className="w-3 h-3 animate-spin" /> : isJoined ? 'Joined ✓' : 'Ikutan 🚀'}
        </motion.button>
      </div>

      {/* Inline Comments */}
      <AnimatePresence>{showComments && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
          <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
            {planComments.length === 0 && <p className="text-xs text-gray-600 text-center py-2">Belum ada komentar. Jadi yang pertama! 💬</p>}
            {planComments.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <img src={c.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white">{c.userName}</span>
                  <span className="text-xs text-gray-400 ml-2">{c.text}</span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handlePlanComment} className="px-4 pb-3 flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Tulis komentar..." className="flex-1 bg-gas-darker border border-gray-800 rounded-full px-3 py-2 text-xs text-white outline-none focus:border-gas-green" />
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="p-2 bg-gas-green rounded-full text-gas-darker"><Send className="w-3 h-3" /></motion.button>
          </form>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
};

export default PlanCard;
