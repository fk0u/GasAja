import { useToastStore } from '../../store/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from 'lucide-react';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
const colorMap = {
  success: 'bg-gas-green/10 border-gas-green/30 text-gas-green',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
};
const barColor = {
  success: 'bg-gas-green',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[200] flex flex-col gap-2 max-w-[90%] md:max-w-sm w-full pointer-events-none md:top-6">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = iconMap[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl relative overflow-hidden ${colorMap[toast.type] || colorMap.info}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: toast.duration ? toast.duration / 1000 : 3, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left ${barColor[toast.type] || barColor.info}`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
