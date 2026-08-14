import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import SchemeCard from "../components/SchemeCard";
import { http } from "../api/http";

export default function BookmarkedSchemes() {
  const { t } = useTranslation("schemes");
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadBookmarks() {
    try {
      const { data } = await http.get("/schemes/bookmarks");
      setSchemes(data.schemes);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookmarked schemes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function toggleBookmark(scheme) {
    try {
      await http.post(`/schemes/${scheme._id}/bookmark`);
      setSchemes((items) => items.filter((item) => item._id !== scheme._id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update bookmark.");
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{t("bookmarkedSchemes", "Bookmarked schemes")}</h1>
          <p className="mt-1 text-slate-600">{t("bookmarkedSchemesIntro", "Saved schemes for quick access during application preparation.")}</p>
        </div>
        <Link to="/schemes" className="focus-ring w-fit rounded-md bg-leaf px-4 py-2 font-bold text-white">
          {t("browseAllSchemes", "Browse all schemes")}
        </Link>
      </div>
      {error ? <Alert type="error">{error}</Alert> : null}
      {schemes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme._id} scheme={scheme} onBookmark={toggleBookmark} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-green-200 bg-white p-8 text-center text-slate-600">
          {loading ? t("loadingBookmarks", "Loading bookmarks...") : t("noBookmarkedSchemes", "No bookmarked schemes yet.")}
        </div>
      )}
    </section>
  );
}
