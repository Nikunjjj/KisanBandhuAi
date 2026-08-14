import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Banknote,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle
} from "lucide-react";
import { http } from "../api/http";
import Alert from "../components/Alert";

// ─── Status configuration ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied: {
    label: "Applied",
    color: "text-blue-700 bg-blue-100",
    dot: "bg-blue-500",
    stepColor: "border-blue-500 bg-blue-500"
  },
  under_review: {
    label: "Under Review",
    color: "text-amber-700 bg-amber-100",
    dot: "bg-amber-500",
    stepColor: "border-amber-500 bg-amber-500"
  },
  approved: {
    label: "Approved",
    color: "text-green-700 bg-green-100",
    dot: "bg-green-500",
    stepColor: "border-green-500 bg-green-500"
  },
  disbursed: {
    label: "Disbursed",
    color: "text-emerald-700 bg-emerald-100",
    dot: "bg-emerald-600",
    stepColor: "border-emerald-600 bg-emerald-600"
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700 bg-red-100",
    dot: "bg-red-500",
    stepColor: "border-red-500 bg-red-500"
  }
};

const STEP_ORDER = ["applied", "under_review", "approved", "disbursed"];
const STEP_LABELS = { applied: "Applied", under_review: "Under Review", approved: "Approved", disbursed: "Disbursed" };

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Timeline stepper ────────────────────────────────────────────────────────
function TimelineStepper({ status, timeline }) {
  const currentIdx = STEP_ORDER.indexOf(status);
  const isRejected = status === "rejected";

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        <XCircle size={16} /> Application was rejected. Contact your local agriculture office.
      </div>
    );
  }

  return (
    <div className="relative mt-2">
      <div className="flex items-center gap-0">
        {STEP_ORDER.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const event = timeline?.find((e) => e.status === step);
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    done
                      ? "border-green-500 bg-green-500 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-400"
                  } ${active ? "ring-2 ring-green-300 ring-offset-1" : ""}`}
                >
                  {done ? <CheckCircle size={14} /> : idx + 1}
                </div>
                <div className="mt-1.5 w-20 text-center">
                  <p className={`text-xs font-semibold leading-tight ${done ? "text-slate-800" : "text-slate-400"}`}>
                    {STEP_LABELS[step]}
                  </p>
                  {event?.date && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
              {idx < STEP_ORDER.length - 1 && (
                <div className={`mb-5 h-0.5 flex-1 ${idx < currentIdx ? "bg-green-500" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Application card ────────────────────────────────────────────────────────
function AppCard({ app }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">{app.schemeName}</h3>
              <StatusBadge status={app.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{app.schemeCategory}</span>
              <span>·</span>
              <span>{app.ministry}</span>
            </div>
          </div>
          {app.disbursedAmount > 0 && app.status === "disbursed" && (
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-700">
                ₹{app.disbursedAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500">Disbursed</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            Applied: {new Date(app.appliedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          {app.referenceNumber && (
            <span className="flex items-center gap-1.5">
              <FileCheck size={13} className="text-slate-400" />
              Ref: {app.referenceNumber}
            </span>
          )}
          {app.paymentDate && (
            <span className="flex items-center gap-1.5">
              <Banknote size={13} className="text-green-600" />
              Paid: {new Date(app.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="mt-4">
          <TimelineStepper status={app.status} timeline={app.timeline} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Less details" : "More details"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            {app.bankAccountMasked && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Bank Account</dt>
                <dd className="mt-0.5 font-mono text-sm text-slate-800">{app.bankAccountMasked}</dd>
              </div>
            )}
            {app.ifscCode && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">IFSC Code</dt>
                <dd className="mt-0.5 font-mono text-sm text-slate-800">{app.ifscCode}</dd>
              </div>
            )}
            {app.disbursedAmount > 0 && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Amount Disbursed</dt>
                <dd className="mt-0.5 text-sm font-bold text-emerald-700">
                  ₹{app.disbursedAmount.toLocaleString("en-IN")}
                </dd>
              </div>
            )}
            {app.referenceNumber && (
              <div>
                <dt className="text-xs font-semibold text-slate-500">Reference Number</dt>
                <dd className="mt-0.5 font-mono text-sm text-slate-800">{app.referenceNumber}</dd>
              </div>
            )}
          </dl>

          {/* Timeline events */}
          {app.timeline?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-slate-600">Activity Log</p>
              <ol className="space-y-2">
                {app.timeline.map((evt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_CONFIG[evt.status]?.dot || "bg-slate-400"}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{STEP_LABELS[evt.status] || evt.status}</p>
                      <p className="text-xs text-slate-500">{evt.note}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(evt.date).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Summary stat card ────────────────────────────────────────────────────────
function SumCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100",
    amber: "bg-amber-50 border-amber-100",
    green: "bg-green-50 border-green-100",
    emerald: "bg-emerald-50 border-emerald-100",
    slate: "bg-white border-slate-200"
  };
  const iconColors = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-green-100 text-green-700",
    emerald: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-600"
  };
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colors[color] || colors.slate}`}>
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${iconColors[color] || iconColors.slate}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

// ─── Main DBT Tracker page ───────────────────────────────────────────────────
export default function DbtTracker() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [appsRes, sumRes] = await Promise.all([http.get("/dbt"), http.get("/dbt/summary")]);
      setApplications(appsRes.data.applications || []);
      setSummary(sumRes.data.summary || null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load DBT data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = applications.filter((app) => {
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchSearch = !search || app.schemeName.toLowerCase().includes(search.toLowerCase()) || app.schemeCategory.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "applied", label: "Applied" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "disbursed", label: "Disbursed" },
    { value: "rejected", label: "Rejected" }
  ];

  return (
    <section className="grid gap-6">
      {/* ── Page header ── */}
      <div className="rounded-xl bg-gradient-to-r from-green-800 to-green-600 px-6 py-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
            <TrendingUp size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-200">Direct Benefit Transfer</p>
            <h1 className="text-2xl font-bold">DBT Status Tracker</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-green-100">
          Track the real-time status of your government subsidy applications and payments under various schemes.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* ── Summary stat cards ── */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SumCard icon={FileCheck} label="Total Applied" value={summary.total} color="slate" />
          <SumCard icon={Clock} label="Under Review" value={summary.under_review} color="amber" />
          <SumCard icon={CheckCircle} label="Approved" value={summary.approved} color="green" />
          <SumCard icon={Banknote} label="Disbursed" value={summary.disbursed} color="emerald" />
          <SumCard
            icon={TrendingUp}
            label="Total Received (₹)"
            value={`₹${(summary.totalDisbursed || 0).toLocaleString("en-IN")}`}
            color="emerald"
          />
        </div>
      )}

      {/* ── Filters & search ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search schemes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                statusFilter === f.value
                  ? "bg-green-700 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Application list ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          <TrendingUp size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No applications found</p>
          <p className="mt-1 text-sm">Apply for government schemes to track your DBT status here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((app) => (
            <AppCard key={app._id} app={app} />
          ))}
        </div>
      )}

      {/* ── DBT info footer ── */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
        <h3 className="font-bold text-slate-800">About DBT (Direct Benefit Transfer)</h3>
        <p className="mt-2 text-sm text-slate-600">
          DBT transfers subsidy benefits directly to beneficiary bank accounts linked with Aadhaar, eliminating
          intermediaries and ensuring faster, transparent fund transfer. Track your pending and received amounts here.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <a href="https://dbtbharat.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
            <ArrowRight size={14} /> DBT Bharat Portal
          </a>
          <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
            <ArrowRight size={14} /> PM-KISAN Status
          </a>
        </div>
      </div>
    </section>
  );
}
