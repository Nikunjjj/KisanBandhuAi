import React, { useEffect, useState } from "react";
import { 
  CloudSun, 
  IndianRupee, 
  ShieldCheck, 
  Tractor, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  ArrowRight,
  Droplets
} from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";
import { buildDashboardFromRecommendations, getProfileCompleteness } from "../utils/dashboardStats";

const defaultStatCards = [
  { labelKey: "stats.eligibleSchemes", icon: ShieldCheck, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", href: "/recommendations", trendKey: "stats.trends.newSchemes" },
  { labelKey: "stats.dbtPrograms", icon: IndianRupee, color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", href: "/dbt", trendKey: "stats.trends.activeAmount" },
  { labelKey: "stats.cropAdvisories", icon: Tractor, color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", href: "/agriculture", trendKey: "stats.trends.liveTips" },
  { labelKey: "stats.weatherAlerts", icon: CloudSun, color: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20", href: "/agriculture/weather", trendKey: "stats.trends.noSevereAlerts" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation(["dashboard", "common", "data"]);
  const profile = user?.profile || {};

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weatherSnippet, setWeatherSnippet] = useState({ temp: 31, condition: "Mostly Sunny", humidity: 62 });

  useEffect(() => {
  let isMounted = true;

    async function loadDashboardFallback() {
      const district = profile.district || profile.state || "Bengaluru Rural";
      const [recommendationsRes, weatherRes] = await Promise.all([
        http.get("/recommendations?limit=50"),
        http.get("/weather/alerts", { params: { district } })
      ]);
      const recommendations = recommendationsRes.data.recommendations || [];
      const weatherAlerts = weatherRes.data.alerts?.length || 0;
      return buildDashboardFromRecommendations(recommendations, profile, weatherAlerts);
    }

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get("/dashboard");
        if (isMounted) setDashboard(data.dashboard);
      } catch (primaryError) {
        try {
          const fallback = await loadDashboardFallback();
          if (isMounted) {
            setDashboard(fallback);
            setError("");
          }
        } catch {
          if (isMounted) {
            const profileScore = getProfileCompleteness(profile);
            setDashboard({
              stats: { eligibleSchemes: 0, dbtPrograms: 0, cropAdvisories: 0, weatherAlerts: 0 },
              readiness: [
                { name: "Profile", value: profileScore },
                { name: "DBT", value: 0 },
                { name: "Schemes", value: 0 },
                { name: "Advisory", value: Math.min(100, profileScore) }
              ],
              profileCompleteness: profileScore,
              topRecommendations: []
            });
            setError(
              primaryError.response?.data?.message ||
                t("dashboard:serviceStarting")
            );
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    
    // Simulate fetching weather summary for the region
    if (profile.district) {
      http.get(`/weather/forecast?district=${profile.district}`)
        .then(res => {
          if (isMounted && res.data?.current) {
            setWeatherSnippet({
              temp: res.data.current.temperature,
              condition: res.data.current.condition || "Clear Sky",
              humidity: res.data.current.humidity
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [profile.district, profile.state, profile.village, profile.landSize, profile.cropType, profile.incomeCategory, profile.farmerCategory]);

  const statValues = dashboard?.stats || {
    eligibleSchemes: 0,
    dbtPrograms: 0,
    cropAdvisories: 0,
    weatherAlerts: 0
  };

  const stats = defaultStatCards.map((card, index) => {
    const keys = ["eligibleSchemes", "dbtPrograms", "cropAdvisories", "weatherAlerts"];
    return { ...card, value: String(statValues[keys[index]] ?? 0) };
  });

  const readinessData = (dashboard?.readiness || []).map((item) => ({
    ...item,
    name: t(`dashboard:readiness.${item.name}`, { defaultValue: item.name })
  }));

  const locationLabel = profile.village || profile.district || profile.state || t("dashboard:yourRegion");
  const profileComplete = dashboard?.profileCompleteness ?? getProfileCompleteness(profile);
  const translateData = (value) => t(`data:${String(value || "").trim()}`, { defaultValue: value });

  // Generate dynamic AI Insights based on profile fields
  const getAIInsights = () => {
    const crops = profile.cropType || [];
    const items = [];
    if (crops.length > 0) {
      items.push(t("dashboard:insights.crops", { crops: crops.map((crop) => translateData(crop)).join(", ") }));
    }
    if (profile.landSize > 2) {
      items.push(t("dashboard:insights.land", { landSize: profile.landSize }));
    }
    if (weatherSnippet.humidity > 60) {
      items.push(t("dashboard:insights.humidity"));
    }
    // Default fallback
    if (items.length === 0) {
      items.push(t("dashboard:insights.default"));
    }
    return items;
  };

  return (
    <section className="grid gap-6 animate-fadeIn">
      
      {/* ── SaaS HERO GREETING BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-950 via-leaf-800 to-emerald-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-300 via-emerald-400 to-slate-900 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-green-200 border border-white/5 backdrop-blur-md">
              <UserCheck size={12} /> {t("dashboard:verifiedFarmerProfile")}
            </span>
            <h1 className="mt-4 text-3xl font-black md:text-4xl tracking-tight leading-tight">
              {t("dashboard:greeting", { name: user?.name })}
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm md:text-base text-green-100/90 leading-relaxed font-medium">
              {t("dashboard:welcomeText")} <strong className="text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">{profileComplete}%</strong>. {profileComplete >= 80 ? t("dashboard:profileCompletePersonalized") : t("dashboard:profileCompletePrompt")}
            </p>
            
            {/* Quick Action Navigation links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/recommendations" className="focus-ring inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-green-50 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-extrabold text-leaf-900 dark:text-leaf-200 transition-colors shadow-sm">
                {t("dashboard:smartRecommendations")} <ArrowRight size={13} />
              </Link>
              <Link to="/plant-doctor" className="focus-ring inline-flex items-center gap-1.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 border border-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition-colors backdrop-blur-md">
                {t("dashboard:aiPlantDiagnostics")}
              </Link>
              {user?.role === "Admin" && (
                <Link to="/admin/dashboard" className="focus-ring inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-extrabold text-white transition-colors shadow-sm">
                  <ShieldCheck size={14} /> Go to Admin Portal
                </Link>
              )}
            </div>
          </div>

          {/* Quick Weather Dashboard Snippet inside Hero */}
          <div className="flex gap-6">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-md flex flex-col justify-between min-w-[200px]">
              <div>
                <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest">{t("dashboard:currentWeather")}</p>
                <p className="text-xs font-bold text-white mt-1 truncate">{translateData(locationLabel)}</p>
              </div>
              <div className="flex items-center gap-3 my-3">
                <span className="text-3xl font-black tracking-tighter text-white">{weatherSnippet.temp}°C</span>
                <CloudSun size={28} className="text-yellow-300 shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-green-100/70 font-semibold border-t border-white/10 pt-2.5">
                <div className="flex items-center gap-1"><Droplets size={10} /> {weatherSnippet.humidity}% {t("dashboard:weather.humid")}</div>
                <div className="truncate">{t(`dashboard:weather.conditions.${weatherSnippet.condition}`, { defaultValue: weatherSnippet.condition })}</div>
              </div>
            </div>

            {/* UBA Logo */}
            <div className="hidden md:flex items-start">
              <img src="/uba-logo.jpg" alt="Unnat Bharat Abhiyan" className="h-48 object-contain rounded-xl bg-white p-2 shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {error ? <Alert message={error} /> : null}

      {/* ── PREMIUM KPI WIDGET CARD GRID ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(loading ? defaultStatCards.map((c) => ({ ...c, value: "—" })) : stats).map((item, index) => {
          const { labelKey, value, icon: Icon, color, href, trendKey } = item;
          
          if (loading) {
            return (
              <div key={index} className="glass-card flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="h-6 w-24 rounded shimmer-bg animate-pulse" />
                <div className="h-10 w-12 rounded shimmer-bg animate-pulse my-2" />
                <div className="h-4 w-16 rounded shimmer-bg animate-pulse" />
              </div>
            );
          }

          return (
            <Link key={labelKey} to={href} className="focus-ring rounded-3xl block">
              <article className="glass-card relative overflow-hidden flex flex-col justify-between h-36">
                {/* Accent glow on card corners */}
                <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-leaf-500/5 blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {t(`dashboard:${labelKey}`)}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-tr ${color} border`}>
                    <Icon size={16} />
                  </div>
                </div>

                <div className="my-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {value}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-leaf-600 dark:text-leaf-400">
                  <TrendingUp size={11} /> {t(`dashboard:${trendKey}`)}
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* ── DYNAMIC AI PROACTIVE INSIGHTS ── */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none text-leaf">
          <Sparkles size={160} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-leaf-500/10 text-leaf dark:bg-leaf-950/30">
            <Sparkles size={14} className="animate-spin-slow" />
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
            {t("dashboard:aiAgriDoctorRecommendations")}
          </h2>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 animate-pulse">
            {t("dashboard:activeScan")}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full rounded shimmer-bg animate-pulse" />
            <div className="h-4 w-[80%] rounded shimmer-bg animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-3">
            {getAIInsights().map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/40 dark:from-slate-800/20 dark:to-slate-800/5 border border-slate-100 dark:border-slate-800/40">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-leaf" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CHARTS & PROFILE METRICS ── */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* Service Readiness Chart */}
        <article className="glass-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("dashboard:serviceReadiness")}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{t("dashboard:readinessDescription")}</p>
            </div>
            <span className="rounded-full bg-leaf-500/10 px-2.5 py-1 text-xs font-bold text-leaf">
              {t("dashboard:chartsActive")}
            </span>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">{t("common:loading")}</div>
            ) : readinessData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                {t("dashboard:completeProfileForReadiness")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readinessData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      fontSize: "12px", 
                      background: "rgba(15, 23, 42, 0.95)", 
                      color: "#fff", 
                      border: "none" 
                    }} 
                  />
                  <Bar dataKey="value" fill="#2f7d32" radius={[10, 10, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        {/* Profile Summary Info */}
        <article className="glass-card flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("dashboard:profileSummary")}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{t("dashboard:profileSummaryDescription")}</p>
            </div>
            
            <dl className="grid gap-2.5 text-xs font-semibold">
              {[
                ["profileFields.stateApplicability", profile.state || t("common:notAdded")],
                ["profileFields.district", profile.district || t("common:notAdded")],
                ["profileFields.village", profile.village || t("common:notAdded")],
                ["profileFields.landSize", t("dashboard:acres", { count: profile.landSize || 0 })],
                ["profileFields.crops", profile.cropType?.map((crop) => translateData(crop)).join(", ") || t("common:notAdded")],
                ["profileFields.farmerCategory", profile.farmerCategory || t("common:notSpecified")],
                ["profileFields.language", translateData(profile.preferredLanguage || "English")]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">{t(`dashboard:${label}`)}</dt>
                  <dd className="text-right text-slate-900 dark:text-white font-extrabold">{translateData(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t("dashboard:totalCompletion")}</span>
            <span className="text-sm font-black text-leaf">{profileComplete}%</span>
          </div>
        </article>
      </div>

      {/* ── TOP RECOMMENDATIONS WIDGET ── */}
      {!loading && dashboard?.topRecommendations?.length > 0 ? (
        <article className="glass-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("dashboard:smartRecommendations")}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{t("dashboard:topRecommendationsDescription")}</p>
            </div>
            <Link to="/recommendations" className="text-xs font-bold text-leaf flex items-center gap-1 hover:underline">
              {t("common:viewAll")} <ArrowRight size={12} />
            </Link>
          </div>
          
          <ul className="grid gap-3 sm:grid-cols-3">
            {dashboard.topRecommendations.map((scheme) => (
              <li key={scheme._id}>
                <Link
                  to={`/schemes/${scheme._id}`}
                  className="focus-ring block rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 hover:border-leaf hover:bg-green-50/20 transition-all duration-300"
                >
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{translateData(scheme.schemeName)}</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{translateData(scheme.category)}</p>
                  <p className="mt-2.5 text-xs font-black text-leaf">
                    {scheme.score}% {t("dashboard:matchScore")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
