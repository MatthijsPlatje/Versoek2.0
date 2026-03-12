import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationNL from './locales/nl/translation.json';

// Translation resources
const resources = {
  en: {
    translation: translationEN
  },
  nl: {
    translation: translationNL
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language if detection fails
    debug: false, // Set to true during development for debugging
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then browser language
      caches: ['localStorage'], // Cache the language in localStorage
    }
  });

export default i18n;
