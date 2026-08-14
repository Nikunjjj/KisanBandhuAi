import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Gauge,
  Info,
  Loader2,
  MapPin,
  Mic,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
  Sunrise,
  Sunset,
  Umbrella,
  CloudSnow
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Alert from "../../components/Alert";
import SelectField from "../../components/SelectField";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { useAuth } from "../../context/AuthContext";
import { localizeText } from "../../utils/localize";
import { speakText } from "../../utils/speech";
import { AdvisoryCard, EmptyState, PageHeader } from "./AgriComponents";

const districts = ["Bengaluru Rural", "Nashik", "Ludhiana"];

// ─── Inline Animated Weather Icons ──────────────────────────────────────────
function AnimatedSun() {
  return (
    <svg className="w-16 h-16 text-yellow-500 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" fill="rgba(245,158,11,0.2)"/>
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function AnimatedRain() {
  return (
    <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" fill="rgba(59,130,246,0.1)" />
      <line x1="8" y1="19" x2="8" y2="21" className="animate-pulse" />
      <line x1="12" y1="21" x2="12" y2="23" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <line x1="16" y1="19" x2="16" y2="21" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </svg>
  );
}

function AnimatedCloudSun() {
  return (
    <svg className="w-16 h-16 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M12 22v-2" stroke="#eab308" className="animate-spin-slow" />
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" fill="rgba(148,163,184,0.1)" />
    </svg>
  );
}

export default function WeatherDashboard() {
  const { user } = useAuth();
  const { language, speechLang, t } = useAccessibility();

  const [district, setDistrict] = useState(user?.profile?.district || "Bengaluru Rural");
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | detecting | detected | error
  const [geoError, setGeoError] = useState("");

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (coords) {
      params.set("lat", coords.lat);
      params.set("lon", coords.lon);
    } else {
      params.set("district", district);
    }
    return params.toString();
  }, [coords, district]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([http.get(`/weather/forecast?${query}`), http.get(`/weather/alerts?${query}`)])
      .then(([forecastRes, alertRes]) => {
        if (!mounted) return;
        const forecastData = forecastRes.data;
        if (coords && forecastData.current?.district) {
          setDistrict(forecastData.current.district);
        }
        setData({ ...forecastData, alerts: alertRes.data.alerts || [] });
      })
      .catch((err) => mounted && setError(err.response?.data?.message || "Unable to load weather intelligence."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoStatus("error");
      return;
    }
    setGeoStatus("detecting");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude.toFixed(6), lon: longitude.toFixed(6) });
        setGeoStatus("detected");
      },
      (err) => {
        const messages = {
          1: "Location permission denied. Please allow location access in your browser.",
          2: "Unable to determine your position. Check your GPS signal.",
          3: "Location request timed out. Try again."
        };
        setGeoError(messages[err.code] || "Failed to detect location.");
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  function speakWeather() {
    if (!data?.current) return;
    const text = [
      `${data.current.district} ${t("weather")}.`,
      `${t("temperature")} ${data.current.temperature} degrees Celsius.`,
      `Feels like ${data.current.feelsLike} degrees.`,
      `${t("humidity")} ${data.current.humidity} percent.`,
      `${t("rainProbability")} ${data.current.rainfallProbability} percent.`,
      `Wind speed ${data.current.windSpeed} kilometres per hour.`,
      `UV index ${data.current.uvIndex}.`,
      localizeText(data.alerts?.[0]?.message || "No severe alert right now.", language)
    ].join(" ");
    speakText(text, speechLang);
  }

  const current = data?.current;
  const isLive = data?.source?.includes("Open-Meteo") || data?.source?.includes("OpenWeather");

  // Determine weather icon
  const getWeatherIcon = (condition) => {
    const cond = (condition || "").toLowerCase();
    if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle")) {
      return <AnimatedRain />;
    }
    if (cond.includes("sun") || cond.includes("clear") || cond.includes("hot")) {
      return <AnimatedSun />;
    }
    return <AnimatedCloudSun />;
  };

  return (
    <section className="grid gap-6 animate-fadeIn">
      <PageHeader eyebrow={t("weatherIntelligence")} title={t("weatherDashboardTitle")}>
        {t("weatherDashboardIntro")}
      </PageHeader>

      {/* ── CONSOLE CONTROLS BAR ── */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
          <SelectField
            label={t("district")}
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setCoords(null);
              setGeoStatus("idle");
            }}
          >
            {districts.map((item) => (
              <option key={item} className="dark:bg-slate-900">{item}</option>
            ))}
          </SelectField>

          {/* Detect Location */}
          <button
            type="button"
            onClick={detectLocation}
            disabled={geoStatus === "detecting"}
            className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-leaf px-5 py-3.5 text-sm font-bold text-leaf hover:bg-leaf-50/50 transition-colors disabled:opacity-60"
          >
            {geoStatus === "detecting" ? (
              <><Loader2 size={16} className="animate-spin" /> Detecting…</>
            ) : (
              <><MapPin size={16} /> {t("detectLocation")}</>
            )}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => {
              setData(null);
              setLoading(true);
              setError("");
              Promise.all([http.get(`/weather/forecast?${query}`), http.get(`/weather/alerts?${query}`)])
                .then(([forecastRes, alertRes]) => {
                  setData({ ...forecastRes.data, alerts: alertRes.data.alerts || [] });
                })
                .catch((err) => setError(err.response?.data?.message || "Unable to load weather intelligence."))
                .finally(() => setLoading(false));
            }}
            disabled={loading}
            className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Voice */}
          <button
            type="button"
            onClick={speakWeather}
            className="focus-ring flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Mic size={16} /> {t("voiceUpdate")}
          </button>
        </div>

        {/* Geo status messages */}
        {geoStatus === "detected" && coords && (
          <p className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400">
            <CheckCircle size={14} />
            GPS Detected · {parseFloat(coords.lat).toFixed(4)}°N, {parseFloat(coords.lon).toFixed(4)}°E
          </p>
        )}
        {geoStatus === "error" && geoError && (
          <p className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-red-650">
            <AlertTriangle size={14} /> {geoError}
          </p>
        )}
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
      {!current && loading ? <EmptyState>Fetching live weather data…</EmptyState> : null}

      {current ? (
        <>
          {/* Main Title Indicator & Source API */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {current.district} {current.condition ? ` · ${current.condition}` : ""}
              </h2>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
              isLive ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}>
              <CheckCircle size={10} /> {data.source}
            </span>
          </div>

          {/* ── WEATHER HERO HIGHLIGHTS ── */}
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            
            {/* Left Big Card: iOS Weather Panel */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-650 to-indigo-800 p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase text-indigo-200 border border-white/5 backdrop-blur-md">
                  Current Conditions
                </span>
                <h3 className="text-6xl font-black tracking-tighter mt-4 leading-none">{current.temperature}°C</h3>
                <p className="mt-2 text-sm font-extrabold text-indigo-150">Feels like {current.feelsLike}°C · {current.condition}</p>
                <div className="mt-6 flex items-center gap-4 text-xs font-bold text-indigo-100">
                  <span className="flex items-center gap-1.5"><Droplets size={14} /> Humidity: {current.humidity}%</span>
                  <span className="flex items-center gap-1.5"><Wind size={14} /> Wind: {current.windSpeed} km/h</span>
                </div>
              </div>

              <div className="relative z-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-inner shrink-0">
                {getWeatherIcon(current.condition)}
              </div>
            </div>

            {/* Right Card: Dynamic Farm Advisory Summary */}
            <div className="glass-card flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Advisory Alerts</span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">Farm Advisories</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                  {current.rainfallProbability > 40 
                    ? "Substantial precipitation chances expected today. Postpone fertilizer applications and verify farm drains."
                    : "Stable climate forecast. Ideal conditions for pesticide applications and land clearing routines."
                  }
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-3 mt-4">
                <div className="p-2 rounded-xl bg-leaf-500/10 text-leaf">
                  <Umbrella size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Rain Prob</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white">{current.rainfallProbability}% probability</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── KPI METRICS CARDS GRID ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            
            {/* Humidity */}
            <article className="glass-card flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Droplets size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Humidity</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{current.humidity}%</h4>
                <span className="text-[9px] font-bold text-slate-500">Crop disease risk marker</span>
              </div>
            </article>

            {/* Wind */}
            <article className="glass-card flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                <Wind size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Wind Speed</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{current.windSpeed} km/h</h4>
                <span className="text-[9px] font-bold text-slate-500">Dir: {current.windDirection}</span>
              </div>
            </article>

            {/* UV Index */}
            <article className="glass-card flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sun size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">UV Index</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{current.uvIndex ?? "Low"}</h4>
                <span className="text-[9px] font-bold text-slate-500">Exposure: {current.uvIndex >= 6 ? "High" : "Safe"}</span>
              </div>
            </article>

            {/* Cloud coverage */}
            <article className="glass-card flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <CloudSun size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cloud Cover</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{current.cloudCoverage}%</h4>
                <span className="text-[9px] font-bold text-slate-500">Solar yield potential</span>
              </div>
            </article>

            {/* Sunrise / Sunset */}
            <article className="glass-card flex items-center gap-4 sm:col-span-2 xl:col-span-1">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border border-yellow-500/20">
                <Sunrise size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sunrise / Sunset</p>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{current.sunrise && current.sunset ? `${current.sunrise} / ${current.sunset}` : "—"}</h4>
              </div>
            </article>

            {/* Barometric Pressure */}
            <article className="glass-card flex items-center gap-4 sm:col-span-2 xl:col-span-1">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Gauge size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pressure</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{current.pressure} hPa</h4>
              </div>
            </article>
          </div>

          {/* ── HOURLY FORECAST AREA GRAPH + ALERTS ── */}
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            
            {/* Hourly forecast Area/Line Chart */}
            <article className="glass-card">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("hourlyForecast")}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Dual-axis temperature curves & rain likelihoods</p>
              </div>
              
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.hourly} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.15)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: "16px", 
                        fontSize: "12px", 
                        background: "rgba(15, 23, 42, 0.95)", 
                        color: "#fff", 
                        border: "none" 
                      }}
                      formatter={(val, name) =>
                        name === "Rain %" ? [`${val}%`, "Rain probability"] : [`${val}°C`, "Temperature"]
                      }
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="rain"
                      stroke="#2563eb"
                      fill="url(#rainGrad)"
                      name="Rain %"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      name="Temp °C"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Advisory Alert Center */}
            <article className="glass-card flex flex-col justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("weatherAlerts")}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Region-specific hazard warnings</p>
                
                <div className="mt-4 grid gap-3">
                  {data.alerts.length > 0 ? (
                    data.alerts.map((alert) => <AdvisoryCard key={alert.type} alert={alert} />)
                  ) : (
                    <div className="text-center py-6 text-xs font-semibold text-slate-400">
                      No active severe weather warnings for this location.
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>

          {/* ── DAILY & WEEKLY CHARTS ── */}
          <div className="grid gap-6 xl:grid-cols-2">
            
            {/* 7-Day Temp Forecast */}
            <article className="glass-card">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">7-Day Temperature Range</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Weekly high/low temperature forecasts</p>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.15)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: "16px", 
                        fontSize: "12px", 
                        background: "rgba(15, 23, 42, 0.95)", 
                        color: "#fff", 
                        border: "none" 
                      }}
                      formatter={(val, name) => [`${val}°C`, name === "max" ? "Max Temp" : "Min Temp"]}
                    />
                    <Line type="monotone" dataKey="max" stroke="#ef4444" name="max" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="min" stroke="#3b82f6" name="min" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Weekly Rainfall Prediction */}
            <article className="glass-card">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("weeklyRainfallPrediction")}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Expected rainfall volumes in millimeters</p>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.15)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: "16px", 
                        fontSize: "12px", 
                        background: "rgba(15, 23, 42, 0.95)", 
                        color: "#fff", 
                        border: "none" 
                      }}
                      formatter={(val) => [`${val} mm`, "Rainfall"]}
                    />
                    <Bar dataKey="rainfall" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} name="Rainfall mm" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
