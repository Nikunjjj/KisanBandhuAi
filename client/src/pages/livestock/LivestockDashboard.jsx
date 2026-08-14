import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Activity, Syringe, HeartPulse, Stethoscope, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import { livestockApi } from "../../api/livestock";
import { motion } from "framer-motion";

export default function LivestockDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data } = await livestockApi.getProfiles();
      setProfiles(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch livestock profiles");
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesIcon = (species) => {
    // simplified icon mapping
    return <HeartPulse className="text-blue-500" size={24} />;
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-leaf" /></div>;

  return (
    <div className="grid gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white">Livestock Manager</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Manage health records and AI diagnostics for your herd</p>
        </div>
        <Link 
          to="/livestock/new" 
          className="flex items-center gap-2 bg-leaf hover:bg-leaf-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-premium transition-colors"
        >
          <Plus size={18} /> Register Animal
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <HeartPulse size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Herd</p>
            <p className="text-xl font-black text-slate-850 dark:text-white mt-0.5">{profiles.length}</p>
          </div>
        </div>
        
        <Link to="/livestock/assistant" className="col-span-2 md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-2xl shadow-xl flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 transition-transform duration-500">
            <Stethoscope size={100} />
          </div>
          <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0 backdrop-blur-md">
            <Activity size={24} />
          </div>
          <div className="relative z-10 text-white">
            <h3 className="text-lg font-black tracking-tight">AI Disease Assistant</h3>
            <p className="text-xs font-semibold text-indigo-100 mt-1">Diagnose symptoms instantly</p>
          </div>
          <ChevronRight className="text-white/60 ml-auto relative z-10" />
        </Link>
      </div>

      {/* Profiles Grid */}
      <div>
        <h2 className="text-base font-extrabold text-slate-850 dark:text-white mb-4 flex items-center gap-2">
          Your Registered Animals
        </h2>
        
        {profiles.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            <HeartPulse size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No animals registered yet</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 mb-4">Start managing your herd's health today</p>
            <Link 
              to="/livestock/new" 
              className="inline-flex items-center gap-2 bg-leaf text-white px-4 py-2 rounded-xl font-bold shadow-sm"
            >
              <Plus size={16} /> Register First Animal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map(profile => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={profile._id}
              >
                <Link 
                  to={`/livestock/${profile._id}`}
                  className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                        {getSpeciesIcon(profile.species)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 dark:text-white group-hover:text-leaf transition-colors">{profile.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{profile.species} • {profile.breed || 'Mixed'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tag ID</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{profile.tagNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{profile.gender}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
