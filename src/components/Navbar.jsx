import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import AuthModal from './ui/AuthModal';

export default function Navbar() {
  const { profile, isGuest, signOut } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex justify-between items-center relative z-40">
      {/* Game Title */}
      <div className="font-black text-lg sm:text-xl bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2 select-none">
        <span className="text-xl">🕵️</span>
        <span>Undercover</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {profile ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Display Economy / Profile */}
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs sm:text-sm flex items-center gap-2 shadow-sm">
              <span>{profile.avatar_url || '🎭'}</span>
              <span className="font-bold text-white max-w-[120px] sm:max-w-[180px] truncate">
                {profile.username}
              </span>
              {isGuest && (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                  زائر
                </span>
              )}
            </div>

            {!isGuest && (
              <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>🪙</span>
                <span className="tabular-nums">{(profile.soul_coins ?? 0).toLocaleString()}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
              title="خروج من الحساب"
            >
              <span>خروج</span>
              <span className="hidden sm:inline text-red-400/70 text-xs">(Logout)</span>
            </button>
          </div>
        ) : (
          /* Login Button if Logged Out */
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-purple-600/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>🔐</span>
            <span>تسجيل الدخول (Login)</span>
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}

export { Navbar };
