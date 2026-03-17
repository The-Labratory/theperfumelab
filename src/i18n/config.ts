import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { createMissingKeyHandler } from "./translationBackend";

import en from "./locales/en.json";
import de from "./locales/de.json";
import ar from "./locales/ar.json";
import tr from "./locales/tr.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      ar: { translation: ar },
      tr: { translation: tr },
      es: { translation: es },
      fr: { translation: fr },
    },
    fallbackLng: "de",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    saveMissing: true,
    missingKeyHandler: createMissingKeyHandler(i18n),
  });

export default i18n;

export const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];
