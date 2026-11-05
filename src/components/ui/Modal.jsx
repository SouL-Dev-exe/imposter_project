/**
 * Modal.jsx — Animated overlay modal, fully scrollable on mobile.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`
              relative w-full ${sizes[size]}
              flex flex-col
              max-h-[90vh]
              bg-zinc-950 border border-zinc-800
              rounded-t-2xl sm:rounded-2xl
              shadow-xl
              overflow-hidden
            `}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* Sticky header */}
            <div className="shrink-0">
              {/* Drag handle for mobile */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-zinc-800" />
              </div>

              {title && (
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-zinc-850">
                  <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div
              className="
                flex-1 overflow-y-auto overscroll-contain
                p-5 space-y-4
              "
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
              <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
