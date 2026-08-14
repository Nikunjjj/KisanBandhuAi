import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Syringe, HeartPulse, Stethoscope, Plus, Calendar, Activity, Pill, AlertTriangle } from "lucide-react";
import { livestockApi } from "../../api/livestock";
import { motion } from "framer-motion";

export default function AnimalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordData, setRecordData] = useState({
    recordType: "Vaccination",
    title: "",
    description: "",
    medicineAdministered: "",
    nextDueDate: "",
    veterinarian: ""
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await livestockApi.getProfile(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load animal profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await livestockApi.addHealthRecord(id, {
        ...recordData,
        nextDueDate: recordData.nextDueDate ? new Date(recordData.nextDueDate) : undefined
      });
      setShowRecordForm(false);
      setRecordData({ recordType: "Vaccination", title: "", description: "", medicineAdministered: "", nextDueDate: "", veterinarian: "" });
      fetchProfile();
    } catch (err) {
      alert("Failed to add record");
    }
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'Vaccination': return <Syringe size={18} className="text-emerald-500" />;
      case 'Illness': return <AlertTriangle size={18} className="text-red-500" />;
      case 'Checkup': return <Stethoscope size={18} className="text-blue-500" />;
      case 'Treatment': return <Pill size={18} className="text-purple-500" />;
      default: return <Activity size={18} className="text-slate-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-leaf" /></div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  const { profile, healthRecords } = data;
  
  // Find upcoming reminders
  const upcomingReminders = healthRecords.filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date()).sort((a,b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
      
      <div className="md:col-span-3">
        <button onClick={() => navigate("/livestock")} className="flex items-center gap-2 text-slate-500 font-bold mb-4 hover:text-slate-800 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      {/* Left Column - Profile Summary */}
      <div className="md:col-span-1 grid gap-6 h-max">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-4">
              <HeartPulse size={30} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-850 dark:text-white">{profile.name}</h1>
            <p className="text-sm font-bold text-slate-500 mb-4">{profile.species} • {profile.breed || 'Unknown Breed'}</p>
            
            <div className="grid gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Tag ID</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{profile.tagNumber || 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Gender</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{profile.gender}</span>
              </div>
              {profile.gender === 'Female' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Pregnancy</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{profile.pregnancyStatus}</span>
                </div>
              )}
            </div>

            <button onClick={() => navigate("/livestock/assistant")} className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <Stethoscope size={16} /> Run AI Diagnosis
            </button>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-amber-500/5 rounded-3xl p-6 border border-amber-500/20">
          <h3 className="text-sm font-black text-amber-700 dark:text-amber-500 flex items-center gap-2 mb-4">
            <Calendar size={16} /> Upcoming Reminders
          </h3>
          {upcomingReminders.length === 0 ? (
            <p className="text-xs font-semibold text-amber-800/60 dark:text-amber-500/60">No upcoming health reminders.</p>
          ) : (
            <ul className="grid gap-3">
              {upcomingReminders.map(rem => (
                <li key={rem._id} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-200 dark:border-amber-900 shadow-sm flex items-start gap-3">
                  <div className="mt-0.5">{getRecordIcon(rem.recordType)}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{rem.title}</p>
                    <p className="text-[10px] font-bold text-amber-600 mt-1 uppercase">Due: {new Date(rem.nextDueDate).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Column - Health Timeline */}
      <div className="md:col-span-2 grid gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-500" /> Health Timeline
          </h2>
          <button onClick={() => setShowRecordForm(!showRecordForm)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
            <Plus size={14} /> Add Record
          </button>
        </div>

        {showRecordForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleAddRecord} className="bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 mb-4 grid gap-4">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">New Medical Event</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Type</label>
                <select value={recordData.recordType} onChange={e => setRecordData({...recordData, recordType: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none">
                  <option value="Vaccination">Vaccination</option>
                  <option value="Deworming">Deworming</option>
                  <option value="Illness">Illness</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Pregnancy">Pregnancy</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Event Title</label>
                <input required type="text" value={recordData.title} onChange={e => setRecordData({...recordData, title: e.target.value})} placeholder="e.g. FMD Vaccine" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea rows="2" value={recordData.description} onChange={e => setRecordData({...recordData, description: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Next Due Date (Reminder)</label>
                <input type="date" value={recordData.nextDueDate} onChange={e => setRecordData({...recordData, nextDueDate: e.target.value})} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-500 text-white rounded-xl py-2 text-xs font-bold hover:bg-blue-600 transition-colors">Save Record</button>
              </div>
            </div>
          </motion.form>
        )}

        {healthRecords.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <Activity size={30} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-bold text-slate-500">No health records yet.</p>
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {healthRecords.map(record => (
              <div key={record._id} className="relative">
                <div className="absolute -left-[25px] top-1 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  {getRecordIcon(record.recordType)}
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm ml-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-white">{record.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-extrabold uppercase mb-2">
                    {record.recordType}
                  </span>
                  {record.description && <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{record.description}</p>}
                  {record.nextDueDate && (
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Calendar size={12} /> Next Due: {new Date(record.nextDueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
