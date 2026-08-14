import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, CalendarDays, CheckCircle2, ExternalLink, FileText, Landmark, MapPin, Pencil, Volume2, VolumeX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Alert from "../components/Alert";
import RecommendationBadge from "../components/RecommendationBadge";
import { useAccessibility } from "../context/AccessibilityContext";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";
import { localizeCategory, localizeText } from "../utils/localize";
import { speakText, stopSpeech } from "../utils/speech";

const dateLocales = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN"
};

function formatDate(value, language = "en") {
  return new Intl.DateTimeFormat(dateLocales[language] || "en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default function SchemeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { speechLang } = useAccessibility();
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;
  const [scheme, setScheme] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScheme() {
      try {
        const { data } = await http.get(`/schemes/${id}`);
        setScheme(data.scheme);
        const eligibilityRes = await http.get(`/recommendations/eligibility/${id}`);
        setEligibility(eligibilityRes.data.eligibility);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load scheme details.");
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [id]);

  async function toggleBookmark() {
    try {
      const { data } = await http.post(`/schemes/${id}/bookmark`);
      setScheme((current) => ({ ...current, isBookmarked: data.isBookmarked }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update bookmark.");
    }
  }

  const narrationText = useMemo(() => {
    if (!scheme) return "";
    const localizedStates = (scheme.stateApplicability || []).map((item) => localizeText(item, language));
    return [
      localizeText(scheme.schemeName, language),
      localizeText(scheme.description, language),
      `${t("category")}: ${localizeCategory(scheme.category, language)}.`,
      `${t("benefits")}: ${(scheme.benefits || []).map((item) => localizeText(item, language)).join(". ")}.`,
      `${t("eligibility")}: ${(scheme.eligibilityCriteria || []).map((item) => localizeText(item, language)).join(". ")}.`,
      `${t("documents")}: ${(scheme.requiredDocuments || []).map((item) => localizeText(item, language)).join(". ")}.`,
      `${t("deadline")}: ${formatDate(scheme.applicationDeadline, language)}.`,
      `${t("stateApplicability")}: ${localizedStates.join(", ")}.`
    ].join(" ");
  }, [scheme, language, t]);

  function toggleNarration() {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    const started = speakText(narrationText, speechLang);
    if (!started) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }
    setSpeaking(true);
    window.setTimeout(() => setSpeaking(false), Math.min(Math.max(narrationText.length * 55, 5000), 60000));
  }

  if (loading) {
    return <section className="rounded-md border border-green-100 bg-white p-6 shadow-sm">{t("loadingSchemeDetails", "Loading scheme details...")}</section>;
  }

  if (error && !scheme) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <section className="grid gap-6">
      {error ? <Alert type="error">{error}</Alert> : null}
      <Link to="/schemes" className="focus-ring inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
        <ArrowLeft size={17} /> {t("backToSchemes")}
      </Link>

      <article className="rounded-md border border-green-100 bg-white shadow-sm">
        <div className="border-b border-green-100 bg-green-50 px-5 py-6 sm:px-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-leaf">{localizeCategory(scheme.category, language)}</span>
              <span className="ml-2">
                <RecommendationBadge recommendation={eligibility} />
              </span>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-950">{localizeText(scheme.schemeName, language)}</h1>
              <p className="mt-3 max-w-4xl leading-7 text-slate-700">{localizeText(scheme.description, language)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleNarration}
                className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 font-bold ${speaking ? "bg-red-50 text-red-700" : "bg-white text-leaf"}`}
                title={speaking ? t("stop") : t("listen")}
              >
                {speaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                {speaking ? t("stop") : t("listen")}
              </button>
              {user?.role === "Admin" ? (
                <Link to={`/schemes/${scheme._id}/edit`} className="focus-ring rounded-md bg-slate-950 p-2 text-white" title={t("editScheme", "Edit scheme")}>
                  <Pencil size={20} />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={toggleBookmark}
                className={`focus-ring rounded-md border p-2 ${scheme.isBookmarked ? "border-leaf bg-white text-leaf" : "border-slate-200 bg-white text-slate-600"}`}
                title={scheme.isBookmarked ? t("removeBookmark", "Remove bookmark") : t("bookmarkScheme", "Bookmark scheme")}
              >
                <Bookmark size={20} fill={scheme.isBookmarked ? "currentColor" : "none"} />
              </button>
              <a href={scheme.applicationLink} target="_blank" rel="noreferrer" className="focus-ring rounded-md bg-leaf p-2 text-white" title={t("applyOnline", "Apply online")}>
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1fr_330px]">
          <div className="grid gap-6">
            <DetailList title={t("benefits")} items={scheme.benefits} language={language} />
            <DetailList title={t("eligibility")} items={scheme.eligibilityCriteria} language={language} />
            <DetailList title={t("documents")} items={scheme.requiredDocuments} language={language} />
          </div>

          <aside className="grid h-fit gap-4">
            {eligibility ? <EligibilityPanel eligibility={eligibility} /> : null}
            <InfoRow icon={CalendarDays} label={t("deadline")} value={formatDate(scheme.applicationDeadline, language)} />
            <InfoRow icon={MapPin} label={t("stateApplicability")} value={scheme.stateApplicability?.map((item) => localizeText(item, language)).join(", ")} />
            <InfoRow icon={Landmark} label={t("ministryDepartment")} value={localizeText(scheme.ministryDepartment, language)} />
            <InfoRow icon={FileText} label={t("status", "Status")} value={localizeText(scheme.status, language)} />
            <a href={scheme.applicationLink} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">
              {t("applyOnline")} <ExternalLink size={18} />
            </a>
          </aside>
        </div>
      </article>
    </section>
  );
}

function EligibilityPanel({ eligibility }) {
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;

  return (
    <div className="rounded-md border border-green-100 bg-green-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-leaf">
          <CheckCircle2 size={18} /> {t("eligibilityPrediction", "Eligibility prediction")}
        </div>
        <RecommendationBadge recommendation={eligibility} />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-leaf" style={{ width: `${eligibility.score}%` }} />
      </div>
      {eligibility.reasons?.length ? (
        <ul className="mt-3 grid gap-2 text-sm text-slate-700">
          {eligibility.reasons.map((reason) => (
            <li key={reason}>{localizeText(reason, language)}</li>
          ))}
        </ul>
      ) : null}
      {eligibility.blockers?.length ? (
        <div className="mt-3 rounded-md bg-white p-3 text-sm text-red-700">
          {eligibility.blockers.map((blocker) => localizeText(blocker, language)).join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function DetailList({ title, items, language }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-3 grid gap-2">
        {items?.map((item) => (
          <li key={item} className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
            {localizeText(item, language)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-leaf">
        <Icon size={18} /> {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
