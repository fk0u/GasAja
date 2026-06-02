import { useState } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Image, Loader2, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setLoading(true);
    try {
      // Fetch the creator's username
      let username = '';
      const userSnap = await get(ref(db, `users/${user.uid}/username`));
      if (userSnap.exists()) username = userSnap.val();

      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonim',
        username: username,
        userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}`,
        content: content.trim(),
        image: imageUrl.trim() || null,
        likes: [],
        comments: [],
        createdAt: Date.now()
      });
      navigate({ to: '/' });
      addToast('Post berhasil dibuat! 🎉', 'success');
    } catch (error) {
      console.error('Error creating post:', error);
      addToast('Gagal membuat post. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 max-w-xl md:max-w-2xl mx-auto bg-gas-darker">
      <header className="sticky top-0 z-50 glass-dock rounded-none border-t-0 border-x-0 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: -1 })} className="p-2 bg-gas-card rounded-full border-2 border-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black italic">Buat Post</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="px-6 py-2.5 bg-gas-green text-gas-darker font-black rounded-full disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post'}
        </motion.button>
      </header>

      <div className="px-5 mt-6">
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gas-green" />
          <div>
            <p className="font-bold text-white">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-500 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Public post</p>
          </div>
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Apa yang lagi kamu pikirin? Share dong... 💭"
          rows={6}
          className="w-full bg-transparent text-white text-lg font-medium focus:outline-none resize-none placeholder-gray-600 mb-4"
          autoFocus
        />

        {/* Image preview */}
        {imageUrl && (
          <div className="relative mb-4 rounded-2xl overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full aspect-video object-cover" onError={() => setImageUrl('')} />
            <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Image URL input */}
        {showImageInput && !imageUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste URL gambar (dari Unsplash, dll)..."
              className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-green outline-none"
            />
          </motion.div>
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-3 border-t border-gray-800 pt-4">
          <button onClick={() => setShowImageInput(!showImageInput)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${showImageInput ? 'bg-gas-green/20 text-gas-green border border-gas-green/30' : 'bg-gas-card text-gray-400 border border-gray-800'}`}>
            <Image className="w-5 h-5" /> Tambah Foto
          </button>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/create-post')({
  component: CreatePost,
});
