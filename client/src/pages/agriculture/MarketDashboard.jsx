import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Info,
  Loader2,
  Search,
  TrendingDown,
  TrendingUp,
  LineChart as LineIcon,
  TableProperties,
  LayoutGrid
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Alert from "../../components/Alert";
import FormInput from "../../components/FormInput";
import SelectField from "../../components/SelectField";
import { http } from "../../api/http";
import { useAccessibility } from "../../context/AccessibilityContext";
import { localizeText } from "../../utils/localize";
import { EmptyState, PageHeader } from "./AgriComponents";

const categories = ["All", "Cereals", "Vegetables", "Fruits", "Oilseeds"];

export default function MarketDashboard() {
  const { language, t } = useAccessibility();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cropFilter, setCropFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // default to card block view

  // Format initial user state if present
  const initialUserState = useMemo(() => {
    if (!user?.profile?.state) return "All States";
    const s = user.profile.state;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }, [user]);

  const [selectedState, setSelectedState] = useState(initialUserState);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statesList = useMemo(() => {
    const defaults = ["All States", "Karnataka", "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh", "Gujarat"];
    if (initialUserState && initialUserState !== "All States" && !defaults.includes(initialUserState)) {
      defaults.push(initialUserState);
    }
    return defaults;
  }, [initialUserState]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    http.get("/market/prices", {
      params: {
        state: selectedState === "All States" ? "" : selectedState
      }
    })
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load mandi analytics.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedState]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (!data?.prices) return [];
    return data.prices.filter((item) => {
      const matchSearch =
        (item.cropName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.mandi || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.district || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [data, search, category]);

  // Crop options list for chart filter
  const cropOptions = useMemo(() => {
    if (!data?.crops) return ["All"];
    return ["All", ...data.crops];
  }, [data]);

  // Mock ticker values derived from report data
  const tickerItems = useMemo(() => {
    if (!data?.prices) return [];
    return data.prices.slice(0, 8).map(r => ({
      crop: r.cropName,
      mandi: r.mandi,
      price: r.currentPrice,
      change: r.changePercent || 0
    }));
  }, [data]);

  // Chart data directly from trends
  const chartData = useMemo(() => {
    return data?.trends || [];
  }, [data]);

  // Dynamic series lines for chart
  const activeForecastCrops = useMemo(() => {
    if (cropFilter !== "All") return [cropFilter];
    return (data?.crops || []).slice(0, 5);
  }, [cropFilter, data]);

  const colors = ["#2f7d32", "#2563eb", "#d97706", "#9333ea", "#ec4899", "#14b8a6", "#f59e0b"];

  return (
    <section className="grid gap-6 animate-fadeIn">
      <PageHeader eyebrow={t("marketIntelligence")} title={t("mandiPricesDashboard")}>
        Analyze real-time agricultural mandi listings, volumes, and crop price predictions.
      </PageHeader>

      {/* ── LIVE MANDI MARQUEE TICKER ── */}
      {tickerItems.length > 0 && (
        <div className="w-full overflow-hidden bg-slate-900 text-white rounded-2xl py-3 border border-slate-800 relative shadow-lg">
          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-slate-900 to-transparent w-10 z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-slate-900 to-transparent w-10 z-10 pointer-events-none" />
          
          <div className="flex gap-12 animate-[shimmer_25s_infinite_linear] whitespace-nowrap px-4 font-bold text-xs">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400">{item.crop} ({item.mandi})</span>
                <span className="text-white">₹{item.price}/q</span>
                <span className={`flex items-center gap-0.5 ${parseFloat(item.change) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {parseFloat(item.change) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.change}%
                </span>
              </div>
            ))}
            {/* Repeat for seamless loop scrolling */}
            {tickerItems.map((item, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400">{item.crop} ({item.mandi})</span>
                <span className="text-white">₹{item.price}/q</span>
                <span className={`flex items-center gap-0.5 ${parseFloat(item.change) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {parseFloat(item.change) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER TOOLBAR CONSOLE ── */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
        <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr] lg:grid-cols-[1.8fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-3 pl-11 pr-4 text-sm outline-none focus:border-leaf dark:focus:border-leaf transition-colors dark:text-white"
              placeholder="Search by crop, mandi location, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c} className="dark:bg-slate-900">{localizeText(c, language)}</option>
            ))}
          </SelectField>

          <SelectField label="State / Region" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            {statesList.map((s) => (
              <option key={s} value={s} className="dark:bg-slate-900">{s}</option>
            ))}
          </SelectField>

          <SelectField label="Chart Filter Crop" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
            {cropOptions.map((c) => (
              <option key={c} value={c} className="dark:bg-slate-900">{localizeText(c, language)}</option>
            ))}
          </SelectField>

          <button
            type="button"
            onClick={() => { 
              setSearch(""); 
              setCategory("All"); 
              setSelectedState(initialUserState); 
              setCropFilter("All"); 
            }}
            className="focus-ring border border-slate-350 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-end"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
      {loading ? <div className="text-center py-10 font-bold text-xs text-slate-400"><Loader2 className="animate-spin inline-block mr-2" /> Fetching real-time market data…</div> : null}

      {!loading && data ? (
        <>
          {/* ── FINANCIAL CHARTS SECTION ── */}
          <div className="grid gap-6 xl:grid-cols-2">
            
            {/* Price Prediction curves */}
            <article className="glass-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <LineIcon size={18} className="text-leaf" /> Price Predictions & Projection Curve
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Estimated price ranges per quintal (q)</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-leaf border border-emerald-500/10">
                  AI Trend Models
                </span>
              </div>

              <div className="h-72">
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No predictions available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.15)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: "16px", 
                          fontSize: "12px", 
                          background: "rgba(15, 23, 42, 0.95)", 
                          color: "#fff", 
                          border: "none" 
                        }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
                      {activeForecastCrops.map((cropName, idx) => (
                        <Line
                          key={cropName}
                          type="monotone"
                          dataKey={cropName}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2.5}
                          dot={{ r: 3, strokeWidth: 1 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>

            {/* Mandi Volume Distribution */}
            <article className="glass-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TableProperties size={18} className="text-leaf" /> Volume Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded commodity arrivals (quintals)</p>
                </div>
              </div>

              <div className="h-72">
                {filteredReports.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No volume records match.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredReports.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.15)" vertical={false} />
                      <XAxis dataKey="cropName" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: "16px", 
                          fontSize: "12px", 
                          background: "rgba(15, 23, 42, 0.95)", 
                          color: "#fff", 
                          border: "none" 
                        }}
                      />
                      <Bar dataKey="currentPrice" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={26} name="Price ₹" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>
          </div>

          {/* ── DETAILED MANDI LISTINGS / CARDS ── */}
          <article className="glass-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Mandi Crop Listings</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official daily rates in <span className="font-bold text-leaf">{selectedState === "All States" ? "all regions" : selectedState}</span>
                </p>
              </div>

              {/* View toggle buttons */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-150 dark:border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-leaf text-white shadow-premium"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Card Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "table"
                      ? "bg-leaf text-white shadow-premium"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TableProperties size={14} />
                  <span>Table View</span>
                </button>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                No mandi reports matching the criteria were found for {selectedState}.
              </div>
            ) : viewMode === "grid" ? (
              /* Grid Block Layout */
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((item, index) => (
                  <div key={index} className="glass-panel flex flex-col justify-between p-5 hover:scale-[1.01] transition-transform duration-350 bg-gradient-to-br from-white/90 to-white/60 dark:from-slate-900/90 dark:to-slate-900/60 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{item.cropName}</h4>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                        <span className="font-extrabold text-slate-700 dark:text-slate-200">{item.mandi}</span>
                        <span>•</span>
                        <span>{item.district || item.state || selectedState}</span>
                      </div>

                      {/* Pricing Info */}
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Modal rate</p>
                          <p className="text-2xl font-black text-leaf mt-0.5">₹{item.currentPrice}<span className="text-[10px] font-bold text-slate-400">/q</span></p>
                        </div>
                        <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.changePercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {item.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {item.changePercent >= 0 ? "+" : ""}{item.changePercent}%
                        </div>
                      </div>

                      {/* Min-Max Gauge Slider */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                          <span>Min: ₹{item.minPrice}</span>
                          <span>Max: ₹{item.maxPrice}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full relative">
                          <div 
                            className="absolute h-2.5 w-2.5 bg-leaf rounded-full top-1/2 -translate-y-1/2 shadow-md"
                            style={{ 
                              left: `${Math.min(95, Math.max(5, ((item.currentPrice - item.minPrice) / (item.maxPrice - item.minPrice || 1)) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proactive Advisor details */}
                    {item.recommendation && (
                      <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-3">
                        <div className="flex gap-2 items-start text-[11px] text-slate-500 dark:text-slate-400">
                          <Info size={13} className="text-leaf shrink-0 mt-0.5" />
                          <p className="italic leading-relaxed">{item.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Table Layout */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                      <th className="py-3 px-4">Crop Name</th>
                      <th className="py-3 px-4">Market / Mandi</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Min Price</th>
                      <th className="py-3 px-4 text-right">Max Price</th>
                      <th className="py-3 px-4 text-right">Modal Rate</th>
                      <th className="py-3 px-4 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReports.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">{item.cropName}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {item.mandi} <span className="text-[10px] text-slate-400">({item.district})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">₹{item.minPrice}</td>
                        <td className="py-3 px-4 text-right text-slate-500">₹{item.maxPrice}</td>
                        <td className="py-3 px-4 text-right text-leaf font-black">
                          <div className="flex flex-col items-end">
                            <span>₹{item.currentPrice}</span>
                            <span className={`text-[9px] flex items-center font-bold mt-0.5 ${item.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                              {item.changePercent >= 0 ? "+" : ""}
                              {item.changePercent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-bold">{item.volume || "—"} q</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}
