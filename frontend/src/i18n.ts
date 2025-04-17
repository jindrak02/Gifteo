import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'cs'],
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    // Options for language detector - primary is localStorage, secondary is navigator
    // This means that if the user has a language set in localStorage, it will be used first
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;