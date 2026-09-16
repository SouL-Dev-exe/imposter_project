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

      setLanguage: (lang) => {
        const nextLang = lang === 'ar' ? 'ar' : 'en';
        if (typeof document !== 'undefined') {
          document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = nextLang;
        }
        set({ language: nextLang });
      },

      toggleLanguage: () => {
        const next = get().language === 'en' ? 'ar' : 'en';
        get().setLanguage(next);
      },

      t: () => {
        const lang = get().language;
        return TRANSLATIONS[lang] || TRANSLATIONS.en;
      },
    }),
    {
      name: 'undercover-language',
    }
  )
);
