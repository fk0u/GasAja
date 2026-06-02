import { useState } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Image, Type, Palette, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

const BG_GRADIENTS = [
  'from-purple-600 to-pink-500',
  'from-gas-green to-cyan-500',
  'from-gas-orange to-red-500',
  'from-blue-600 to-indigo-500',
  'from-yellow-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-emerald-500',
  'from-violet-600 to-purple-500',
];

const CreateStory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mode, setMode] = useState('image'); // 'image' | 'text'
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [bgGradient, setBgGradient] = useState(BG_GRADIENTS[0]);
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async () => {
    if (!user) return;
    if (mode === 'image' && !imageUrl.trim()) return addToast('Masukkan URL gambar!', 'error');
    if (mode === 'text' && !caption.trim()) return addToast('Tulis sesuatu dulu!', 'error');

    setLoading(true);
    try {
      const storiesRef = ref(db, 'stories');
      const newRef = push(storiesRef);
      await set(newRef, {
        userId: user.uid,
        userName: user.displayName || 'User',
        userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}`,
        image: mode === 'image' ? imageUrl : null,
        caption: caption || '',
        type: mode,
        bgGradient: mode === 'text' ? bgGradient : null,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
      navigate({ to: '/' });
      addToast('Story berhasil diupload! ✨', 'success');
    } catch (e) {
      console.error(e);
      addToast('Gagal upload story. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-xl md:max-w-2xl mx-auto bg-gas-darker flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={() => navigate({ to: -1 })} className="p-2 bg-gas-card rounded-full border border-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black">Buat Story</h1>
        <div className="w-9" />
      </header>

      {/* Mode Toggle */}
      <div className="flex gap-2 px-4 mb-4 shrink-0">
        <button onClick={() => setMode('image')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'image' ? 'bg-gas-green text-gas-darker' : 'bg-gas-card text-gray-400 border border-gray-800'}`}>
          <Image className="w-4 h-4" /> Foto
        </button>
        <button onClick={() => setMode('text')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'text' ? 'bg-gas-green text-gas-darker' : 'bg-gas-card text-gray-400 border border-gray-800'}`}>
          <Type className="w-4 h-4" /> Teks
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 mx-4 mb-4 rounded-3xl overflow-hidden border border-gray-800 relative min-h-[400px]">
        {mode === 'image' ? (
          imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" onError={() => setImageUrl('')} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gas-card gap-3">
              <Image className="w-16 h-16 text-gray-700" />
              <p className="text-gray-600 text-sm font-bold">Preview muncul di sini</p>
            </div>
          )
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${bgGradient} flex items-center justify-center p-8`}>
            <p className="text-white text-2xl font-black text-center leading-relaxed drop-shadow-lg">
              {caption || 'Tulis sesuatu yang keren...'}
            </p>
          </div>
        )}

        {/* Caption overlay for image mode */}
        {mode === 'image' && caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16">
            <p className="text-white font-bold text-lg">{caption}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-6 space-y-3 shrink-0">
        {mode === 'image' && (
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="Paste URL gambar..."
            className="w-full bg-gas-card border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-gas-green"
          />
        )}

        <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
          placeholder={mode === 'image' ? 'Tambah caption (opsional)...' : 'Tulis story kamu...'}
          className="w-full bg-gas-card border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-gas-green"
        />

        {mode === 'text' && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> Background</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {BG_GRADIENTS.map(g => (
                <button key={g} onClick={() => setBgGradient(g)}
                  className={`w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br ${g} transition-all ${bgGradient === g ? 'ring-2 ring-white ring-offset-2 ring-offset-gas-darker scale-110' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={loading}
          className="w-full bg-gas-green text-gas-darker font-black text-base py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Upload Story</>}
        </motion.button>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/create-story')({
  component: CreateStory,
});
