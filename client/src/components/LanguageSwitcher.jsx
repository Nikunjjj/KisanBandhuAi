import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const { setLanguage } = useAccessibility();

  const languages = [
    { code: "en", name: t("languages.en"), flag: "🇬🇧" },
    { code: "hi", name: t("languages.hi"), flag: "🇮🇳" },
    { code: "kn", name: t("languages.kn"), flag: "🇮🇳" }
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          title={t("changeLanguage")}
        >
          <Globe size={16} />
          {languages.find((l) => l.code === i18n.language)?.flag}
        </button>
        <div className="absolute right-0 top-full mt-2 hidden gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-lg group-hover:flex flex-col z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setLanguage(lang.code);
              }}
              className={`text-left px-3 py-2 rounded-md text-sm font-bold whitespace-nowrap ${
                i18n.language === lang.code
                  ? "bg-leaf text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
