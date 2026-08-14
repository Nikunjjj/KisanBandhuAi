import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Map } from "lucide-react";
import Alert from "../../components/Alert";
import SelectField from "../../components/SelectField";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { useAuth } from "../../context/AuthContext";
import { localizeText } from "../../utils/localize";
import { EmptyState, PageHeader } from "./AgriComponents";

export default function SeasonalAssistant() {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const [form, setForm] = useState({
    month: String(new Date().getMonth() + 1),
    region: user?.profile?.district || "",
    cropType: user?.profile?.cropType?.[0] || "",
    weather: "humid"
  });
  const [seasonal, setSeasonal] = useState(null);
  const [error, setError] = useState("");

  const query = useMemo(() => new URLSearchParams(form).toString(), [form]);

  useEffect(() => {
    http
      .get(`/season/recommendations?${query}`)
      .then((res) => setSeasonal(res.data.seasonal))
      .catch((err) => setError(err.response?.data?.message || "Unable to load seasonal recommendations."));
  }, [query]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow="Seasonal assistant" title="Smart seasonal farming recommendations">
        Suggestions based on month, region, crop type, and current weather conditions.
      </PageHeader>

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <SelectField label={localizeText("Month", language)} value={form.month} onChange={(event) => update("month", event.target.value)}>
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>{localizeText(new Date(2026, index, 1).toLocaleString("en-IN", { month: "long" }), language)}</option>
            ))}
          </SelectField>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{localizeText("Region", language)}</span>
            <input className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" value={form.region} onChange={(event) => update("region", event.target.value)} placeholder={localizeText("District or state", language)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{localizeText("Crop type", language)}</span>
            <input className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" value={form.cropType} onChange={(event) => update("cropType", event.target.value)} placeholder={localizeText("Rice, cotton...", language)} />
          </label>
          <SelectField label={localizeText("Weather", language)} value={form.weather} onChange={(event) => update("weather", event.target.value)}>
            <option value="humid">{localizeText("Humid", language)}</option>
            <option value="dry">{localizeText("Dry", language)}</option>
            <option value="rainy">{localizeText("Rainy", language)}</option>
          </SelectField>
        </div>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
      {!seasonal ? <EmptyState>Preparing seasonal plan...</EmptyState> : null}

      {seasonal ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-green-100 text-leaf"><CalendarDays size={22} /></span>
              <div>
                <p className="text-sm font-semibold text-slate-500">{seasonal.region}</p>
                <h2 className="text-2xl font-bold text-slate-950">{localizeText(seasonal.month, language)} {localizeText("plan", language)}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {seasonal.recommendations.map((item) => (
                <p key={item} className="flex gap-3 rounded-md bg-green-50 p-3 text-sm font-semibold text-leaf">
                  <CheckCircle2 className="shrink-0" size={18} /> {localizeText(item, language)}
                </p>
              ))}
            </div>
          </article>
          <article className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950"><Map size={20} /> {localizeText("Upcoming farming activities", language)}</h2>
            <div className="mt-4 grid gap-4">
              {seasonal.activities.map((activity) => (
                <div key={activity.title} className="rounded-md border border-slate-100 p-4">
                  <p className="font-bold text-slate-950">{localizeText(activity.title, language)}</p>
                  <p className="mt-1 text-sm text-slate-600">{localizeText(activity.task, language)}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
