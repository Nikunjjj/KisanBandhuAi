import React from "react";
import { useTranslation } from "react-i18next";

export default function FormInput({ label, error, ...props }) {
  const { t } = useTranslation();
  const translatedProps = {
    ...props,
    placeholder: props.placeholder ? t(props.placeholder, props.placeholder) : props.placeholder
  };

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{t(label, label)}</span>
      <input
        className="focus-ring w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm"
        {...translatedProps}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{t(error, error)}</span> : null}
    </label>
  );
}
