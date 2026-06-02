import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Flame, MapPin, Users, Sparkles, Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';

const FEATURES = [
  { icon: MapPin, title: 'Eksplor Tempat', desc: 'Temukan spot hangout terbaik di kotamu' },
  { icon: Users, title: 'Bikin Plan Bareng', desc: 'Ajak teman-teman buat nongkrong bareng' },
  { icon: Sparkles, title: 'Share Momen', desc: 'Post cerita dan story seru setiap hari' },
  { icon: Zap, title: 'Real-time', desc: 'Semua update langsung, ga pake delay' },
];

// Translate Firebase error codes to friendly Indonesian messages
const FRIENDLY_ERRORS = {
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

const getFriendlyError = (err) => {
  const code = err?.code || '';
  return FRIENDLY_ERRORS[code] || 'Terjadi kesalahan. Coba lagi nanti ya! 😅';
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Isi email dan password dulu ya! 📝');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gas-darker to-gas-dark relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-gas-green opacity-20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-gas-orange opacity-20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-5xl z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
        {/* Left side — Hero (hidden on mobile, shown on tablet/desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col flex-1 max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-10 h-10 text-gas-green" />
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Gas<span className="text-gas-green">Aja!</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 font-medium mb-8 leading-relaxed">
            Platform hangout Gen Z paling seru.<br />
            <span className="text-gas-orange font-bold">Dari bingung jadi langsung gas!</span> 🚀
          </p>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-gas-card/50 rounded-2xl p-4 border border-white/[0.06]">
                <f.icon className="w-6 h-6 text-gas-green mb-2" />
                <h3 className="font-bold text-white text-sm">{f.title}</h3>
                <p className="text-[11px] text-gray-500 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side — Login form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md flex-shrink-0"
        >
          {/* Mobile-only branding */}
          <div className="text-center mb-10 md:hidden">
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">
              Gas<span className="text-gas-green">Aja!</span>
            </h1>
            <p className="text-gray-400 text-lg">Dari bingung jadi langsung gas! 🚀</p>
          </div>

          {/* Desktop form title */}
          <h2 className="hidden md:block text-2xl font-black text-white mb-6">
            {isLogin ? 'Selamat Datang! 👋' : 'Buat Akun Baru ✨'}
          </h2>

          <div className="card backdrop-blur-xl bg-opacity-60">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-start gap-2"
                >
                  <span className="text-lg leading-none mt-0.5">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
              
              <div>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  className="input-field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLogin ? 'Logging in...' : 'Mendaftar...'}</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-gray-500 text-sm">ATAU</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="btn-secondary w-full flex items-center justify-center gap-3"
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-gray-400 mt-6 text-sm">
              {isLogin ? "Belum punya akun?" : "Udah punya akun?"}{' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-gas-green font-semibold hover:underline focus:outline-none"
                disabled={loading || googleLoading}
              >
                {isLogin ? 'Daftar kuy!' : 'Login sini'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const LoginRoute = () => {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/" />;
  return <Login />;
};

export const Route = createFileRoute('/login')({
  component: LoginRoute,
});
