import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Sprout, Plus, Trash2, Edit2, MapPin, IndianRupee } from "lucide-react";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { jobApi } from "../api/jobs";
import { marketplaceApi } from "../api/marketplace";

export default function MyListings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "jobs") {
          const res = await jobApi.getJobs({});
          setJobs(res.data.filter(j => j.farmer === user?._id));
        } else {
          const res = await marketplaceApi.getUserCropListings();
          setCrops(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your listings.");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [activeTab, user]);

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job listing?")) return;
    try {
      await jobApi.deleteJob(id);
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  const handleDeleteCrop = async (id) => {
    if (!confirm("Are you sure you want to delete this crop listing?")) return;
    try {
      await marketplaceApi.deleteCropListing(id);
      setCrops(crops.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete crop listing.");
    }
  };

  return (
    <section className="mx-auto max-w-5xl grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="mt-1 text-slate-600">Manage your posted farm jobs and crops for sale.</p>
        </div>
      </div>

      <div className="flex space-x-1 rounded-md bg-slate-100 p-1 w-full md:w-max">
        <button
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "jobs" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          onClick={() => setActiveTab("jobs")}
        >
          <Briefcase size={18} /> My Farm Jobs
        </button>
        <button
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "crops" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          onClick={() => setActiveTab("crops")}
        >
          <Sprout size={18} /> My Crops for Sale
        </button>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      {activeTab === "jobs" && (
        <div className="grid gap-4">
          <div className="flex justify-end">
            <Link to="/jobs/new" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
              <Plus size={16} /> Post New Job
            </Link>
          </div>
          
          {loading ? (
            <p>Loading your jobs...</p>
          ) : jobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map(job => (
                <div key={job._id} className="flex flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      {job.status || "active"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 p-12 text-center text-slate-500">
              You haven't posted any jobs yet.
            </div>
          )}
        </div>
      )}

      {activeTab === "crops" && (
        <div className="grid gap-4">
           <div className="flex justify-end">
            <Link to="/marketplace/new" className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">
              <Plus size={16} /> Sell New Crop
            </Link>
          </div>
          
          {loading ? (
            <p>Loading your listings...</p>
          ) : crops.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {crops.map(crop => (
                <div key={crop._id} className="flex flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{crop.cropName}</h3>
                      <p className="text-sm font-semibold text-amber-700">₹{crop.pricePerUnit} / {crop.quantityUnit}</p>
                    </div>
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      {crop.quantity} {crop.quantityUnit}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleDeleteCrop(crop._id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 p-12 text-center text-slate-500">
              You haven't listed any crops for sale yet.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
