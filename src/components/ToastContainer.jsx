/**
 * ToastContainer.jsx
 * Lightweight top-center Toast Notification system.
 * Clean AAA game styling: no glow, Lucide icons, spring animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Coins, Award } from 'lucide-react';
import { useToastStore, toast } from '../store/toastStore';

export { toast };

const spring = { type: 'spring', stiffness: 450, damping: 28 };

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const getAccentStyles = (accent) => {
    switch (accent) {
      case 'emerald':
        return {
          border: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
          titleColor: 'text-emerald-300',
        };
      case 'amber':
        return {
          border: 'border-amber-500/40',
          badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
          titleColor: 'text-amber-300',
        };
      case 'red':
      default:
        return {
          border: 'border-red-600/40',
          badgeBg: 'bg-red-950/40 text-red-400 border-red-900/50',
          titleColor: 'text-red-300',
        };
    }
  };

  return (
    <div
      className="fixed top-4 start-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4 font-sans"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const styles = getAccentStyles(t.accent);

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9, transition: { duration: 0.15 } }}
              transition={spring}
              onClick={() => removeToast(t.id)}
              className={`
                pointer-events-auto cursor-pointer
                w-full flex items-center gap-3 p-3
                bg-zinc-950/95 backdrop-blur-md
                border ${styles.border}
                rounded-xl shadow-lg
                transition-colors duration-150
                group select-none
              `}
            >
              {/* Icon badge */}
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base
                  border ${styles.badgeBg}
                `}
              >
                {t.icon || <AlertCircle size={15} />}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-bold tracking-tight truncate ${styles.titleColor}`}>
                    {t.title}
                  </h4>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">
                    <X size={13} />
                  </span>
                </div>
                {t.message && (
                  <p className="text-[11px] text-zinc-400 line-clamp-1 font-medium mt-0.5">
                    {t.message}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
