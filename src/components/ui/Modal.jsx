/**
 * Modal.jsx — Animated overlay modal, fully scrollable on mobile.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Lock body scroll (and touch) while open
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — flex column: sticky header + scrollable body */}
          <motion.div
            className={`
              relative w-full ${sizes[size]}
              flex flex-col
              max-h-[90vh]
              bg-gray-900 border border-white/10
              rounded-t-2xl sm:rounded-2xl
              shadow-2xl shadow-black/60
              overflow-hidden
            `}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* ── Sticky header ── */}
            <div className="shrink-0">
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              {/* Gradient accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
              {title && (
                <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors text-xl leading-none p-1"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* ── Scrollable body ── */}
            <div
              className="
                flex-1 overflow-y-auto overscroll-contain
                p-6 space-y-4
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-white/15
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-white/30
              "
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
              {/* Safe-area spacer for phones with home indicator */}
              <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

