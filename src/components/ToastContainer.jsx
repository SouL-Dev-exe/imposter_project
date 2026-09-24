/**
 * ToastContainer.jsx
 * Lightweight top-center Toast Notification system styled with semi-transparent dark backdrop,
 * glowing border accents (Purple/Emerald/Amber), and Framer Motion enter/exit animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, toast } from '../store/toastStore';

export { toast };

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const getAccentStyles = (accent) => {
    switch (accent) {
      case 'emerald':
        return {
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
          border: 'border-emerald-500/40 hover:border-emerald-500/70',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          titleColor: 'text-emerald-300',
        };
      case 'amber':
        return {
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
          border: 'border-amber-500/40 hover:border-amber-500/70',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          titleColor: 'text-amber-300',
        };
      case 'purple':
      default:
        return {
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.35)]',
          border: 'border-purple-500/40 hover:border-purple-500/70',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          titleColor: 'text-purple-300',
        };
    }
  };

  return (
    <div
      className="fixed top-4 start-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-sm px-4"
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
              initial={{ opacity: 0, y: -24, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => removeToast(t.id)}
              className={`
                pointer-events-auto cursor-pointer
                w-full flex items-center gap-3 p-3.5
                bg-gray-950/85 backdrop-blur-xl
                border ${styles.border}
                ${styles.glow}
                rounded-2xl shadow-2xl
                transition-all duration-200
                group select-none
              `}
            >
              {/* Icon badge */}
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl
                  border ${styles.badgeBg}
                  transition-transform duration-200 group-hover:scale-105
                `}
              >
                {t.icon}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-black tracking-wide truncate ${styles.titleColor}`}>
                    {t.title}
                  </h4>
                  <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors">
                    ✕
                  </span>
                </div>
                {t.message && (
                  <p className="text-[11px] text-white/70 line-clamp-1 font-medium mt-0.5">
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
