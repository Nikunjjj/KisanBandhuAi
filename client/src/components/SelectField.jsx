import React from "react";
import { useTranslation } from "react-i18next";

export default function SelectField({ label, children, ...props }) {
  const { t } = useTranslation();

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{t(label, label)}</span>
      <select
        className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
