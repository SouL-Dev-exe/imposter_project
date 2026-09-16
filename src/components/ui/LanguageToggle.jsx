/**
 * LanguageToggle.jsx — Seamless toggle between English and Arabic.
 * Supports compact chip style, button with flags, and settings row style.
 */
import { motion } from 'framer-motion';
import { useLanguageStore } from '../../store/languageStore';

export function LanguageToggle({ variant = 'chip', className = '' }) {
  const { language, setLanguage } = useLanguageStore();

  if (variant === 'settings-row') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 ${className}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌐</span>
          <div>
            <p className="text-white text-sm font-semibold">
              {language === 'ar' ? 'لغة اللعبة' : 'Game Language'}
            </p>
            <p className="text-white/40 text-xs">
              {language === 'ar' ? 'العربية (RTL) / English' : 'English / العربية (RTL)'}
            </p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === 'ar'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            العربية
          </button>
        </div>
      </div>
    );
  }

  // Default compact chip (great for headers/navbars)
  return (
    <motion.button
      type="button"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition-all shadow-sm ${className}`}
      title={language === 'en' ? 'Switch to Arabic (العربية)' : 'التبديل إلى الإنجليزية (English)'}
    >
      <span className="text-sm">🌐</span>
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </motion.button>
  );
}
