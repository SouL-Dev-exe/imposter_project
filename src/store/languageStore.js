/**
 * languageStore.js
 * Zustand store for language selection (en/ar) and direction (ltr/rtl).
 * Automatically updates document.documentElement.dir and lang attributes.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSLATIONS } from '../utils/translations';

// Initial sync on load
const savedLang = (() => {
  try {
    const raw = localStorage.getItem('undercover-language');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.language || 'en';
    }
  } catch (e) {}
  return 'en';
})();

if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLang;
}

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: savedLang,
      isRTL: savedLang === 'ar',

      setLanguage: (lang) => {
        const nextLang = lang === 'ar' ? 'ar' : 'en';
        if (typeof document !== 'undefined') {
          document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = nextLang;
        }
        set({ language: nextLang, isRTL: nextLang === 'ar' });
      },

      toggleLanguage: () => {
        const next = get().language === 'en' ? 'ar' : 'en';
        get().setLanguage(next);
      },

      t: (keyPath, params = {}) => {
        const lang = get().language;
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

        // If no keyPath is given (e.g. const strings = t()), return the entire dictionary
        if (!keyPath) return dict;

        if (typeof keyPath !== 'string') return '';

        const keys = keyPath.split('.');
        let val = dict;
        for (const k of keys) {
          val = val?.[k];
          if (val === undefined) break;
        }

        // Fallback to English if missing in current language
        if (val === undefined) {
          let fallback = TRANSLATIONS.en;
          for (const k of keys) {
            fallback = fallback?.[k];
            if (fallback === undefined) break;
          }
          val = fallback;
        }

        if (typeof val !== 'string') {
          return typeof val === 'number' ? String(val) : (val ?? keyPath);
        }

        return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
      },
    }),
    {
      name: 'undercover-language',
    }
  )
);
