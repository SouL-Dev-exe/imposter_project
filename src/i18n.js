/**
 * i18n.js — Zero-lag i18n bridge.
 *
 * Strategy: Re-uses the existing TRANSLATIONS dictionaries (src/utils/translations.js)
 * so we have ONE source of truth for all strings. react-i18next is initialised with
 * those resources and synced with the Zustand languageStore so both
 * `useTranslation()` and `useLanguageStore().t()` always agree on the active language.
 *
 * RTL/LTR direction is handled here AND inside languageStore — both are idempotent,
 * so double-setting document.dir is harmless.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { TRANSLATIONS } from './utils/translations';

// ── Build react-i18next resource map from TRANSLATIONS ─────────────────────
// TRANSLATIONS shape: { en: { home: {…}, lobby: {…} }, ar: {…} }
// react-i18next expects: { en: { translation: {…} }, ar: {…} }
const resources = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([lang, dict]) => [
    lang,
    { translation: dict },
  ])
);

// ── Detect persisted language from the same localStorage key used by languageStore
const persistedLang = (() => {
  try {
    const raw = localStorage.getItem('undercover-language');
    if (raw) return JSON.parse(raw)?.state?.language || 'ar';
  } catch {}
  return 'ar';
})();

// ── Initialise i18next ─────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: persistedLang,          // honour stored preference, skip auto-detect
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
      // Support both {name} (TRANSLATIONS style) and {{name}} (i18next default)
      prefix: '{{',
      suffix: '}}',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'undercover-i18n-lang',
    },
  });

// ── RTL/LTR — keep document direction in sync on every language change ─────
const applyDirection = (lng) => {
  const isRTL = lng?.startsWith('ar');
  document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng || 'ar';
};

i18n.on('languageChanged', applyDirection);

// Apply immediately on boot
applyDirection(i18n.language || persistedLang);

export default i18n;
