import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import kn from "./locales/kn.json";

const resources = { en, hi, kn };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("kisanbandhu_language") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    ns: ["common", "navigation", "notifications", "dashboard", "schemes", "chatbot", "agriculture", "advisory", "crops", "farming", "data"],
    defaultNS: "common"
  });

export default i18n;
