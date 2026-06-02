import { useState, lazy, Suspense } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Sparkles, MapPin, Calendar, Clock, Loader2, ChevronRight, Users, Image, AlignLeft, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

const LocationPicker = lazy(() => import('@/components/ui/LocationPicker'));
import { generateSlug } from '@/utils/slug';
import { VIBES, TAGS } from '@/lib/constants';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const searchParams = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step wizard

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: searchParams.title || '',
    description: searchParams.description || '',
    date: '',
    time: '',
    location: searchParams.location || '',
    locationCoords: null,
    vibe: searchParams.vibe || 'chill',
    maxParticipants: 5,
    coverImage: '',
    tags: [],
  });
  const addToast = useToastStore(s => s.addToast);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const availableDates = generateDates();
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleLocationSelect = (loc) => {
    setFormData({ ...formData, location: loc.name, locationCoords: { lat: loc.lat, lng: loc.lng } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return addToast('Silakan login dulu!', 'error');
    setLoading(true);
    try {
      // Fetch the creator's username
      let creatorUsername = 'u';
      const userSnap = await get(ref(db, `users/${user.uid}/username`));
      if (userSnap.exists()) creatorUsername = userSnap.val();

      // Generate a URL-friendly slug
      const slug = generateSlug(formData.title);

      const plansRef = ref(db, 'plans');
      const newPlanRef = push(plansRef);
      await set(newPlanRef, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        locationCoords: formData.locationCoords,
        vibe: formData.vibe,
        maxParticipants: parseInt(formData.maxParticipants),
        coverImage: formData.coverImage || null,
        tags: formData.tags,
        slug: slug,
        creatorId: user.uid,
        creatorUsername: creatorUsername,
        creatorName: user.displayName || 'Anonim',
        creatorAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}`,
        participants: [user.uid],
        likes: [],
        commentsList: [],
        createdAt: Date.now()
      });
      addToast('Plan berhasil dibuat! 🚀 Gas ikutan!', 'success');
      navigate({ to: `/${creatorUsername}/${slug}` });
    } catch (error) {
      console.error('Error creating plan:', error);
      addToast('Gagal membuat plan. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.title.trim().length > 0;
  const canProceedStep2 = formData.date && formData.time && formData.location;

  return (
    <div className="min-h-screen pb-24 md:pb-8 max-w-xl md:max-w-2xl mx-auto bg-gas-darker">
      <header className="sticky top-0 z-50 glass-dock rounded-none border-t-0 border-x-0 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => step > 1 ? setStep(step - 1) : navigate({ to: -1 })} className="p-2 bg-gas-card rounded-full border-2 border-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black italic">Buat Plan Baru</h1>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gas-card px-3 py-1 rounded-full">Step {step}/3</span>
      </header>

      {/* Progress bar */}
      <div className="px-5 mt-3 mb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-gas-green' : 'bg-gray-800'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: What ─── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="px-5 space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-500 mb-2">Mau ngapain?</p>
                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                  placeholder="Contoh: Nongkrong di cafe baru"
                  className="w-full bg-transparent text-white placeholder-gray-600 text-3xl font-black focus:outline-none border-b-4 border-gray-800 pb-4 focus:border-gas-green transition-colors"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Deskripsi</p>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Ceritain lebih detail rencana kamu biar teman-teman makin tertarik... 💬"
                  rows={4}
                  className="w-full bg-gas-card border-2 border-gray-800 rounded-2xl p-4 text-white font-bold text-sm focus:border-gas-green outline-none resize-none"
                />
              </div>

              {/* Vibe */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Vibe-nya gimana?</p>
                <div className="grid grid-cols-5 gap-2">
                  {VIBES.map(v => (
                    <motion.button type="button" key={v.id} whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({ ...formData, vibe: v.id })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${formData.vibe === v.id ? 'border-gas-green bg-gas-green/10 shadow-[0_0_15px_rgba(0,255,159,0.15)]' : 'border-gray-800 bg-gas-card'}`}
                    >
                      <span className="text-2xl">{v.icon}</span>
                      <span className="text-[10px] font-bold text-gray-300">{v.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-2"><Image className="w-4 h-4" /> Cover Image (opsional)</p>
                <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange}
                  placeholder="URL gambar cover..."
                  className="w-full bg-gas-card border-2 border-gray-800 rounded-2xl p-4 text-white font-bold text-sm focus:border-gas-green outline-none"
                />
                {formData.coverImage && (
                  <div className="mt-2 rounded-2xl overflow-hidden h-32">
                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" onError={() => setFormData({ ...formData, coverImage: '' })} />
                  </div>
                )}
              </div>

              <motion.button type="button" whileTap={{ scale: 0.95 }} disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="w-full bg-gas-green text-gas-darker font-black text-lg py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Lanjut <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* ─── STEP 2: When & Where ─── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="px-5 space-y-6">
              {/* Date */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Kapan?</p>
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowDatePicker(true)}
                  className={`bg-gas-card rounded-2xl p-4 border-2 cursor-pointer transition-colors ${formData.date ? 'border-gas-orange shadow-[0_0_15px_rgba(255,77,0,0.15)]' : 'border-gray-800'}`}
                >
                  <p className="font-bold text-white">{formData.date || 'Pilih tanggal'}</p>
                </motion.div>
              </div>

              {/* Time */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Jam berapa?</p>
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowTimePicker(true)}
                  className={`bg-gas-card rounded-2xl p-4 border-2 cursor-pointer transition-colors ${formData.time ? 'border-gas-green shadow-[0_0_15px_rgba(0,255,159,0.15)]' : 'border-gray-800'}`}
                >
                  <p className="font-bold text-white">{formData.time || 'Pilih jam'}</p>
                </motion.div>
              </div>

              {/* Location with map */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Di mana?</p>
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowLocationPicker(true)}
                  className={`bg-gas-card rounded-2xl p-4 border-2 cursor-pointer transition-colors ${formData.location ? 'border-gas-orange shadow-[0_0_15px_rgba(255,77,0,0.15)]' : 'border-gray-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gas-darker flex items-center justify-center shrink-0">
                      <MapPin className={`w-5 h-5 ${formData.location ? 'text-gas-orange' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{formData.location || 'Pilih lokasi dari map'}</p>
                      {formData.locationCoords && <p className="text-[11px] text-gray-500">{formData.locationCoords.lat.toFixed(4)}, {formData.locationCoords.lng.toFixed(4)}</p>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                </motion.div>
              </div>

              <motion.button type="button" whileTap={{ scale: 0.95 }} disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                className="w-full bg-gas-green text-gas-darker font-black text-lg py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Lanjut <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* ─── STEP 3: Details ─── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="px-5 space-y-6">
              {/* Max participants */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Berapa orang?</p>
                <div className="flex items-center gap-4 bg-gas-card rounded-2xl p-4 border-2 border-gray-800">
                  <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => setFormData(p => ({ ...p, maxParticipants: Math.max(2, p.maxParticipants - 1) }))}
                    className="w-12 h-12 bg-gas-darker rounded-xl flex items-center justify-center text-2xl font-black text-white border border-gray-700">−</motion.button>
                  <div className="flex-1 text-center">
                    <p className="text-4xl font-black text-white">{formData.maxParticipants}</p>
                    <p className="text-xs text-gray-500 font-bold">orang max</p>
                  </div>
                  <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => setFormData(p => ({ ...p, maxParticipants: Math.min(50, p.maxParticipants + 1) }))}
                    className="w-12 h-12 bg-gas-darker rounded-xl flex items-center justify-center text-2xl font-black text-white border border-gray-700">+</motion.button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags (opsional)</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <motion.button key={tag} type="button" whileTap={{ scale: 0.9 }} onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${formData.tags.includes(tag) ? 'bg-gas-green/10 border-gas-green text-gas-green' : 'bg-gas-card border-gray-800 text-gray-400'}`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-gas-card rounded-2xl border border-gray-800 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-purple-600 to-gas-green relative overflow-hidden">
                  {formData.coverImage && <img src={formData.coverImage} alt="" className="w-full h-full object-cover absolute inset-0 opacity-60" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-gas-card to-transparent" />
                </div>
                <div className="p-4 -mt-4 relative">
                  <span className="text-xs font-black bg-gas-orange/20 text-gas-orange px-2 py-0.5 rounded">{(VIBES.find(v => v.id === formData.vibe)?.icon) || '✨'} {formData.vibe.toUpperCase()}</span>
                  <h4 className="font-black text-lg text-white mt-1">{formData.title || 'Judul plan'}</h4>
                  {formData.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{formData.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-bold">
                    <span>📅 {formData.date || '-'}</span>
                    <span>⏰ {formData.time || '-'}</span>
                    <span>📍 {formData.location || '-'}</span>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map(t => <span key={t} className="text-[10px] bg-gas-darker px-2 py-0.5 rounded text-gas-green font-bold">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" whileTap={{ scale: 0.95 }} disabled={loading}
                className="w-full bg-gas-green text-gas-darker font-black text-lg py-5 rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_6px_0_0_#00c077]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Gas Buat Plan! 🚀</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* ─── Date Picker Modal ─── */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDatePicker(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gas-darker border-t border-gray-800 rounded-t-[40px] p-6 w-full max-w-xl mx-auto">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-4">Pilih Tanggal</h3>
              <div className="grid grid-cols-7 gap-2 max-h-60 overflow-y-auto">
                {availableDates.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = formData.date === dateStr;
                  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                  return (
                    <motion.button type="button" key={i} whileTap={{ scale: 0.9 }}
                      onClick={() => { setFormData(p => ({ ...p, date: dateStr })); setShowDatePicker(false); }}
                      className={`p-3 rounded-2xl text-center transition-all ${isSelected ? 'bg-gas-orange text-white' : 'bg-gas-card text-gray-300 border border-gray-800 hover:border-gas-orange'}`}
                    >
                      <p className="text-[10px] font-bold text-gray-500">{dayNames[d.getDay()]}</p>
                      <p className="text-lg font-black">{d.getDate()}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Time Picker Modal ─── */}
      <AnimatePresence>
        {showTimePicker && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTimePicker(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gas-darker border-t border-gray-800 rounded-t-[40px] p-6 w-full max-w-xl mx-auto">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-4">Pilih Jam</h3>
              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                {hours.map(h => minutes.map(m => {
                  const timeStr = `${h}:${m}`;
                  const isSelected = formData.time === timeStr;
                  return (
                    <motion.button type="button" key={timeStr} whileTap={{ scale: 0.9 }}
                      onClick={() => { setFormData(p => ({ ...p, time: timeStr })); setShowTimePicker(false); }}
                      className={`p-3 rounded-xl text-sm font-bold transition-all ${isSelected ? 'bg-gas-green text-gas-darker' : 'bg-gas-card text-gray-300 border border-gray-800'}`}
                    >
                      {timeStr}
                    </motion.button>
                  );
                }))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Location Picker ─── */}
      <AnimatePresence>
        {showLocationPicker && (
          <Suspense fallback={
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-gas-green animate-spin mx-auto mb-2" />
                <p className="text-white text-xs font-bold animate-pulse">Memuat Peta...</p>
              </div>
            </div>
          }>
            <LocationPicker
              isOpen={showLocationPicker}
              onClose={() => setShowLocationPicker(false)}
              onSelect={handleLocationSelect}
              currentLocation={formData.locationCoords ? { ...formData.locationCoords, name: formData.location } : null}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Route = createFileRoute('/_auth/create-plan')({
  component: CreatePlan,
  validateSearch: (search) => ({
    title: search.title || '',
    description: search.description || '',
    location: search.location || '',
    vibe: search.vibe || 'chill',
  }),
});
