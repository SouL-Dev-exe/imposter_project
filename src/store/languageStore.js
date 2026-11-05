/**
 * languageStore.js
 * Zustand store for language selection (en/ar) and direction (ltr/rtl).
 * Automatically updates document.documentElement.dir and lang attributes,
 * and maintains bidirectional sync with react-i18next.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSLATIONS } from '../utils/translations';
import i18n from '../i18n';

// Initial sync on load
const savedLang = (() => {
  try {
    const raw =
      localStorage.getItem('spyrole-language') ||
      localStorage.getItem('undercover-language');
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
      dir: savedLang === 'ar' ? 'rtl' : 'ltr',

      setLanguage: (lang) => {
        const nextLang = lang === 'ar' ? 'ar' : 'en';
        const isRTL = nextLang === 'ar';
        const dir = isRTL ? 'rtl' : 'ltr';

        if (typeof document !== 'undefined') {
          document.documentElement.dir = dir;
          document.documentElement.lang = nextLang;
        }

        // Keep react-i18next in sync
        try {
          if (i18n && i18n.language !== nextLang) {
            i18n.changeLanguage(nextLang);
          }
        } catch (_) {}

        set({ language: nextLang, isRTL, dir });
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

        // Support both {param} and {{param}} interpolation
        return val
          .replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{{${k}}}`))
          .replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
      },
    }),
    {
      name: 'spyrole-language',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (item) return JSON.parse(item);
          const legacy = localStorage.getItem('undercover-language');
          return legacy ? JSON.parse(legacy) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

/**
 * Convenient hook providing t, language, isRTL, dir, and toggleLanguage
 */
export function useAppTranslation() {
  const { t, language, isRTL, dir, setLanguage, toggleLanguage } = useLanguageStore();
  return { t, language, isRTL, dir, setLanguage, toggleLanguage };
}

export default useLanguageStore;
