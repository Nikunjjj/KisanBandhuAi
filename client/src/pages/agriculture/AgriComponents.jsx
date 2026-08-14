import React from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PageHeader({ eyebrow, title, children }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md bg-leaf px-5 py-6 text-white shadow-sm sm:px-7">
      <p className="text-sm font-semibold text-green-100">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      {children ? <p className="mt-3 max-w-3xl text-green-50">{children}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, subtext, icon: Icon, tone = "green" }) {
  const tones = {
    green: "bg-green-100 text-leaf",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <article className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
      {Icon ? (
        <div className={`mb-4 grid h-11 w-11 place-items-center rounded-md ${tones[tone] || tones.green}`}>
          <Icon size={22} />
        </div>
      ) : null}
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
      {subtext ? <p className="mt-2 text-sm text-slate-500">{subtext}</p> : null}
    </article>
  );
}

export function AdvisoryCard({ alert }) {
  const severity = {
    high: "border-rose-200 bg-rose-50 text-rose-800",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-green-200 bg-green-50 text-green-800",
    positive: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-700"
  };

  return (
    <article className={`rounded-md border p-4 ${severity[alert.severity] || severity.neutral}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="font-bold">{alert.type || alert.cropName || "Advisory"}</p>
          <p className="mt-1 text-sm">{alert.message}</p>
        </div>
      </div>
    </article>
  );
}

export function TrendIcon({ trend }) {
  if (trend === "up") return <ArrowUpRight className="text-green-600" size={18} />;
  if (trend === "down") return <ArrowDownRight className="text-rose-600" size={18} />;
  return <Minus className="text-slate-500" size={18} />;
}

export function EmptyState({ children = "Information is being prepared." }) {
  return <div className="rounded-md border border-dashed border-green-200 bg-white p-8 text-center text-slate-600">{children}</div>;
}
