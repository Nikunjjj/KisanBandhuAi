import React from "react";
import { Bookmark, CalendarDays, ExternalLink, Flame, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RecommendationBadge from "./RecommendationBadge";
import { localizeCategory, localizeText } from "../utils/localize";

const dateLocales = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN"
};

function formatDate(value, fallback, language = "en") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(dateLocales[language] || "en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function SchemeCard({ scheme, onBookmark }) {
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;
  const states = scheme.stateApplicability?.slice(0, 2).map((item) => localizeText(item, language)).join(", ");

  return (
    <article className="flex h-full flex-col rounded-md border border-green-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-leaf">{localizeCategory(scheme.category, language)}</span>
        <RecommendationBadge recommendation={scheme.recommendation} />
        {scheme.isTrending ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
            <Flame size={14} /> {t("trending", "Trending")}
          </span>
        ) : null}
      </div>

      <Link to={`/schemes/${scheme._id}`} className="text-lg font-bold leading-6 text-slate-950 hover:text-leaf">
        {localizeText(scheme.schemeName, language)}
      </Link>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{localizeText(scheme.description, language)}</p>
      {scheme.recommendation?.reasons?.length ? (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs font-semibold leading-5 text-leaf">
          {localizeText(scheme.recommendation.reasons[0], language)}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <MapPin size={16} className="text-leaf" />
          {states}
          {scheme.stateApplicability?.length > 2 ? ` +${scheme.stateApplicability.length - 2}` : ""}
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} className="text-leaf" />
          {t("deadline", "Deadline")}: {formatDate(scheme.applicationDeadline, t("noDeadline", "No deadline"), language)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Link to={`/schemes/${scheme._id}`} className="focus-ring rounded-md bg-leaf px-3 py-2 text-sm font-bold text-white">
          {t("openDetails", "View details")}
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onBookmark?.(scheme)}
            className={`focus-ring rounded-md border p-2 ${scheme.isBookmarked ? "border-leaf bg-green-50 text-leaf" : "border-slate-200 text-slate-600"}`}
            title={scheme.isBookmarked ? t("removeBookmark", "Remove bookmark") : t("bookmarkScheme", "Bookmark scheme")}
          >
            <Bookmark size={18} fill={scheme.isBookmarked ? "currentColor" : "none"} />
          </button>
          <a
            href={scheme.applicationLink}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-md border border-slate-200 p-2 text-slate-600"
            title={t("openApplicationPortal", "Open application portal")}
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}
