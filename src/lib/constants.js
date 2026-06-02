/**
 * App-wide constants for GasAja!
 * Centralized here for consistency across components.
 */

/** Vibe emoji mapping used in feed cards and plan detail */
export const VIBE_EMOJI = {
  chill: '☕',
  aesthetic: '✨',
  party: '🎉',
  foodie: '🍔',
  study: '📚',
  date: '💖',
  sport: '⚽',
  creative: '🎨',
  music: '🎵',
  gaming: '🎮',
};

/** Full vibe list with metadata — used in CreatePlan and filters */
export const VIBES = [
  { id: 'chill', label: 'Chill', color: 'bg-blue-500', icon: '☕' },
  { id: 'aesthetic', label: 'Aesthetic', color: 'bg-purple-500', icon: '✨' },
  { id: 'party', label: 'Party', color: 'bg-gas-orange', icon: '🎉' },
  { id: 'foodie', label: 'Foodie', color: 'bg-yellow-500', icon: '🍔' },
  { id: 'study', label: 'Study', color: 'bg-teal-500', icon: '📚' },
  { id: 'date', label: 'Date', color: 'bg-pink-500', icon: '💖' },
  { id: 'sport', label: 'Sport', color: 'bg-green-500', icon: '⚽' },
  { id: 'creative', label: 'Creative', color: 'bg-indigo-500', icon: '🎨' },
  { id: 'music', label: 'Music', color: 'bg-rose-500', icon: '🎵' },
  { id: 'gaming', label: 'Gaming', color: 'bg-cyan-500', icon: '🎮' },
];

/** Tags for plan categorization */
export const TAGS = [
  'Gratis',
  'Outdoor',
  'Indoor',
  'Malam',
  'Weekend',
  'Pemula OK',
  'Bawa Laptop',
  'BYOB',
  '18+',
  'Family Friendly',
];

/** Firebase-friendly error messages in Indonesian */
export const FRIENDLY_ERRORS = {
  'auth/user-not-found': 'Akun tidak ditemukan. Coba daftar dulu! ✨',
  'auth/wrong-password': 'Password salah. Coba lagi ya! 🔑',
  'auth/invalid-credential': 'Email atau password salah. Coba lagi! 🔑',
  'auth/email-already-in-use': 'Email sudah dipakai. Coba login aja! 👋',
  'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter ya! 💪',
  'auth/invalid-email': 'Format email tidak valid. Cek lagi ya! 📧',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu sebentar ya! ⏰',
  'auth/network-request-failed': 'Koneksi bermasalah. Cek internet kamu! 📶',
  'auth/popup-closed-by-user': 'Login dibatalkan. Coba lagi ya! 🔄',
  'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk login Google! 🪟',
};

/** Get friendly error message from Firebase error */
export const getFriendlyError = (err) => {
  const code = err?.code || '';
  return FRIENDLY_ERRORS[code] || 'Terjadi kesalahan. Coba lagi nanti ya! 😅';
};
