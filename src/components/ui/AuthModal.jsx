/**
 * AuthModal.jsx — Agent authorization (sign in / sign up).
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Corners, ClassifiedTag } from './HudFrame';
import { playClickSound } from '../../utils/sfx';

const spring = { type: 'spring', stiffness: 500, damping: 28 };
const inputCls =
  'w-full px-3 h-11 bg-black text-white border border-zinc-800 placeholder-zinc-700 text-sm font-mono ' +
  'focus:outline-none focus:border-red-600 focus:shadow-[0_0_14px_rgba(220,38,38,0.3)] transition-all';

function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-[0.2em]">
        {label}
      </label>
      <input id={id} className={inputCls} {...props} />
    </div>
  );
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { t } = useTranslation();

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

  const switchTab = (toSignIn) => { playClickSound(); setIsSignIn(toSignIn); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignIn) await signIn(email.trim(), password);
      else await signUp(email.trim(), password, username.trim() || email.split('@')[0]);
      onClose();
    } catch (err) {
      const msg = err?.message || t('common.error');
      const lower = msg.toLowerCase();
      if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('user already exists')) {
        setIsSignIn(true);
        setError(t('auth.account_exists'));
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
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 font-mono overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isSignIn ? t('auth.login') : t('auth.signup')}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative bg-zinc-950 border border-red-900/60 p-5 sm:p-7 w-full max-w-md my-auto shadow-[0_0_50px_rgba(220,38,38,0.25)]"
          >
            <Corners size="w-4 h-4" />
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_#dc2626]" />

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={spring}
              className="absolute top-3 end-3 w-8 h-8 bg-black border border-zinc-800 hover:border-red-600 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              aria-label={t('common.close')}
            >
              ✕
            </motion.button>

            <ClassifiedTag className="mb-4">Restricted access</ClassifiedTag>

            {/* Tabs */}
            <div role="tablist" className="relative grid grid-cols-2 gap-1 bg-black p-1 border border-zinc-800 mb-5">
              {[{ v: true, label: `🔑 ${t('auth.login')}` }, { v: false, label: `✨ ${t('auth.signup')}` }].map((tab) => {
                const active = isSignIn === tab.v;
                return (
                  <button
                    key={String(tab.v)}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchTab(tab.v)}
                    className={`relative py-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 bg-red-600 shadow-[0_0_16px_rgba(220,38,38,0.5)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5 uppercase tracking-widest break-words">
              {isSignIn ? t('auth.login') : t('auth.signup')}
            </h2>
            <p dir="auto" className="text-xs text-zinc-500 mb-5 leading-relaxed">
              {isSignIn
                ? 'سجل دخولك لمزامنة تقدمك، نقاطك ومشترياتك'
                : 'أنشئ حساباً جديداً للعب أونلاين وحفظ إحصائياتك'}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  key={error}
                  role="alert"
                  initial={{ opacity: 0, height: 0, x: 0 }}
                  animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/60 border border-red-600/60 text-red-300 p-3 mb-4 text-xs font-medium leading-relaxed break-words overflow-hidden"
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <AnimatePresence initial={false}>
                {!isSignIn && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Field
                      id="auth-username"
                      label={t('auth.username')}
                      type="text"
                      autoComplete="username"
                      placeholder={t('auth.username_placeholder')}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field id="auth-email" label={t('auth.email')} type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Field
                id="auth-password"
                label={t('auth.password')}
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
                whileHover={loading ? undefined : { scale: 1.02 }}
                whileTap={loading ? undefined : { scale: 0.97 }}
                transition={spring}
                className="w-full h-12 font-black text-white bg-red-600 hover:bg-red-500 border border-red-400/60 shadow-[0_0_25px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-wait cursor-pointer text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {loading ? t('auth.loading') : isSignIn ? t('auth.sign_in_btn') : t('auth.sign_up_btn')}
              </motion.button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-900 flex flex-col gap-3">
              <motion.button
                type="button"
                onClick={handleAnonymousPlay}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="w-full h-11 bg-black hover:bg-zinc-900 text-zinc-200 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-zinc-700 hover:border-red-600 disabled:opacity-50 cursor-pointer"
              >
                <span>🎭</span>
                <span>{t('auth.quick_guest')}</span>
              </motion.button>

              <div className="flex justify-between items-center gap-3 text-xs">
                <button type="button" onClick={() => switchTab(!isSignIn)} className="underline underline-offset-4 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer text-start">
                  {isSignIn ? t('auth.toggle_to_signup') : t('auth.toggle_to_login')}
                </button>
                <button type="button" onClick={onClose} className="text-zinc-600 hover:text-white transition-colors cursor-pointer shrink-0">
                  {t('auth.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
