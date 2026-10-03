import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import AuthModal from './ui/AuthModal';

export default function WelcomeAuthScreen() {
  const [guestName, setGuestName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { loginAsGuest, signInAnonymously } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    loginAsGuest(guestName.trim());
  };

  const handleQuickPlay = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (signInAnonymously) {
        await signInAnonymously();
      } else {
        loginAsGuest();
      }
    } catch {
      loginAsGuest();
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative select-none">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl text-center shadow-2xl space-y-6 relative z-10"
      >
        {/* Animated Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/25 border border-purple-400/30">
            🕵️‍♂️
          </div>
          <span className="absolute -bottom-1 -end-1 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow">
            Online
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            لعبة العميل السري
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            اختر طريقة الدخول للبدء باللعب فوراً
          </p>
        </div>

        {/* Play as Guest Form */}
        <form onSubmit={handleGuestSubmit} className="space-y-3 text-start">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسمك في اللعبة (Nickname)
            </label>
            <input
              type="text"
              placeholder="أدخل اسمك (كمثال: كريمو أو سارة)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-3.5 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 text-center font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition placeholder:text-slate-500"
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg shadow-purple-600/25 transition active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>🎮</span>
            <span>اللعب كـ زائر (Play as Guest)</span>
          </button>
        </form>

        {/* Quick Anonymous Direct Play */}
        <button
          type="button"
          onClick={handleQuickPlay}
          className="text-xs text-purple-400 hover:text-purple-300 transition underline underline-offset-4"
        >
          ⚡ دخول عشوائي فوري بدون اسم
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-bold">أو</span>
          </div>
        </div>

        {/* Login / Register Button */}
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold rounded-xl transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 hover:border-slate-600"
        >
          <span>🔐</span>
          <span>تسجيل الدخول / إنشاء حساب</span>
        </button>
      </motion.div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
