import React, { useEffect, useState } from "react";
import { Search, Briefcase, MapPin, IndianRupee, Trash2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) return;
    try {
      await adminApi.deleteJob(id);
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
    job.workCategory?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs Moderation</h1>
          <p className="text-slate-500">Review and moderate all farm job listings.</p>
        </div>
      </div>

      <div className="flex rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by title, farmer, or category..." 
          className="w-full ml-2 bg-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-12 text-center text-slate-500">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="col-span-full py-12 text-center text-slate-500">No jobs found.</p>
        ) : (
          filteredJobs.map(job => (
            <div key={job._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {job.workCategory}
                </span>
                <span className="text-xs text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">{job.description}</p>
              
              <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{job.village || job.district || "Location unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-slate-400" />
                  <span>₹{job.wageAmount} / {job.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-slate-400" />
                  <span>Posted by: {job.farmerName || "Unknown"}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(job._id)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Delete Listing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
