import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import AuthModal from './ui/AuthModal';

export default function WelcomeAuthScreen() {
  const [guestName, setGuestName] = useState('');
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, initialTab: 'login' });
  const { loginAsGuest } = useAuthStore();

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    loginAsGuest(guestName.trim());
  };

  const openModal = (tab) => {
    setAuthModalConfig({ isOpen: true, initialTab: tab });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative select-none">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl text-center shadow-2xl space-y-6 backdrop-blur-xl relative z-10">
        {/* Game Badge */}
        <div className="space-y-2">
          <div className="text-6xl animate-bounce">🕵️‍♂️</div>
          <h1 className="text-3xl font-black text-white tracking-wide">Undercover</h1>
          <p className="text-slate-400 text-sm">اختر طريقة الدخول للبدء باللعب فوراً</p>
        </div>

        {/* OPTION 1: Play as Guest */}
        <form onSubmit={handleGuestSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-right">
          <label className="block text-xs font-bold text-slate-300">
            1. اللعب كـ زائر (بدون حساب)
          </label>
          <input
            type="text"
            placeholder="Guest01"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-700 text-center focus:outline-none focus:border-purple-500 text-sm placeholder:text-slate-500 font-medium"
            maxLength={20}
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg shadow-purple-600/20 transition active:scale-95 text-sm cursor-pointer"
          >
            🎮 دخول كـ زائر (Play as Guest)
          </button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-bold">أو لحفظ تقدمك</span>
          </div>
        </div>

        {/* OPTIONS 2 & 3: Login or Create Account */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openModal('login')}
            className="py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            🔑 2. تسجيل الدخول
          </button>

          <button
            type="button"
            onClick={() => openModal('signup')}
            className="py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            ✨ 3. حساب جديد
          </button>
        </div>
      </div>

      {/* Auth Modal component with initial tab state */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialTab={authModalConfig.initialTab}
        onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
      />
    </div>
  );
}
