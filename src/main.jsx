/**
 * main.jsx — Application entry point.
 * i18n is imported first so translations are available before any component mounts.
 */
import './i18n';                          // ← must be FIRST: init i18next synchronously
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import i18n from './i18n';
import { useLanguageStore } from './store/languageStore';

// ── Keep languageStore ↔ i18next in sync ──────────────────────────────────
// When i18next language changes (e.g. via LanguageDetector), update the Zustand store.
i18n.on('languageChanged', (lng) => {
  const { language, setLanguage } = useLanguageStore.getState();
  if (language !== lng) setLanguage(lng);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
