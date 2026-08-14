import React, { useEffect, useState } from "react";
import { Sprout, Thermometer, Waves } from "lucide-react";
import Alert from "../../components/Alert";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { EmptyState, PageHeader } from "./AgriComponents";

export default function CropEncyclopedia() {
  const { language, t } = useAccessibility();
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const query = search ? `?crop=${encodeURIComponent(search)}` : "";
    http
      .get(`/crop/info${query}`)
      .then((res) => setCrops(res.data.crops || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load crop information."));
  }, [search]);

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow={t("knowledgeCenter")} title={t("cropEncyclopediaTitle")}>
        {t("cropEncyclopediaIntro")}
      </PageHeader>

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">{t("searchCrop")}</span>
          <input className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchCropPlaceholder")} />
        </label>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
      {!crops.length ? <EmptyState>No crop record found.</EmptyState> : null}

      <div className="grid gap-5">
        {crops.map((crop) => (
          <article key={crop.cropName} className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <p className="text-sm font-semibold text-leaf">{crop.scientificName}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{localizeText(crop.cropName, language)}</h2>
                <p className="mt-2 max-w-3xl text-slate-600">{localizeText(crop.overview, language)}</p>
              </div>
              <div className="grid min-w-64 gap-2 text-sm">
                <p className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 font-semibold text-leaf"><Sprout size={16} /> {localizeText(crop.season, language)}</p>
                <p className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 font-semibold text-sky-700"><Waves size={16} /> {localizeText(crop.water, language)}</p>
                <p className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 font-semibold text-amber-700"><Thermometer size={16} /> {crop.idealTemperature}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-slate-100 p-4">
                <h3 className="font-bold text-slate-950">{t("farmingGuidance")}</h3>
                <dl className="mt-3 grid gap-3 text-sm">
                  <div><dt className="font-semibold text-slate-500">{t("soil")}</dt><dd className="text-slate-800">{localizeText(crop.soil, language)}</dd></div>
                  <div><dt className="font-semibold text-slate-500">{t("landPreparation")}</dt><dd className="text-slate-800">{localizeText(crop.guidance?.landPreparation, language)}</dd></div>
                  <div><dt className="font-semibold text-slate-500">{t("seedSelection")}</dt><dd className="text-slate-800">{localizeText(crop.guidance?.seedSelection, language)}</dd></div>
                  <div><dt className="font-semibold text-slate-500">{t("irrigation")}</dt><dd className="text-slate-800">{localizeText(crop.guidance?.irrigation, language)}</dd></div>
                  <div><dt className="font-semibold text-slate-500">{t("harvest")}</dt><dd className="text-slate-800">{localizeText(crop.guidance?.harvest, language)}</dd></div>
                </dl>
              </div>
              <div className="rounded-md border border-slate-100 p-4">
                <h3 className="font-bold text-slate-950">{localizeText("Growth timeline", language)}</h3>
                <div className="mt-4 grid gap-3">
                  {(crop.timeline || []).map((stage, index) => (
                    <div key={stage} className="flex gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-leaf text-sm font-bold text-white">{index + 1}</span>
                      <div>
                        <p className="font-bold text-slate-900">{t("stage")} {index + 1}</p>
                        <p className="text-sm text-slate-600">{localizeText(stage, language)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <h3 className="mt-5 font-bold text-slate-950">{t("fertilizerRecommendations")}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(crop.fertilizers || []).map((item) => <span key={item} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{localizeText(item, language)}</span>)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
