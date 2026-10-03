import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function AuthModal({ isOpen, onClose }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInAnonymously, guestLogin } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username.trim() || email.split('@')[0]);
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'حدث خطأ أثناء المصادقة');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousPlay = async () => {
    setError('');
    setLoading(true);
    try {
      if (signInAnonymously) {
        await signInAnonymously();
      } else {
        guestLogin(`Guest_${Math.floor(1000 + Math.random() * 9000)}`);
      }
      onClose();
    } catch (err) {
      // Fallback to local guest login if anonymous auth isn't enabled on project
      guestLogin(`Guest_${Math.floor(1000 + Math.random() * 9000)}`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          {isSignIn ? 'تسجيل الدخول (Sign In)' : 'إنشاء حساب (Sign Up)'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isSignIn
            ? 'سجل دخولك لحفظ تقدمك ومشترياتك في اللعبة'
            : 'أنشئ حساباً جديداً لبدء اللعب الجماعي ومزامنة التحديات'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                placeholder="مثال: Player99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                required={!isSignIn}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              البريد الإلكتروني (Email)
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              كلمة السر (Password)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 font-bold text-white rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'جاري التحميل...' : (isSignIn ? 'تسجيل الدخول' : 'حساب جديد')}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 text-sm">
          <button
            type="button"
            onClick={handleAnonymousPlay}
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🎭</span>
            <span>الدخول كضيف سريعاً (Quick Guest Play)</span>
          </button>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError('');
              }}
              className="underline hover:text-white transition"
            >
              {isSignIn ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل الدخول'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
