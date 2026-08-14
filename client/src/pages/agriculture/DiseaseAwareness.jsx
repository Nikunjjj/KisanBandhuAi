import React, { useEffect, useState } from "react";
import { Bug, HeartPulse } from "lucide-react";
import Alert from "../../components/Alert";
import SelectField from "../../components/SelectField";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { AdvisoryCard, EmptyState, PageHeader } from "./AgriComponents";

export default function DiseaseAwareness() {
  const { language } = useAccessibility();
  const [type, setType] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    http
      .get(`/disease/info${type ? `?type=${type}` : ""}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load disease advisories."));
  }, [type]);

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow="Disease awareness" title="Plant and livestock advisory system">
        Learn symptoms, causes, prevention, treatment, pesticide guidance, and vaccination reminders.
      </PageHeader>

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm md:max-w-sm">
        <SelectField label={localizeText("Section", language)} value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">{localizeText("All diseases", language)}</option>
          <option value="Plant">{localizeText("Plant diseases", language)}</option>
          <option value="Livestock">{localizeText("Livestock diseases", language)}</option>
        </SelectField>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid gap-3">
        {(data?.alerts || []).map((message) => <AdvisoryCard key={message} alert={{ type: "Smart disease alert", severity: "medium", message }} />)}
      </div>

      {!data ? <EmptyState>Loading disease awareness module...</EmptyState> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(data?.diseases || []).map((disease) => (
          <article key={disease.name} className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-md ${disease.type === "Plant" ? "bg-green-100 text-leaf" : "bg-rose-100 text-rose-700"}`}>
                {disease.type === "Plant" ? <Bug size={22} /> : <HeartPulse size={22} />}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">{localizeText(disease.type, language)}</p>
                <h2 className="text-xl font-bold text-slate-950">{localizeText(disease.name, language)}</h2>
              </div>
            </div>
            <InfoList title="Symptoms" items={disease.symptoms} language={language} />
            <InfoList title="Causes" items={disease.causes} language={language} />
            <InfoList title="Prevention" items={disease.prevention} language={language} />
            <p className="mt-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-leaf">{localizeText(disease.treatment, language)}</p>
            {disease.recommendedPesticides?.length ? <InfoList title="Recommended pesticides" items={disease.recommendedPesticides} language={language} /> : null}
            {disease.vaccination ? <p className="mt-3 text-sm font-semibold text-slate-700">{localizeText("Vaccination", language)}: {localizeText(disease.vaccination, language)}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoList({ title, items = [], language }) {
  return (
    <div className="mt-4">
      <h3 className="font-bold text-slate-950">{localizeText(title, language)}</h3>
      <ul className="mt-2 grid gap-1 text-sm text-slate-600">
        {items.map((item) => <li key={item}>• {localizeText(item, language)}</li>)}
      </ul>
    </div>
  );
}
