import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, IndianRupee, MapPin, Phone, Users } from "lucide-react";
import Alert from "../components/Alert";
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

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    workCategory: "harvesting",
    description: "",
    workersNeeded: 1,
    village: "",
    district: "",
    preferredDate: "",
    workingHours: "",
    duration: "",
    paymentMethod: "daily",
    wageAmount: "",
    phone: "",
    whatsapp: "",
    requirements: "",
    equipmentNeeded: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (id) {
      async function fetchJob() {
        try {
          const res = await jobApi.getJobById(id);
          const job = res.data;
          
          const dateStr = job.preferredDate ? new Date(job.preferredDate).toISOString().split('T')[0] : "";
          
          setFormData({
            title: job.title || "",
            workCategory: job.workCategory || "harvesting",
            description: job.description || "",
            workersNeeded: job.workersNeeded || 1,
            village: job.village || "",
            district: job.district || "",
            preferredDate: dateStr,
            workingHours: job.workingHours || "",
            duration: job.duration || "",
            paymentMethod: job.paymentMethod || "daily",
            wageAmount: job.wageAmount || "",
            phone: job.phone || "",
            whatsapp: job.whatsapp || "",
            requirements: job.requirements || "",
            equipmentNeeded: job.equipmentNeeded || ""
          });
        } catch (err) {
          setError("Failed to load job details for editing.");
        } finally {
          setInitialLoading(false);
        }
      }
      fetchJob();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        workersNeeded: Number(formData.workersNeeded),
        wageAmount: Number(formData.wageAmount),
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041] // Mock coordinates for New Delhi
        }
      };

      if (id) {
        await jobApi.updateJob(id, payload);
      } else {
        await jobApi.createJob(payload);
      }
      
      navigate(id ? `/jobs/${id}` : "/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save job listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-12 text-center text-slate-600">Loading job details...</div>;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{id ? "Edit Farm Job" : "Post a Farm Job"}</h1>
        <p className="mt-2 text-slate-600">{id ? "Update the details of your job listing." : "Fill out the details below to hire agricultural workers for your farm."}</p>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Job Title *</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Need 5 workers for wheat harvesting"
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Work Category *</label>
              <select
                required
                name="workCategory"
                value={formData.workCategory}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                {JOB_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Workers Needed *</label>
              <div className="relative">
                <Users size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  required
                  type="number"
                  min="1"
                  name="workersNeeded"
                  value={formData.workersNeeded}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description *</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the work, expectations, and any other details..."
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              ></textarea>
            </div>

            <div className="col-span-2 mt-4 border-t border-slate-100 pt-4">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Location & Schedule</h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Village/City *</label>
              <input
                required
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">District *</label>
              <input
                required
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Preferred Start Date *</label>
              <input
                required
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Duration</label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 days, 2 weeks"
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="col-span-2 mt-4 border-t border-slate-100 pt-4">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Payment & Contact</h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Payment Method *</label>
              <select
                required
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="daily">Daily Wage</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Amount (₹) *</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  required
                  type="number"
                  name="wageAmount"
                  value={formData.wageAmount}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Phone Number *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your contact number"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">WhatsApp Number (Optional)</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="For WhatsApp messages"
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 rounded-b-md bg-slate-50 p-6">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
          >
            {loading ? "Saving..." : (id ? "Save Changes" : "Post Job Listing")}
          </button>
        </div>
      </form>
    </section>
  );
}
