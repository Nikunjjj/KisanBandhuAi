import React from "react";
import { CloudSun, HeartPulse, Newspaper, Sprout, TrendingUp, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { PageHeader } from "./AgriComponents";

const modules = [
  { title: "Weather dashboard", path: "/agriculture/weather", icon: CloudSun, text: "Live conditions, forecasts, rainfall, and farm alerts." },
  { title: "Market prices", path: "/agriculture/market", icon: TrendingUp, text: "Crop prices, mandi trends, and selling insights." },
  { title: "Crop encyclopedia", path: "/agriculture/crops", icon: Wheat, text: "Crop seasons, soil, water, fertilizer, and growth stages." },
  { title: "Disease awareness", path: "/agriculture/diseases", icon: HeartPulse, text: "Plant and livestock symptoms, prevention, and treatment." },
  { title: "Livestock care", path: "/agriculture/livestock", icon: Sprout, text: "Feeding, vaccination, hygiene, breeding, and emergency advice." },
  { title: "Agriculture news", path: "/agriculture/news", icon: Newspaper, text: "Government updates, schemes, market news, and technology." }
];

export default function AgricultureHub() {
  const { language } = useAccessibility();

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow="KrishiMitra Phase 7" title="Agricultural Intelligence Module">
        A smart farming assistant for weather, market insights, crop guidance, disease awareness, livestock care, seasonal planning, and news.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ title, path, icon: Icon, text }) => (
          <Link key={path} to={path} className="focus-ring rounded-md border border-green-100/60 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 p-5 shadow-sm transition hover:border-leaf">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-green-100 text-leaf dark:bg-leaf-950 dark:text-emerald-300"><Icon size={22} /></span>
            <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{localizeText(title, language)}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{localizeText(text, language)}</p>
          </Link>
        ))}
      </div>

      <Link to="/agriculture/seasonal" className="focus-ring rounded-md border border-leaf bg-green-50 dark:border-leaf-700 dark:bg-slate-900 dark:text-slate-100 p-5 text-leaf shadow-sm">
        <h2 className="text-xl font-bold">{localizeText("Seasonal farming assistant", language)}</h2>
        <p className="mt-2 text-sm font-semibold">{localizeText("Get current-month recommendations based on region, crop, and weather.", language)}</p>
      </Link>
    </section>
  );
}
