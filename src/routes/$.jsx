import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, MapPin } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gas-darker px-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="relative">
          <span className="text-[120px] md:text-[160px] font-black italic text-transparent bg-clip-text bg-gradient-to-br from-gas-green via-gas-orange to-purple-500 leading-none select-none">
            404
          </span>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4"
          >
            <MapPin className="w-10 h-10 text-gas-orange" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
          Waduh, nyasar! 😵
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md">
          Halaman yang kamu cari nggak ketemu. Mungkin URL-nya salah, atau halaman ini sudah dihapus.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gas-green text-gas-darker font-bold rounded-2xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,159,0.2)]"
          >
            <Home className="w-5 h-5" /> Ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gas-card text-white font-bold rounded-2xl border border-gray-800 hover:border-gas-green/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </button>
        </div>
      </motion.div>

      <p className="mt-12 text-[10px] text-gray-700 font-bold">GasAja! v2.0.0</p>
    </div>
  );
};

export const Route = createFileRoute('/$')({
  component: NotFound,
});
