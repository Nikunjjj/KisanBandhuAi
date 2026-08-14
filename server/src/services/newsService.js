import { env } from "../config/env.js";
import { emitAll } from "./socketService.js";

let cache = {
  news: [],
  categories: []
};

const POLL_INTERVAL = Number(process.env.NEWS_POLL_INTERVAL || 60) * 1000; // default 60s

function normalizeArticle(item) {
  return {
    id: item.url, // use URL as id
    title: item.title,
    summary: item.description || item.content || "",
    url: item.url,
    source: item.source?.name || "",
    date: item.publishedAt || new Date().toISOString(),
    category: "Trending"
  };
}

export function getCachedNews() {
  return cache;
}

async function fetchNewsFromProvider() {
  if (!env.newsApiKey) return null;

  try {
    // Search for agriculture-specific news with better keywords
    const queries = [
      "agricultural farming scheme",
      "crop farming subsidy",
      "livestock agriculture"
    ];
    const q = encodeURIComponent(queries[Math.floor(Math.random() * queries.length)]);
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=40&sortBy=publishedAt&apiKey=${env.newsApiKey}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) throw new Error(`News API error: ${resp.status}`);
    const data = await resp.json();
    // Filter to only articles with description/content and agriculture-related keywords
    const filtered = (data.articles || []).filter((a) => {
      const text = (a.title + " " + (a.description || "")).toLowerCase();
      return (a.description || a.content) && 
        (text.includes("farm") || text.includes("crop") || text.includes("agriculture") || 
         text.includes("livestock") || text.includes("soil") || text.includes("harvest") ||
         text.includes("fertilizer") || text.includes("pesticide") || text.includes("irrigation"));
    });
    return filtered;
  } catch (error) {
    console.error("Failed to fetch news:", error.message || error);
    return null;
  }
}

function dedupeAndMerge(newItems) {
  const existingIds = new Set(cache.news.map((n) => n.id));
  const normalized = newItems.map(normalizeArticle);
  const unique = normalized.filter((a) => !existingIds.has(a.id));
  if (unique.length === 0) return [];
  cache.news = [...unique, ...cache.news].slice(0, 100); // keep latest 100
  cache.categories = Array.from(new Set(cache.news.map((n) => n.category)));
  return unique;
}

export async function pollOnce() {
  const items = await fetchNewsFromProvider();
  if (!items) return [];
  const newArticles = dedupeAndMerge(items);
  newArticles.forEach((article) => emitAll("news:new", article));
  return newArticles;
}

let pollHandle = null;

export function startNewsService() {
  if (!env.newsApiKey) {
    console.warn("NEWS_API_KEY not set — news service disabled");
    return;
  }
  // initial fetch
  pollOnce().catch((e) => console.error(e));
  pollHandle = setInterval(() => pollOnce().catch((e) => console.error(e)), POLL_INTERVAL);
  console.log("News service started, polling every", POLL_INTERVAL / 1000, "seconds");
}

export function stopNewsService() {
  if (pollHandle) clearInterval(pollHandle);
}
