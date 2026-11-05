/**
 * WelcomeAuthScreen.jsx — First-time welcome gate.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState } from 'react';
import { Play, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import AuthModal from './ui/AuthModal';
import spyRoleLogo from './assets/faviconlogo.png';

export default function WelcomeAuthScreen() {
  const { t, isRTL } = useLanguageStore();
  const [guestName, setGuestName] = useState('');
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, initialTab: 'login' });
  const { loginAsGuest } = useAuthStore();

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    loginAsGuest(guestName.trim() || 'Guest01');
  };

  const openModal = (tab) => {
    setAuthModalConfig({ isOpen: true, initialTab: tab });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative select-none font-sans">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-2xl text-center shadow-xl space-y-6 relative z-10">
        {/* Game Badge */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.35)]">
            <img src={spyRoleLogo} alt="SpyRole" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1 font-mono">
            SPY<span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">ROLE</span>
          </h1>
          <p className="text-zinc-400 text-xs font-mono">
            {isRTL ? 'SpyRole: لعبة الكلمات الخفية' : 'SpyRole: Undercover Word Game'}
          </p>
        </div>

        {/* OPTION 1: Play as Guest */}
        <form onSubmit={handleGuestSubmit} className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-start">
          <label className="block text-xs font-semibold text-zinc-300">
            1. {t('auth.play_as_guest') || (isRTL ? 'دخول ضيف سريع' : 'Quick Pass & Play (Guest)')}
          </label>
          <input
            type="text"
            placeholder={t('auth.guest_name_placeholder') || (isRTL ? 'أدخل اسماً مؤقتاً...' : 'Enter temporary call-sign...')}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-2.5 bg-zinc-950 text-white rounded-lg border border-zinc-800 text-center focus:outline-none focus:border-red-600 text-xs placeholder:text-zinc-500 font-mono"
            maxLength={20}
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 font-bold text-white rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Play size={13} />
            <span>{t('auth.play_as_guest') || (isRTL ? 'بدء اللعب كضيف' : 'Start Playing as Guest')}</span>
          </button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono">
            <span className="bg-zinc-950 px-3 text-zinc-500 text-[10px]">
              {isRTL ? 'أو ربط هوية العميل' : 'Or connect operative ID'}
            </span>
          </div>
        </div>

        {/* OPTIONS 2 & 3: Login or Create Account */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => openModal('login')}
            className="py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn size={13} />
            <span>{t('auth.login') || 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => openModal('signup')}
            className="py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={13} />
            <span>{t('auth.signup') || 'Register'}</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialTab={authModalConfig.initialTab}
        onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
      />
    </div>
  );
}
