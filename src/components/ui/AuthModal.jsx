import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [isSignIn, setIsSignIn] = useState(initialTab !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInAnonymously, guestLogin } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setIsSignIn(initialTab !== 'signup');
      setError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignIn) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim() || email.split('@')[0]);
      }
      onClose();
    } catch (err) {
      const msg = err?.message || 'حدث خطأ أثناء المصادقة';
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('user already exists')
      ) {
        setIsSignIn(true);
        setError('هذا الحساب موجود بالفعل، تفضل بتسجيل الدخول');
      } else {
        setError(msg);
      }
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
        guestLogin('Guest01');
      }
      onClose();
    } catch (err) {
      // Fallback to local guest login
      guestLogin('Guest01');
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

        {/* Tab switcher buttons */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => { setIsSignIn(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isSignIn
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setIsSignIn(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isSignIn
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ إنشاء حساب جديد
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5">
          {isSignIn ? 'تسجيل الدخول (Sign In)' : 'إنشاء حساب جديد (Sign Up)'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {isSignIn
            ? 'سجل دخولك لمزامنة تقدمك، نقاطك ومشترياتك'
            : 'أنشئ حساباً جديداً للعب أونلاين وحفظ إحصائياتك'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-3 rounded-xl mb-4 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
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
              className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
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
              className="w-full p-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-bold text-white rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer text-sm ${
              isSignIn
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
            }`}
          >
            {loading ? 'جاري التحميل...' : (isSignIn ? 'تسجيل الدخول' : 'إنشاء الحساب الآن')}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 text-sm">
          <button
            type="button"
            onClick={handleAnonymousPlay}
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer"
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
              className="underline hover:text-white transition cursor-pointer"
            >
              {isSignIn ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
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
