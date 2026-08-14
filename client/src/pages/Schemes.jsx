import React, { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, Filter, Flame, Mic, Plus, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Alert from "../components/Alert";
import SchemeCard from "../components/SchemeCard";
import SelectField from "../components/SelectField";
import { useAccessibility } from "../context/AccessibilityContext";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";
import { localizeCategory, localizeText } from "../utils/localize";
import { schemeCategories } from "../utils/schemeOptions";
import { getSpeechRecognition } from "../utils/speech";

const defaultFilters = {
  search: "",
  category: "",
  state: "",
  ministry: "",
  deadline: "",
  trending: ""
};

export default function Schemes() {
  const { user } = useAuth();
  const { speechLang } = useAccessibility();
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;
  const [filters, setFilters] = useState(defaultFilters);
  const [meta, setMeta] = useState({ categories: schemeCategories, states: [], ministries: [] });
  const [schemes, setSchemes] = useState([]);
  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("limit", "12");
    return params.toString();
  }, [filters]);

  async function loadSchemes() {
    setLoading(true);
    setError("");

    try {
      const [metaRes, listRes, latestRes, trendingRes, bookmarkRes] = await Promise.all([
        http.get("/schemes/meta"),
        http.get(`/schemes?${query}`),
        http.get("/schemes?latest=true&limit=4"),
        http.get("/schemes?trending=true&limit=4"),
        http.get("/schemes/bookmarks")
      ]);

      setMeta({
        categories: metaRes.data.categories?.length ? metaRes.data.categories : schemeCategories,
        states: metaRes.data.states || [],
        ministries: metaRes.data.ministries || []
      });
      setSchemes(listRes.data.schemes);
      setLatest(latestRes.data.schemes);
      setTrending(trendingRes.data.schemes);
      setBookmarks(bookmarkRes.data.schemes);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load schemes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemes();
  }, [query]);

  async function toggleBookmark(scheme) {
    try {
      const { data } = await http.post(`/schemes/${scheme._id}/bookmark`);
      const update = (item) => (item._id === scheme._id ? { ...item, isBookmarked: data.isBookmarked } : item);
      setSchemes((items) => items.map(update));
      setLatest((items) => items.map(update));
      setTrending((items) => items.map(update));
      setBookmarks((items) => (data.isBookmarked ? [{ ...scheme, isBookmarked: true }, ...items] : items.filter((item) => item._id !== scheme._id)));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update bookmark.");
    }
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function applyVoiceCommand(transcript) {
    const command = transcript.toLowerCase();
    const nextFilters = { ...defaultFilters, search: transcript };

    const categoryMap = [
      [["irrigation", "सिंचाई", "ನೀರಾವರಿ"], "Irrigation support"],
      [["solar", "सोलर", "सौर", "ಸೌರ"], "Solar panel subsidy schemes"],
      [["insurance", "crop insurance", "फसल बीमा", "ಬೆಳೆ ವಿಮೆ"], "Crop damage and insurance schemes"],
      [["drip", "sprinkler", "ड्रिप", "स्प्रिंकलर"], "Drip and sprinkler subsidies"],
      [["seed", "बीज", "ಬೀಜ"], "Crop seed purchase schemes"],
      [["livestock", "dairy", "पशुधन", "डेयरी", "ಪಶು", "ಹಾಲು"], "Livestock and dairy schemes"],
      [["dbt", "direct benefit", "डीबीटी", "ಡಿಬಿಟಿ"], "DBT schemes"],
      [["housing", "आवास", "ಮನೆ", "ವಸತಿ"], "Housing schemes"],
      [["water", "drinking water", "पानी", "जल", "ನೀರು"], "Water and clean drinking water schemes"],
      [["financial", "loan", "finance", "वित्तीय", "ಸಹಾಯ"], "Financial assistance schemes"]
    ];

    const match = categoryMap.find(([terms]) => terms.some((term) => command.includes(term)));
    if (match) {
      nextFilters.category = match[1];
      nextFilters.search = "";
    }

    setFilters(nextFilters);
    setVoiceMessage(transcript);
  }

  function startVoiceSearch() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError("Voice search is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    setVoiceMessage("");

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      applyVoiceCommand(transcript);
    };
    recognition.onerror = () => {
      setError("Voice search could not hear clearly. Please try again.");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-md bg-leaf px-5 py-6 text-white shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-green-100">{t("governmentExplorer")}</p>
          <h1 className="mt-2 text-3xl font-bold">{t("findSchemesHeadline")}</h1>
          <p className="mt-3 max-w-3xl text-green-50">
            {t("schemeSearchHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/schemes/bookmarks" className="focus-ring inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 font-bold text-leaf">
            <BookmarkCheck size={18} /> {t("bookmarks")}
          </Link>
          {user?.role === "Admin" ? (
            <Link to="/schemes/new" className="focus-ring inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 font-bold text-white">
              <Plus size={18} /> {t("addScheme", "Add scheme")}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr]">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{t("searchSchemes")}</span>
            <div className="flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-leaf focus-within:ring-offset-2">
              <span className="grid w-10 place-items-center text-slate-500">
                <Search size={18} />
              </span>
              <input
                className="w-full rounded-md py-2.5 pr-3 outline-none"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder={t("schemeSearchPlaceholder")}
              />
            </div>
          </label>
          <SelectField label={t("category")} value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">{t("allCategories")}</option>
            {meta.categories.map((item) => (
              <option key={item} value={item}>{localizeCategory(item, language)}</option>
            ))}
          </SelectField>
          <SelectField label={t("state")} value={filters.state} onChange={(event) => updateFilter("state", event.target.value)}>
            <option value="">{t("allStates")}</option>
            {meta.states.map((item) => (
              <option key={item} value={item}>{localizeText(item, language)}</option>
            ))}
          </SelectField>
          <SelectField label={t("ministry")} value={filters.ministry} onChange={(event) => updateFilter("ministry", event.target.value)}>
            <option value="">{t("allMinistries")}</option>
            {meta.ministries.map((item) => (
              <option key={item} value={item}>{localizeText(item, language)}</option>
            ))}
          </SelectField>
          <SelectField label={t("filters")} value={filters.trending || filters.deadline} onChange={(event) => {
            const value = event.target.value;
            setFilters((current) => ({ ...current, trending: value === "true" ? "true" : "", deadline: value === "open" ? "open" : "" }));
          }}>
            <option value="">{t("anyScheme")}</option>
            <option value="true">{t("trending")}</option>
            <option value="open">{t("openDeadline")}</option>
          </SelectField>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${listening ? "bg-leaf text-white" : "border border-leaf text-leaf"}`}
          >
            <Mic size={16} /> {listening ? t("listening") : t("voiceSearch")}
          </button>
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"
          >
            <Filter size={16} /> {t("clearFilters")}
          </button>
        </div>
        {voiceMessage ? <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-leaf">"{voiceMessage}"</p> : null}
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_310px]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">{t("allSchemes")}</h2>
            <p className="text-sm font-medium text-slate-500">{loading ? t("loading") : `${schemes.length} ${t("showResults")}`}</p>
          </div>
          {schemes.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {schemes.map((scheme) => (
                <SchemeCard key={scheme._id} scheme={scheme} onBookmark={toggleBookmark} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-green-200 bg-white p-8 text-center text-slate-600">
              {loading ? t("loadingSchemeRecords") : t("noSchemes")}
            </div>
          )}
        </div>

        <aside className="grid h-fit gap-4">
          <SideList title={t("trendingSchemes")} icon={Flame} items={trending} />
          <SideList title={t("latestSchemes")} icon={Sparkles} items={latest} />
          <SideList title={t("yourBookmarks")} icon={BookmarkCheck} items={bookmarks.slice(0, 4)} />
        </aside>
      </div>
    </section>
  );
}

function SideList({ title, icon: Icon, items }) {
  const { t, i18n } = useTranslation("schemes");
  const language = i18n.language;

  return (
    <article className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
        <Icon size={18} className="text-leaf" /> {title}
      </h2>
      <div className="mt-3 grid gap-3">
        {items.length ? (
          items.map((scheme) => (
            <Link key={scheme._id} to={`/schemes/${scheme._id}`} className="rounded-md border border-slate-100 p-3 hover:bg-green-50">
              <p className="text-sm font-bold leading-5 text-slate-950">{localizeText(scheme.schemeName, language)}</p>
              <p className="mt-1 text-xs text-slate-500">{localizeCategory(scheme.category, language)}</p>
            </Link>
          ))
        ) : (
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">{t("noRecordsYet", "No records yet.")}</p>
        )}
      </div>
    </article>
  );
}
