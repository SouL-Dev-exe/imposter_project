/**
 * LanguageToggle.jsx — Seamless toggle between English and Arabic.
 * Syncs BOTH the Zustand languageStore AND react-i18next so every system
 * (existing t() calls and new useTranslation() calls) updates together.
 *
 * Supports:
 *   variant="chip"          — Compact pill for headers/navbars (default)
 *   variant="settings-row"  — Full row with label for settings panels
 */
import { motion } from 'framer-motion';
import { useLanguageStore } from '../../store/languageStore';
import i18n from '../../i18n';

function syncLanguage(lang) {
  // 1. Update Zustand store (handles document.dir + localStorage)
  useLanguageStore.getState().setLanguage(lang);
  // 2. Update i18next (triggers useTranslation() re-renders)
  if (i18n.language !== lang) i18n.changeLanguage(lang);
}

export function LanguageToggle({ variant = 'chip', className = '' }) {
  const { language } = useLanguageStore();

  const toggle = () => syncLanguage(language === 'en' ? 'ar' : 'en');

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
            onClick={() => syncLanguage('en')}
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
            onClick={() => syncLanguage('ar')}
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
      onClick={toggle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-red-900/60 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer shrink-0 ${className}`}
      title={language === 'en' ? 'Switch to Arabic (العربية)' : 'التبديل إلى الإنجليزية (English)'}
    >
      <span className="text-xs">🌐</span>
      <span className="text-[11px] font-medium font-mono">
        {language === 'ar' ? 'العربية' : 'EN'}
      </span>
    </motion.button>
  );
}
