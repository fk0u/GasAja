import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, Heart, MessageCircle, Users, Sparkles, Trash2, CheckCheck, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useToastStore } from '@/store/useToastStore';

const ICON_MAP = {
  like: Heart,
  comment: MessageCircle,
  join: Users,
  follow: UserPlus,
  new_plan: Sparkles,
  new_post: Sparkles,
};
const COLOR_MAP = {
  like: 'text-gas-orange',
  comment: 'text-blue-400',
  join: 'text-gas-green',
  follow: 'text-pink-400',
  new_plan: 'text-purple-400',
  new_post: 'text-purple-400',
};

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
};

const Notifications = () => {
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const notifsRef = query(ref(db, `notifications/${user.uid}`), orderByChild('createdAt'), limitToLast(50));
    return onValue(notifsRef, (snap) => {
      const arr = [];
      if (snap.exists()) snap.forEach(c => arr.push({ id: c.key, ...c.val() }));
      arr.sort((a, b) => b.createdAt - a.createdAt);
      setNotifs(arr);
      setLoading(false);
    });
  }, [user]);

  const handleNotifClick = async (n) => {
    if (!user) return;
    // Mark as read
    if (!n.read) {
      await update(ref(db, `notifications/${user.uid}/${n.id}`), { read: true });
    }
    // Navigate to link
    if (n.link) {
      navigate({ to: n.link });
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    const updates = {};
    notifs.filter(n => !n.read).forEach(n => {
      updates[`notifications/${user.uid}/${n.id}/read`] = true;
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      addToast('Semua notifikasi ditandai dibaca ✅', 'success');
    } else {
      addToast('Semua sudah dibaca 👍', 'info');
    }
  };

  const clearAll = async () => {
    if (!user || notifs.length === 0) return;
    await remove(ref(db, `notifications/${user.uid}`));
    addToast('Semua notifikasi dihapus 🗑️', 'info');
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    if (!user) return;
    await remove(ref(db, `notifications/${user.uid}/${id}`));
    addToast('Notifikasi dihapus', 'info');
  };

  const [now] = useState(() => Date.now());

  const unreadCount = notifs.filter(n => !n.read).length;
  const recentNotifs = notifs.filter(n => now - n.createdAt < 86400000);
  const olderNotifs = notifs.filter(n => now - n.createdAt >= 86400000);

  const NotifItem = ({ n, i, isRecent }) => {
    const Icon = ICON_MAP[n.type] || Sparkles;
    const color = COLOR_MAP[n.type] || 'text-gray-400';
    return (
      <motion.div
        key={n.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: i * 0.03 }}
        onClick={() => handleNotifClick(n)}
        className={`flex items-center gap-3 p-3 rounded-2xl mb-2 group transition-colors cursor-pointer ${
          !n.read && isRecent
            ? 'bg-gas-green/[0.04] border border-gas-green/10'
            : 'hover:bg-gas-card/30'
        }`}
      >
        <div className="relative">
          <img
            src={n.fromAvatar || `https://ui-avatars.com/api/?name=${n.fromName || 'U'}`}
            alt=""
            className="w-11 h-11 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gas-darker rounded-full flex items-center justify-center">
            <Icon className={`w-3 h-3 ${color}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isRecent ? 'text-white' : 'text-gray-300'}`}>
            <span className="font-bold">{n.fromName || 'Seseorang'}</span>{' '}
            <span className={isRecent ? 'text-gray-400' : ''}>{n.text}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 font-medium">{timeAgo(n.createdAt)}</span>
            {!n.read && <span className="w-2 h-2 bg-gas-green rounded-full" />}
            {n.link && <span className="text-[10px] text-gas-green/60 font-bold">Tap untuk buka →</span>}
          </div>
        </div>
        <button
          onClick={(e) => deleteNotif(e, n.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-4 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="sticky top-0 z-40 bg-gas-darker/90 backdrop-blur-xl border-b border-white/[0.04] px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black flex items-center gap-2">
          <Bell className="w-5 h-5 text-gas-green" /> Notifikasi
          {unreadCount > 0 && (
            <span className="text-xs bg-gas-orange text-white px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-gas-green font-bold flex items-center gap-1 hover:underline">
              <CheckCheck className="w-4 h-4" /> Baca Semua
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 font-bold flex items-center gap-1 hover:underline ml-2">
              <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gas-green" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gas-card rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <Bell className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-gray-400 font-bold text-base">Belum ada notifikasi</p>
            <p className="text-gray-700 text-sm mt-1">Interaksi dari teman-teman kamu akan muncul di sini</p>
          </div>
        ) : (
          <>
            {recentNotifs.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Terbaru</p>
                <AnimatePresence>
                  {recentNotifs.map((n, i) => (
                    <NotifItem key={n.id} n={n} i={i} isRecent={true} />
                  ))}
                </AnimatePresence>
              </>
            )}

            {olderNotifs.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6 px-1">Sebelumnya</p>
                {olderNotifs.map((n, i) => (
                  <NotifItem key={n.id} n={n} i={i} isRecent={false} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/notifications')({
  component: Notifications,
});
