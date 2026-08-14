import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, Stethoscope, Loader2, ArrowLeft, HeartPulse, ShieldAlert, FileText, CheckCircle, Navigation } from "lucide-react";
import { livestockApi } from "../../api/livestock";
import { motion } from "framer-motion";

const COMMON_SYMPTOMS = [
  "Fever", "Loss of Appetite", "Swollen Mouth/Hooves", "Coughing", "Limping", "Diarrhea", 
  "Excessive Salivation", "Reduced Milk Production", "Skin Lesions/Nodules", "Breathing Difficulty",
  "Abnormal Behavior", "Weight Loss", "Bloated Abdomen", "Nasal Discharge", "Tremors/Spasms"
];

export default function DiseaseAssistant() {
  const navigate = useNavigate();
  const [animalDetails, setAnimalDetails] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);

  const toggleSymptom = (sym) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAnalyze = async () => {
    if (!animalDetails.trim()) {
      setError("Please describe the animal (e.g., 3-year old dairy cow)");
      return;
    }
    if (selectedSymptoms.length === 0 && !customSymptoms.trim()) {
      setError("Please select or describe at least one symptom.");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const allSymptoms = [...selectedSymptoms];
      if (customSymptoms.trim()) allSymptoms.push(customSymptoms);

      const { data } = await livestockApi.analyzeSymptoms({
        animalDetails,
        symptomsText: allSymptoms.join(", ")
      });

      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindVet = () => {
    navigate("/agri-map?filter=vet");
  };

  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      <button onClick={() => navigate("/livestock")} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white transition-colors w-max">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-950 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-purple-400 to-slate-900 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3.5 mb-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/15 text-indigo-300 shadow-glow-indigo backdrop-blur-md">
            <Stethoscope size={20} className="animate-pulse" />
          </span>
          <div>
            <span className="rounded-full bg-indigo-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-indigo-300 tracking-wider">
              AI Powered
            </span>
            <h1 className="text-2xl font-black tracking-tight leading-none mt-1">Cattle Disease Assistant</h1>
          </div>
        </div>
        <p className="mt-2 text-xs md:text-sm text-indigo-100/90 leading-relaxed font-semibold">
          Select observed symptoms or describe them to get an instant AI-driven diagnostic report, including first-aid and emergency steps.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl p-4 text-sm font-bold">
          <AlertTriangle size={18} className="shrink-0" /> {error}
        </div>
      )}

      {!diagnosis ? (
        <div className="grid gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-sm font-bold text-slate-850 dark:text-white mb-2">1. Animal Profile Summary</label>
            <input
              type="text"
              placeholder="e.g. 5-year-old Murrah Buffalo, lactating"
              value={animalDetails}
              onChange={(e) => setAnimalDetails(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-sm font-bold text-slate-850 dark:text-white mb-4">2. Select Observed Symptoms</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {COMMON_SYMPTOMS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedSymptoms.includes(sym)
                      ? "bg-indigo-500 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold text-slate-850 dark:text-white mb-2">3. Additional Observations (Optional)</label>
            <textarea
              rows="3"
              placeholder="Describe any other abnormal behavior, feeding issues, etc."
              value={customSymptoms}
              onChange={(e) => setCustomSymptoms(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-black shadow-premium transition-all disabled:opacity-70"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processing Analysis...</> : <><Activity size={18} /> Generate AI Diagnosis</>}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
          
          {/* Result Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-premium relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${diagnosis.shouldConsultVet ? 'bg-red-500' : 'bg-orange-500'}`} />
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-4">AI Diagnostic Result</p>
            <h2 className="text-2xl font-black text-slate-850 dark:text-white pl-4 flex items-center gap-2">
              {diagnosis.diseaseIdentified}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3 pl-4">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase rounded-full">
                Confidence: {diagnosis.confidence}
              </span>
              {diagnosis.isContagious && (
                <span className="px-3 py-1 bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-extrabold uppercase rounded-full flex items-center gap-1">
                  <ShieldAlert size={12} /> Highly Contagious
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-4 pl-4 leading-relaxed">
              {diagnosis.diseaseDescription}
            </p>
          </div>

          {/* Emergency / Isolation */}
          {(diagnosis.emergencySteps?.length > 0 || diagnosis.isolationPrecautions) && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-black text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
                <AlertTriangle size={18} /> Critical Action Required
              </h3>
              
              {diagnosis.isolationPrecautions && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-red-800/70 dark:text-red-400/70 uppercase tracking-wider mb-1">Isolation Protocol</p>
                  <p className="text-sm font-bold text-red-900 dark:text-red-300">{diagnosis.isolationPrecautions}</p>
                </div>
              )}

              {diagnosis.emergencySteps?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-800/70 dark:text-red-400/70 uppercase tracking-wider mb-2">Emergency Steps</p>
                  <ul className="grid gap-2">
                    {diagnosis.emergencySteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-semibold text-red-900 dark:text-red-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Treatment & First Aid */}
          <div className="grid md:grid-cols-2 gap-4">
            {diagnosis.firstAidInstructions?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 mb-3">
                  <Activity size={16} className="text-blue-500" /> First Aid Instructions
                </h3>
                <ul className="grid gap-2">
                  {diagnosis.firstAidInstructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {diagnosis.suggestedTreatment?.chemical?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 mb-3">
                  <HeartPulse size={16} className="text-indigo-500" /> Medical Treatment
                </h3>
                <ul className="grid gap-2">
                  {diagnosis.suggestedTreatment.chemical.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 shrink-0" /> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Expert Advice & Map */}
          {diagnosis.shouldConsultVet && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-amber-700 dark:text-amber-500 flex items-center gap-2 mb-2">
                  <Stethoscope size={18} /> Veterinary Consultation Advised
                </h3>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-400/80 leading-relaxed">
                  {diagnosis.expertAdvice}
                </p>
              </div>
              <button 
                onClick={handleFindVet}
                className="shrink-0 w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Navigation size={18} /> Find Nearest Vet
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setDiagnosis(null);
              setSelectedSymptoms([]);
              setCustomSymptoms("");
            }}
            className="w-full border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-3.5 rounded-2xl font-bold transition-all text-sm mt-4"
          >
            Start New Diagnosis
          </button>
        </motion.div>
      )}
    </div>
  );
}
