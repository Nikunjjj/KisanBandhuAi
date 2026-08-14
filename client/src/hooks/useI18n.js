import { useTranslation } from "react-i18next";
import { useAccessibility } from "./AccessibilityContext";

export function useI18n() {
  const { t: i18nT, i18n } = useTranslation();
  const { speechLang } = useAccessibility();

  // Wrapper that supports both old localize.js keys and new i18next keys
  const t = (key, defaultValue = key) => {
    const value = i18nT(key, { defaultValue });
    return value === key ? defaultValue : value;
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("kisanbandhu_language", lang);
  };

  return { t, i18n, language: i18n.language, speechLang, changeLanguage };
}
