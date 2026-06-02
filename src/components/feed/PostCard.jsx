import { useState } from 'react';
import { Heart, MessageCircle, Send, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToastStore } from '@/store/useToastStore';
import { pushNotification } from '@/utils/notifications';
import { timeAgo } from '@/utils/timeago';

/**
 * PostCard — renders a single social media post with like, comment, share.
 * @param {{ post: Object, currentUser: Object }} props
 */
const PostCard = ({ post, currentUser }) => {
  const [likesArr, setLikesArr] = useState(post.likes || []);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const liked = currentUser && likesArr.includes(currentUser.uid);

  const handleLike = async () => {
    if (!currentUser) return;
    const currentlyLiked = likesArr.includes(currentUser.uid);
    const newLikes = currentlyLiked ? likesArr.filter(uid => uid !== currentUser.uid) : [...likesArr, currentUser.uid];
    setLikesArr(newLikes);
    await update(ref(db, `posts/${post.id}`), { likes: newLikes });
    if (!currentlyLiked && post.userId && post.userId !== currentUser.uid) {
      pushNotification(post.userId, {
        type: 'like', fromName: currentUser.displayName || 'Seseorang',
        fromAvatar: currentUser.photoURL || '', text: 'menyukai post kamu ❤️',
        link: '/',
      });
    }
  };

  const handleDoubleTap = () => {
    if (!currentUser) return;
    const currentlyLiked = likesArr.includes(currentUser.uid);
    if (!currentlyLiked) {
      const newLikes = [...likesArr, currentUser.uid];
      setLikesArr(newLikes);
      update(ref(db, `posts/${post.id}`), { likes: newLikes });
    }
    setShowHeart(true); setTimeout(() => setShowHeart(false), 800);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    const newComment = { userId: currentUser.uid, userName: currentUser.displayName || 'User', userAvatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=U`, text: commentText.trim(), createdAt: Date.now() };
    const updated = [...comments, newComment];
    setComments(updated); setCommentText('');
    await update(ref(db, `posts/${post.id}`), { comments: updated });
    if (post.userId && post.userId !== currentUser.uid) {
      pushNotification(post.userId, {
        type: 'comment', fromName: currentUser.displayName || 'Seseorang',
        fromAvatar: currentUser.photoURL || '', text: `berkomentar: "${commentText.trim().slice(0, 40)}"`,
        link: '/',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gas-card/40 rounded-3xl mx-4 mb-4 overflow-hidden border border-white/[0.04]">
      <AnimatePresence>{showHeart && (
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.5 }} exit={{ opacity: 0, scale: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Heart className="w-28 h-28 text-gas-orange fill-gas-orange drop-shadow-2xl" />
        </motion.div>
      )}</AnimatePresence>

      <div className="flex items-center gap-3 p-4 pb-2">
        <Link to={`/${post.username || 'u'}`}>
          <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gas-green/50 hover:ring-gas-green transition-all" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/${post.username || 'u'}`} className="font-bold text-white text-sm hover:text-gas-green transition-colors">{post.userName}</Link>
          {post.username && <span className="text-[10px] text-gray-600 ml-1.5">@{post.username}</span>}
          <div><span className="text-[11px] text-gray-500 font-medium">{timeAgo(post.createdAt)} lalu</span></div>
        </div>
        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">POST</span>
      </div>

      <p className="px-4 text-gray-200 text-[13px] mb-3 leading-relaxed">{post.content}</p>

      {post.image && (
        <div className="w-full aspect-[4/5] overflow-hidden relative" onDoubleClick={handleDoubleTap}>
          <img src={post.image} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex items-center gap-5 px-4 py-3">
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex items-center gap-1.5">
          <Heart className={`w-5 h-5 transition-colors ${liked ? 'text-gas-orange fill-gas-orange' : 'text-gray-400'}`} />
          <span className="text-xs font-bold text-gray-400">{likesArr.length}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-bold text-gray-400">{comments.length}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.8 }} className="ml-auto" onClick={async () => {
          const shareData = { title: `Post by ${post.userName}`, text: post.content?.slice(0, 100), url: window.location.origin };
          if (navigator.share) { try { await navigator.share(shareData); } catch (err) { console.debug('Navigator share skipped or cancelled:', err); } }
          else { await navigator.clipboard.writeText(`${post.content?.slice(0, 80)}\n${window.location.origin}`); useToastStore.getState().addToast('Link disalin ke clipboard! 📋', 'success'); }
        }}>
          <Navigation className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>

      <AnimatePresence>{showComments && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
          <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <img src={c.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover mt-0.5" />
                <div><span className="text-xs font-bold text-white">{c.userName}</span><span className="text-xs text-gray-400 ml-2">{c.text}</span></div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="px-4 pb-3 flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Tulis komentar..." className="flex-1 bg-gas-darker border border-gray-800 rounded-full px-3 py-2 text-xs text-white outline-none focus:border-gas-green" />
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="p-2 bg-gas-green rounded-full text-gas-darker"><Send className="w-3 h-3" /></motion.button>
          </form>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
