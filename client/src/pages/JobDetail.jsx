import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Briefcase, Clock, IndianRupee, User, Calendar } from "lucide-react";
import Alert from "../components/Alert";
import { jobApi } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await jobApi.getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  if (loading) return <div className="p-12 text-center">Loading job details...</div>;
  if (error) return <Alert type="error" className="m-6">{error}</Alert>;
  if (!job) return <Alert type="error" className="m-6">Job not found</Alert>;

  const handleWhatsApp = () => {
    if (job.whatsapp) {
      window.open(`https://wa.me/${job.whatsapp}`, "_blank");
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${job.phone}`;
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobApi.deleteJob(job._id);
        navigate("/jobs");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete job.");
      }
    }
  };

  const isOwner = user && user._id === job.farmer;

  return (
    <section className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Briefcase size={16} />
              <span className="capitalize">{job.workCategory.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{job.village || job.district}, {job.state}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(job.preferredDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Wage Information */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-baseline gap-2 mb-2">
                <IndianRupee className="text-amber-700" size={20} />
                <span className="text-3xl font-bold text-amber-700">₹{job.wageAmount}</span>
                <span className="text-amber-600">per {job.paymentMethod}</span>
              </div>
              <p className="text-sm text-amber-600">{job.workersNeeded} worker(s) needed</p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Job Description</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Work Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Working Hours</h3>
                <p className="text-slate-600">{job.workingHours || "To be discussed"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Duration</h3>
                <p className="text-slate-600">{job.duration || "To be discussed"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Location</h3>
                <p className="text-slate-600">{job.address || `${job.village}, ${job.district}`}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Experience Required</h3>
                <p className="text-slate-600">{job.experienceRequired ? "Yes" : "No"}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Requirements</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}

            {/* Equipment */}
            {job.equipmentNeeded && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Equipment Needed</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{job.equipmentNeeded}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Information */}
          <div className="md:col-span-1">
            <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-6 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>

              {/* Farmer Info */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="text-emerald-700" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{job.farmerName}</p>
                    <p className="text-sm text-slate-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 transition"
                >
                  <Phone size={18} />
                  Call: {job.phone}
                </button>

                {job.whatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white font-semibold hover:bg-green-600 transition"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                )}
              </div>

              {/* Status */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Status</p>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold capitalize bg-emerald-100 text-emerald-800">
                  {job.status}
                </span>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Manage Job</h4>
                  <div className="space-y-3">
                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-100 px-4 py-3 text-emerald-700 font-semibold hover:bg-emerald-200 transition"
                    >
                      Edit Job
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-700 font-semibold hover:bg-red-100 transition"
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
