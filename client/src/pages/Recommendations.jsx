import React, { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Sparkles, UserRoundCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import SchemeCard from "../components/SchemeCard";
import { http } from "../api/http";
import { localizeText } from "../utils/localize";

export default function Recommendations() {
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRecommendations() {
    setError("");

    try {
      const { data } = await http.get("/recommendations?limit=12");
      setRecommendations(data.recommendations);
      setSummary(data.profileSummary);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function toggleBookmark(scheme) {
    try {
      const { data } = await http.post(`/schemes/${scheme._id}/bookmark`);
      setRecommendations((items) => items.map((item) => (item._id === scheme._id ? { ...item, isBookmarked: data.isBookmarked } : item)));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update bookmark.");
    }
  }

  const highMatches = recommendations.filter((scheme) => scheme.recommendation?.eligibility === "High").length;

  return (
    <section className="grid gap-6">
      <div className="rounded-md bg-leaf px-5 py-6 text-white shadow-sm sm:px-7">
        <p className="flex items-center gap-2 text-sm font-semibold text-green-100">
          <Sparkles size={18} /> {t("smartRecommendationEngine", "Smart recommendation engine")}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{t("personalizedSchemesHeadline", "Personalized schemes ranked for your farm profile.")}</h1>
        <p className="mt-3 max-w-3xl text-green-50">
          {t("recommendationsIntro", "Recommendations use state, land size, crop type, income level, livestock ownership, farmer category, scheme deadlines, and category relevance.")}
        </p>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label={t("profileReadiness", "Profile readiness")} value={`${summary?.profileCompleteness || 0}%`} icon={UserRoundCheck} />
        <Metric label={t("highMatchSchemes", "High match schemes")} value={highMatches} icon={CheckCircle2} />
        <Metric label={t("farmerCategory", "Farmer category")} value={localizeText(summary?.farmerCategory || "Not Specified", language)} icon={CircleAlert} />
      </div>

      {summary?.profileCompleteness < 80 ? (
        <Alert type="info">
          {t("completeProfilePrompt", "Add state, land size, crop type, income category, and farmer category in your profile to improve recommendation accuracy.")}
          <Link to="/profile" className="ml-2 font-bold text-blue-900 underline">{t("updateProfile", "Update profile")}</Link>
        </Alert>
      ) : null}

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("profileSignalsUsed", "Profile signals used")}</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Signal label={t("state", "State")} value={localizeText(summary?.state || "Missing", language)} />
          <Signal label={t("landSize", "Land size")} value={`${summary?.landSize || 0} ${localizeText("acres", language)}`} />
          <Signal label={t("crops", "Crops")} value={summary?.cropType?.map((item) => localizeText(item, language)).join(", ") || localizeText("Missing", language)} />
          <Signal label={t("income", "Income")} value={localizeText(summary?.incomeCategory || "Not Specified", language)} />
          <Signal label={t("category", "Category")} value={localizeText(summary?.farmerCategory || "Not Specified", language)} />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">{t("recommendedSchemes", "Recommended schemes")}</h2>
          <p className="text-sm font-medium text-slate-500">{loading ? t("loading", "Loading...") : t("rankedCount", "{{count}} ranked", { count: recommendations.length })}</p>
        </div>
        {recommendations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((scheme) => (
              <SchemeCard key={scheme._id} scheme={scheme} onBookmark={toggleBookmark} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-green-200 bg-white p-8 text-center text-slate-600">
            {loading ? t("scoringSchemes", "Scoring schemes against your profile...") : t("noRecommendations", "No recommendations found yet.")}
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <article className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-green-50 text-leaf">
        <Icon size={21} />
      </div>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
    </article>
  );
}

function Signal({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
