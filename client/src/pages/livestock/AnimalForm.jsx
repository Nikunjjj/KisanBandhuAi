import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { livestockApi } from "../../api/livestock";

export default function AnimalForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tagNumber: "",
    species: "Cow",
    breed: "",
    gender: "Female",
    weight: "",
    pregnancyStatus: "Not Pregnant",
    milkProduction: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await livestockApi.createProfile({
        ...formData,
        weight: Number(formData.weight) || undefined,
        milkProduction: Number(formData.milkProduction) || undefined
      });
      navigate("/livestock");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register animal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate("/livestock")} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-premium">
        <h1 className="text-2xl font-black text-slate-850 dark:text-white mb-6">Register New Livestock</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Animal Name or Alias</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tag Number (Optional)</label>
            <input type="text" value={formData.tagNumber} onChange={e => setFormData({...formData, tagNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Species</label>
            <select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf">
              <option value="Cow">Cow</option>
              <option value="Buffalo">Buffalo</option>
              <option value="Goat">Goat</option>
              <option value="Sheep">Sheep</option>
              <option value="Poultry">Poultry</option>
              <option value="Pig">Pig</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Breed</label>
            <input type="text" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {formData.gender === "Female" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pregnancy Status</label>
                <select value={formData.pregnancyStatus} onChange={e => setFormData({...formData, pregnancyStatus: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf">
                  <option value="Not Pregnant">Not Pregnant</option>
                  <option value="Pregnant">Pregnant</option>
                  <option value="Lactating">Lactating</option>
                  <option value="Dry">Dry</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Milk Production (Liters/Day)</label>
                <input type="number" step="0.1" value={formData.milkProduction} onChange={e => setFormData({...formData, milkProduction: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-leaf" />
              </div>
            </>
          )}

          <div className="md:col-span-2 pt-4">
            <button disabled={loading} type="submit" className="w-full bg-leaf hover:bg-leaf-600 text-white py-3.5 rounded-xl font-bold shadow-premium transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Register Livestock Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
