import React, { useEffect, useState, useRef } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { io } from "socket.io-client";
import Alert from "../../components/Alert";
import SelectField from "../../components/SelectField";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { EmptyState, PageHeader } from "./AgriComponents";

export default function AgricultureNews() {
  const { language, t } = useAccessibility();
  const [category, setCategory] = useState("");
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    http
      .get(`/news${category ? `?category=${encodeURIComponent(category)}` : ""}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load agriculture news."));

    // connect socket for real-time updates
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const serverUrl = API_BASE.replace(/\/api\/?$/i, "");
    const token = localStorage.getItem("kisanbandhu_token");
    const socket = io(serverUrl, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      // connected
    });

    socket.on("news:new", (article) => {
      setData((current) => {
        if (!current) return { news: [article], categories: [article.category] };
        if ((current.news || []).some((n) => n.id === article.id)) return current;
        return { news: [article, ...(current.news || [])].slice(0, 100), categories: Array.from(new Set([...(current.categories || []), article.category])) };
      });
    });

    socket.on("connect_error", () => {});

    return () => {
      socket.disconnect();
    };
  }, [category]);

  function toggleSaved(id) {
    setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="grid gap-6">
      <PageHeader eyebrow="Agriculture news" title="Government updates, schemes, market news, and farming technology">
        Stay aware of important agriculture updates in one simple feed.
      </PageHeader>

      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm md:max-w-sm">
        <SelectField label={t("category")} value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">{localizeText("Trending news", language)}</option>
          {(data?.categories || []).map((item) => <option key={item}>{localizeText(item, language)}</option>)}
        </SelectField>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
      {!data ? <EmptyState>Loading agriculture news...</EmptyState> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(data?.news || []).map((article) => (
          <article key={article.id} className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-leaf">{localizeText(article.category, language)} · {new Date(article.date).toLocaleDateString("en-IN")}</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{localizeText(article.title, language)}</h2>
            <p className="mt-3 text-sm text-slate-600">{localizeText(article.summary, language)}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => toggleSaved(article.id)} className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${saved.includes(article.id) ? "bg-leaf text-white" : "border border-leaf text-leaf"}`}>
                <Bookmark size={16} /> {localizeText(saved.includes(article.id) ? "Saved" : "Save", language)}
              </button>
              <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                <Share2 size={16} /> {localizeText("Share", language)}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
