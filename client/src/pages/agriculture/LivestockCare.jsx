import React, { useEffect, useState } from "react";
import { Bell, HeartPulse, ShieldCheck, Utensils } from "lucide-react";
import Alert from "../../components/Alert";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { EmptyState, PageHeader } from "./AgriComponents";

export default function LivestockCare() {
  const { language } = useAccessibility();
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    http
      .get("/livestock/info")
      .then((res) => setAnimals(res.data.animals || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load livestock care."));
  }, []);

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow="Livestock care" title="Animal health, feeding, vaccination, and emergency guidance">
        Support for cow, buffalo, goat, poultry, and sheep care routines.
      </PageHeader>
      {error ? <Alert type="error">{error}</Alert> : null}
      {!animals.length ? <EmptyState>Loading livestock care records...</EmptyState> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {animals.map((animal) => (
          <article key={animal.animal} className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{localizeText(animal.animal, language)}</h2>
            <CareBlock icon={Utensils} title="Feeding schedule" items={animal.feeding} language={language} />
            <CareBlock icon={ShieldCheck} title="Vaccination schedule" items={animal.vaccination} language={language} />
            <CareBlock icon={HeartPulse} title="Hygiene practices" items={animal.hygiene} language={language} />
            <p className="mt-4 text-sm text-slate-700"><span className="font-bold">{localizeText("Breeding", language)}:</span> {localizeText(animal.breeding, language)}</p>
            <p className="mt-2 text-sm text-slate-700"><span className="font-bold">{localizeText("Disease prevention", language)}:</span> {localizeText(animal.prevention, language)}</p>
            <p className="mt-4 inline-flex items-start gap-2 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700"><Bell size={17} /> {localizeText(animal.emergency, language)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CareBlock({ icon: Icon, title, items = [], language }) {
  return (
    <div className="mt-4">
      <h3 className="inline-flex items-center gap-2 font-bold text-slate-950"><Icon size={18} /> {localizeText(title, language)}</h3>
      <ul className="mt-2 grid gap-1 text-sm text-slate-600">
        {items.map((item) => <li key={item}>• {localizeText(item, language)}</li>)}
      </ul>
    </div>
  );
}
