/**
 * Modal.jsx — Animated overlay modal
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className={`relative w-full ${sizes[size]} bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden`}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
            <div className="p-6">
              {title && (
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
