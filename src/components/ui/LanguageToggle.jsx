/**
 * LanguageToggle.jsx — Seamless toggle between English and Arabic.
 * Syncs BOTH the Zustand languageStore AND react-i18next so every system
 * (existing t() calls and new useTranslation() calls) updates together.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import i18n from '../../i18n';

function syncLanguage(lang) {
  useLanguageStore.getState().setLanguage(lang);
  if (i18n.language !== lang) i18n.changeLanguage(lang);
}

export function LanguageToggle({ variant = 'chip', className = '' }) {
  const { language } = useLanguageStore();

  const toggle = () => syncLanguage(language === 'en' ? 'ar' : 'en');

  if (variant === 'settings-row') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 ${className} font-sans`}>
        <div className="flex items-center gap-2.5">
          <Globe size={18} className="text-zinc-400" />
          <div>
            <p className="text-white text-xs font-semibold">
              {language === 'ar' ? 'لغة اللعبة' : 'Game Language'}
            </p>
            <p className="text-zinc-500 text-[11px]">
              {language === 'ar' ? 'العربية (RTL) / English' : 'English / العربية (RTL)'}
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 gap-1 font-mono">
          <button
            type="button"
            onClick={() => syncLanguage('en')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-red-600 text-white'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => syncLanguage('ar')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              language === 'ar'
                ? 'bg-red-600 text-white'
                : 'text-zinc-500 hover:text-white'
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
      className={`flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 ${className}`}
      title={language === 'en' ? 'Switch to Arabic (العربية)' : 'التبديل إلى الإنجليزية (English)'}
    >
      <Globe size={13} className="text-zinc-400" />
      <span className="text-[11px] font-medium font-mono">
        {language === 'ar' ? 'العربية' : 'EN'}
      </span>
    </motion.button>
  );
}

export default LanguageToggle;
