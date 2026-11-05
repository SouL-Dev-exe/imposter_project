/**
 * AuthModal.jsx — Agent authentication (sign in / sign up).
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, User, AlertCircle, X, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { playClickSound } from '../../utils/sfx';

const spring = { type: 'spring', stiffness: 500, damping: 28 };
const inputCls =
  'w-full px-3.5 h-10 bg-zinc-900 text-white border border-zinc-800 rounded-lg placeholder-zinc-500 text-sm font-sans ' +
  'focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-colors';

function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <input id={id} className={inputCls} {...props} />
    </div>
  );
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { t, isRTL } = useLanguageStore();

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

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose]);

  const switchTab = (toSignIn) => { 
    playClickSound(); 
    setIsSignIn(toSignIn); 
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignIn) await signIn(email.trim(), password);
      else await signUp(email.trim(), password, username.trim() || email.split('@')[0]);
      onClose();
    } catch (err) {
      const msg = err?.message || t('common.error') || 'Authentication failed';
      const lower = msg.toLowerCase();
      if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('user already exists')) {
        setIsSignIn(true);
        setError(t('auth.account_exists') || 'Account already registered. Please sign in.');
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
      if (signInAnonymously) await signInAnonymously();
      else guestLogin('Guest01');
      onClose();
    } catch {
      guestLogin('Guest01');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth"
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isSignIn ? (t('auth.login') || 'Sign In') : (t('auth.signup') || 'Sign Up')}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={spring}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 w-full max-w-sm my-auto shadow-xl"
          >
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              className="absolute top-4 end-4 w-7 h-7 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center rounded-lg cursor-pointer transition-colors"
              aria-label={t('common.close') || 'Close'}
            >
              <X size={15} />
            </motion.button>

            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                {t('auth.title') || (isRTL ? 'تصريح العميل' : 'Operative Clearance')}
              </span>
            </div>

            {/* Segmented Switch */}
            <div role="tablist" className="relative grid grid-cols-2 gap-1 bg-zinc-900 p-1 border border-zinc-800 rounded-xl mb-5">
              <button
                type="button"
                role="tab"
                aria-selected={isSignIn}
                onClick={() => switchTab(true)}
                className={`relative py-2 text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors z-10 flex items-center justify-center gap-1.5 rounded-lg ${
                  isSignIn ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LogIn size={13} />
                <span>{t('auth.login') || 'Sign In'}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={!isSignIn}
                onClick={() => switchTab(false)}
                className={`relative py-2 text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors z-10 flex items-center justify-center gap-1.5 rounded-lg ${
                  !isSignIn ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <UserPlus size={13} />
                <span>{t('auth.signup') || 'Register'}</span>
              </button>

              <motion.div
                layout
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 border border-zinc-700/60 rounded-lg shadow-sm"
                animate={{ [isRTL ? 'right' : 'left']: isSignIn ? '4px' : 'calc(50% + 2px)' }}
                transition={spring}
              />
            </div>

            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
              {isSignIn ? (t('auth.login') || 'Sign In') : (t('auth.signup') || 'Create Account')}
            </h2>
            <p dir="auto" className="text-xs text-zinc-500 mb-4 leading-relaxed">
              {isSignIn
                ? (t('auth.signInDesc') || 'Sign in to sync your rank, credits, and unlocked loadout.')
                : (t('auth.signUpDesc') || 'Create an operative account to track stats and play online.')}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  key={error}
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/30 border border-red-900/50 text-red-300 p-2.5 rounded-lg mb-3 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle size={14} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence initial={false}>
                {!isSignIn && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Field
                      id="auth-username"
                      label={t('auth.username') || 'Codename'}
                      type="text"
                      autoComplete="username"
                      placeholder={t('auth.username_placeholder') || 'Agent007'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                id="auth-email"
                label={t('auth.email') || 'Email'}
                type="email"
                autoComplete="email"
                placeholder="operative@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Field
                id="auth-password"
                label={t('auth.password') || 'Cipher Passkey'}
                type="password"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.015 }}
                whileTap={loading ? undefined : { scale: 0.985 }}
                transition={spring}
                className="w-full h-11 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {loading ? (t('auth.loading') || 'Authenticating...') : isSignIn ? (t('auth.sign_in_btn') || 'Authorize Session') : (t('auth.sign_up_btn') || 'Create Operative Profile')}
              </motion.button>
            </form>

            <div className="mt-4 pt-3.5 border-t border-zinc-900 flex flex-col gap-2.5">
              <motion.button
                type="button"
                onClick={handleAnonymousPlay}
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={spring}
                className="w-full h-9 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-zinc-750 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <User size={13} />
                <span>{t('auth.quick_guest') || 'Continue as Guest'}</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
