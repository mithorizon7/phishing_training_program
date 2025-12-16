/**
 * Internationalization Configuration (Latvia v1)
 * 
 * Architecture:
 * - ICU-capable i18n with proper plural support (important for Russian/Latvian)
 * - Key-based IDs following pattern: feature.screen.element.state
 * - Bundled loading strategy (all locales loaded at startup)
 * 
 * Fallback Chain:
 * - User preference → Browser locale → lv (default) → en (final fallback)
 * 
 * Locales:
 * - en: English (source locale, canonical keyset)
 * - lv: Latvian (runtime default for Latvia launch)
 * - ru: Russian
 * 
 * Key Convention Examples:
 * - header.dashboard: Header component, dashboard link
 * - training.actions.report: Training feature, actions section, report button
 * - dashboard.stats.detectionRate: Dashboard feature, stats section, detection rate
 * 
 * See i18n-glossary.md for locked term translations and quality guidelines.
 */
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
    fallbackLng: {
      default: ['lv', 'en'],
      lv: ['en'],
      ru: ['en']
    },
    supportedLngs: ['en', 'lv', 'ru'],
    lng: undefined,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'inbox-arena-language',
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[MISSING:${key}] in ${lngs.join(', ')}`);
      }
    },
    parseMissingKeyHandler: (key) => {
      if (import.meta.env.DEV) {
        return `[MISSING:${key}]`;
      }
      return key;
    },
  });

export default i18n;
