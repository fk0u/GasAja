import { useState, useEffect } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { ArrowLeft, User, Bell, Shield, Palette, HelpCircle, LogOut, ChevronRight, Moon, Globe, Lock, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';
import { ref, update, get } from 'firebase/database';
import { db } from '@/lib/firebase';

const SettingsItem = ({ icon: Icon, label, desc, onClick, danger, toggle, toggled }) => (
  <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${danger ? 'hover:bg-red-500/10' : 'hover:bg-gas-card'}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-gas-card'}`}>
      <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-gas-green'}`} />
    </div>
    <div className="flex-1 text-left">
      <p className={`font-bold text-[15px] ${danger ? 'text-red-500' : 'text-white'}`}>{label}</p>
      {desc && <p className="text-xs text-gray-500 font-medium">{desc}</p>}
    </div>
    {toggle !== undefined ? (
      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${toggled ? 'bg-gas-green' : 'bg-gray-700'}`}>
        <motion.div animate={{ x: toggled ? 20 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
      </div>
    ) : (
      <ChevronRight className="w-5 h-5 text-gray-600" />
    )}
  </motion.button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [username, setUsername] = useState('');
  const addToast = useToastStore(s => s.addToast);

  // Load saved settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const snap = await get(ref(db, `users/${user.uid}/settings`));
        if (snap.exists()) {
          const s = snap.val();
          if (s.darkMode !== undefined) setDarkMode(s.darkMode);
          if (s.notifications !== undefined) setNotifications(s.notifications);
          if (s.privateAccount !== undefined) setPrivateAccount(s.privateAccount);
          if (s.onlineStatus !== undefined) setOnlineStatus(s.onlineStatus);
        }
        // Fetch username
        const userSnap = await get(ref(db, `users/${user.uid}/username`));
        if (userSnap.exists()) setUsername(userSnap.val());
      } catch (e) {
        console.error('[Settings] Load error:', e);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, [user]);

  const toggleSetting = async (key, current, setter) => {
    const val = !current;
    setter(val);
    if (user) {
      try {
        await update(ref(db, `users/${user.uid}/settings`), { [key]: val });
        const labels = {
          darkMode: 'Mode Gelap',
          notifications: 'Notifikasi',
          privateAccount: 'Akun Privat',
          onlineStatus: 'Status Online'
        };
        addToast(`${labels[key] || key} ${val ? 'diaktifkan ✅' : 'dinonaktifkan'}`, 'success');
      } catch {
        addToast('Gagal menyimpan pengaturan', 'error');
        setter(current); // revert on failure
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await logout();
      addToast('Berhasil logout! Sampai jumpa 👋', 'info');
      navigate({ to: '/login' });
    } catch (e) {
      console.error(e);
      addToast('Gagal logout, coba lagi', 'error');
    }
  };

  const handleDeleteAccount = () => {
    addToast('Fitur hapus akun membutuhkan verifikasi tambahan. Hubungi admin untuk melanjutkan.', 'error');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto bg-gas-darker">
      <header className="sticky top-0 z-50 glass-dock rounded-none border-t-0 border-x-0 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate({ to: -1 })} className="p-2 bg-gas-card rounded-full border-2 border-gray-700 hover:border-gas-green/30 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black italic">Settings</h1>
      </header>

      {loadingSettings ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gas-green" />
        </div>
      ) : (
        <div className="px-5 mt-4 space-y-6">
          {/* Profile summary */}
          <div className="bento-card flex items-center gap-4">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="" className="w-16 h-16 rounded-full border-2 border-gas-green" />
            <div className="flex-1">
              <p className="font-black text-white text-lg">{user?.displayName || 'User'}</p>
              {username && <p className="text-gas-green font-bold text-xs">@{username}</p>}
              <p className="text-gray-500 text-sm font-medium">{user?.email}</p>
            </div>
            <button onClick={() => navigate({ to: '/profile' })} className="px-4 py-2 bg-gas-green/10 text-gas-green text-sm font-bold rounded-xl hover:bg-gas-green/20 transition-colors">Edit</button>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Akun</p>
            <div className="bg-gas-card/30 rounded-2xl overflow-hidden">
              <SettingsItem icon={User} label="Edit Profil" desc="Ubah nama, bio, foto" onClick={() => navigate({ to: '/profile' })} />
              <SettingsItem icon={Lock} label="Akun Privat" desc="Hanya followers yang bisa lihat" toggle={true} toggled={privateAccount} onClick={() => toggleSetting('privateAccount', privateAccount, setPrivateAccount)} />
              <SettingsItem icon={Eye} label="Aktivitas Online" desc="Tampilkan status online" toggle={true} toggled={onlineStatus} onClick={() => toggleSetting('onlineStatus', onlineStatus, setOnlineStatus)} />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Preferensi</p>
            <div className="bg-gas-card/30 rounded-2xl overflow-hidden">
              <SettingsItem icon={Bell} label="Notifikasi" desc="Push notification & alerts" toggle={true} toggled={notifications} onClick={() => toggleSetting('notifications', notifications, setNotifications)} />
              <SettingsItem icon={Moon} label="Mode Gelap" desc="Tema gelap (default)" toggle={true} toggled={darkMode} onClick={() => toggleSetting('darkMode', darkMode, setDarkMode)} />
              <SettingsItem icon={Globe} label="Bahasa" desc="Bahasa Indonesia" onClick={() => addToast('Fitur multi-bahasa segera hadir! 🌍', 'info')} />
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Lainnya</p>
            <div className="bg-gas-card/30 rounded-2xl overflow-hidden">
              <SettingsItem icon={Shield} label="Privasi & Keamanan" desc="Data dan keamanan akun" onClick={() => addToast('Fitur privasi & keamanan segera hadir! 🔐', 'info')} />
              <SettingsItem icon={HelpCircle} label="Bantuan & FAQ" desc="Pusat bantuan" onClick={() => addToast('Pusat bantuan segera hadir! 📖', 'info')} />
              <SettingsItem icon={Palette} label="Tentang GasAja!" desc="v2.0.0" onClick={() => addToast('GasAja! v2.0.0 — Made with ❤️ by Tim GasAja', 'info')} />
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-gas-card/30 rounded-2xl overflow-hidden">
            <SettingsItem icon={LogOut} label="Logout" desc="Keluar dari akun" danger onClick={() => setShowLogoutConfirm(true)} />
            <SettingsItem icon={Trash2} label="Hapus Akun" desc="Hapus permanen" danger onClick={() => setShowDeleteConfirm(true)} />
          </div>

          {/* Version footer */}
          <p className="text-center text-[10px] text-gray-700 font-bold pb-4">GasAja! v2.0.0 • © 2026</p>
        </div>
      )}

      {/* Logout confirm */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-gas-darker border border-gray-800 rounded-3xl p-6 w-[85%] max-w-sm">
              <div className="w-16 h-16 bg-gas-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-gas-orange" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-2">Yakin mau logout?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">Kamu bisa login lagi kapan aja kok 😊</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gas-card rounded-xl font-bold text-white">Batal</button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white">Logout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete account confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-gas-darker border border-red-500/20 rounded-3xl p-6 w-[85%] max-w-sm">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-2">Hapus Akun?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">Semua data kamu akan dihapus permanen. Aksi ini tidak bisa dibatalkan!</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gas-card rounded-xl font-bold text-white">Batal</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Route = createFileRoute('/_auth/settings')({
  component: Settings,
});
