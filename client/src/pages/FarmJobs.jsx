import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Briefcase, Plus, Phone, MessageSquare, IndianRupee, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { jobApi } from "../api/jobs";

const JOB_CATEGORIES = [
  "harvesting",
  "planting",
  "irrigation",
  "pesticide_spraying",
  "machinery_operation",
  "livestock_care",
  "fruit_picking",
  "vegetable_picking",
  "warehouse_loading",
  "seasonal_farm_work",
  "other"
];

const defaultFilters = {
  search: "",
  category: "",
  wageMin: "",
  location: ""
};

export default function FarmJobs() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.wageMin) params.wageMin = filters.wageMin;
    if (filters.location) params.location = filters.location;
    return params;
  }, [filters]);

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const response = await jobApi.getJobs(queryParams);
      setJobs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [queryParams]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const formatCategory = (cat) => cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-md bg-emerald-700 px-5 py-6 text-white shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-100">Farm Employment Hub</p>
          <h1 className="mt-2 text-3xl font-bold">Find Agricultural Work</h1>
          <p className="mt-3 max-w-3xl text-emerald-50">
            Browse available farming jobs in your area or hire workers for your farm.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <Link to="/jobs/new" className="focus-ring inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 font-bold text-emerald-700">
              <Plus size={18} /> Post a Job
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Location</span>
            <div className="flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-700 focus-within:ring-offset-2">
              <span className="grid w-10 place-items-center text-slate-500">
                <MapPin size={18} />
              </span>
              <input
                className="w-full rounded-md py-2.5 pr-3 outline-none"
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                placeholder="Village, District, State..."
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Category</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {JOB_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Min Wage (₹)</span>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              value={filters.wageMin}
              onChange={(event) => updateFilter("wageMin", event.target.value)}
              placeholder="e.g. 300"
            />
          </label>

          <div className="flex items-end">
             <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-slate-500">Loading jobs...</p>
        ) : jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job._id} className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer group">
              <Link to={`/jobs/${job._id}`} className="flex-1 p-5 block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {formatCategory(job.workCategory)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900 group-hover:text-emerald-700">{job.title}</h3>
                <p className="mb-4 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{job.village || job.district ? `${job.village}, ${job.district}` : "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-slate-400" />
                    <span className="font-semibold text-emerald-700">₹{job.wageAmount} / {job.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Start: {new Date(job.preferredDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
              
              <div className="flex border-t border-slate-100 bg-slate-50 p-3 gap-2">
                <Link
                  to={`/jobs/${job._id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  View Details
                </Link>
                <Link
                  to={`/chat/${job.farmer}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-emerald-600 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare size={16} /> Chat
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            No jobs found matching your criteria. Try adjusting your filters.
          </div>
        )}
      </div>
    </section>
  );
}
