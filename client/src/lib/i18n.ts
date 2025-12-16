import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';

import en from '../locales/en.json';
import lv from '../locales/lv.json';
import ru from '../locales/ru.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      lv: { translation: lv },
      ru: { translation: ru },
    },
    fallbackLng: ['lv', 'en'],
    supportedLngs: ['en', 'lv', 'ru'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'inbox-arena-language',
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[MISSING:${key}] in ${lngs.join(', ')}`);
      }
    },
  });

export default i18n;
