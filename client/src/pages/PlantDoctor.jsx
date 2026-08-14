import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Droplet,
  FlaskConical,
  Info,
  Layers,
  Leaf,
  Loader2,
  Phone,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  TrendingUp,
  Upload,
  Wrench,
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { http } from "../api/http";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type || "image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SeverityBadge({ severity, health }) {
  const colorMap = {
    Healthy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Mild: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    Moderate: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    Severe: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Stressed: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "Pest-Infested": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Unknown: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
  };
  const label = severity || health;
  const cls = colorMap[label] || colorMap.Unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
      {label === "Healthy" ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      {label}
    </span>
  );
}

function ExpandableSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-premium">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <span className="flex items-center gap-2.5 font-bold text-slate-850 dark:text-white">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/20 dark:bg-slate-950/20">{children}</div>}
    </div>
  );
}

function BulletList({ items, color = "leaf" }) {
  const colorMap = { 
    leaf: "bg-leaf", 
    orange: "bg-orange-500", 
    blue: "bg-blue-500", 
    red: "bg-red-500" 
  };
  return (
    <ul className="grid gap-2.5">
      {(items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${colorMap[color] || "bg-slate-400"}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function GrowthStageProgress({ currentStage }) {
  const stages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvesting", "Mature"];
  const currentIndex = stages.findIndex((s) => s.toLowerCase() === (currentStage || "").toLowerCase());

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
      <h3 className="mb-5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Activity size={16} className="text-leaf" /> Current Growth Stage: <span className="text-leaf dark:text-leaf-400 font-extrabold">{currentStage || "Unknown"}</span>
      </h3>
      <div className="relative flex items-center justify-between px-2">
        {/* Connection Line */}
        <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 bg-slate-100 dark:bg-slate-800" />
        <div
          className="absolute left-4 top-1/2 h-1 -translate-y-1/2 bg-leaf transition-all duration-500"
          style={{ width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 92 : 0}%` }}
        />

        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={stage} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  isActive
                    ? "border-leaf bg-leaf text-white scale-110 shadow"
                    : isCompleted
                      ? "border-leaf bg-white text-leaf dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span className={`mt-2 text-[9px] font-bold ${isActive ? "text-leaf dark:text-leaf-400" : "text-slate-500"}`}>{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CultivationGrid({ requirements }) {
  if (!requirements) return null;
  const items = [
    { title: "Soil Profile", value: requirements.soil, icon: <Layers size={18} className="text-amber-600" />, bg: "bg-amber-500/5 border-amber-500/10" },
    { title: "Irrigation Schedule", value: requirements.watering, icon: <Droplet size={18} className="text-blue-600" />, bg: "bg-blue-500/5 border-blue-500/10" },
    { title: "Sunlight Exposure", value: requirements.sunlight, icon: <Sun size={18} className="text-yellow-600" />, bg: "bg-yellow-500/5 border-yellow-500/10" },
    { title: "Optimal Temp", value: requirements.temperature, icon: <Thermometer size={18} className="text-red-650" />, bg: "bg-red-500/5 border-red-500/10" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className={`rounded-2xl border p-4 flex gap-3 shadow-premium ${item.bg}`}>
          <div className="mt-0.5 shrink-0">{item.icon}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-850 dark:text-white leading-relaxed">{item.value || "N/A"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Diagnosis Result Card ────────────────────────────────────────────────────

function DiagnosisResult({ diagnosis, imageUrl, onReset }) {
  const [activeTab, setActiveTab] = useState("diagnosis"); // diagnosis | cultivation
  const isHealthy = diagnosis.plantHealth === "Healthy";

  // Calculate mock health score out of 100
  const getHealthScore = () => {
    if (isHealthy) return 98;
    if (diagnosis.diseaseSeverity === "Severe" || diagnosis.plantHealth === "Pest-Infested") return 32;
    if (diagnosis.diseaseSeverity === "Moderate") return 55;
    return 78; // Mild or Stressed
  };

  const healthScore = getHealthScore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-5"
    >
      {/* Header Banner */}
      <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden ${
        isHealthy
          ? "bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 shadow-emerald-500/5"
          : diagnosis.plantHealth === "Diseased" || diagnosis.plantHealth === "Pest-Infested"
            ? "bg-gradient-to-br from-red-600 via-orange-600 to-amber-700 shadow-red-500/5"
            : "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 shadow-amber-500/5"
      }`}>
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
          <Leaf size={220} />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1.5">Crop Identified</p>
            <h2 className="text-3xl font-black tracking-tight leading-none">{diagnosis.cropIdentified}</h2>
            {diagnosis.scientificName && (
              <p className="mt-1 text-xs italic font-medium opacity-90">({diagnosis.scientificName})</p>
            )}
            
            {diagnosis.diseaseDetected && (
              <div className="mt-3 flex items-center gap-1.5 text-base font-black bg-white/20 px-3.5 py-1 rounded-xl w-max mx-auto md:mx-0 backdrop-blur-md border border-white/10">
                <AlertTriangle size={15} />
                {diagnosis.diseaseDetected}
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <SeverityBadge health={diagnosis.plantHealth} severity={diagnosis.diseaseSeverity} />
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold">
                {diagnosis.confidence} Confidence
              </span>
              {diagnosis.bestSeason && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold">
                  {diagnosis.bestSeason} Season
                </span>
              )}
            </div>
          </div>

          {/* Health circular score display */}
          <div className="flex items-center gap-4 bg-black/15 p-4 rounded-3xl border border-white/10 backdrop-blur-md shrink-0">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/15"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${isHealthy ? "text-emerald-300" : healthScore > 50 ? "text-yellow-300" : "text-red-300"}`}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-sm font-black tracking-tighter text-white">{healthScore}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-200 uppercase tracking-wider">Health Index</p>
              <p className="text-xs font-extrabold text-white mt-0.5">{isHealthy ? "Excellent condition" : "Requires Attention"}</p>
            </div>
          </div>

          {imageUrl && (
            <img src={imageUrl} alt="Plant" className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-4 ring-white/20 shrink-0" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("diagnosis")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
            activeTab === "diagnosis"
              ? "bg-white dark:bg-slate-900 text-leaf shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Activity size={14} /> Medical Diagnosis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cultivation")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
            activeTab === "cultivation"
              ? "bg-white dark:bg-slate-900 text-leaf shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Sprout size={14} /> Cultivation Advisor
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "diagnosis" && (
        <div className="grid gap-5 animate-fadeIn">
          {/* Yield impact */}
          {diagnosis.estimatedYieldImpact && !isHealthy && (
            <div className="flex gap-3 rounded-2xl border border-red-200 dark:border-red-950 bg-red-500/5 dark:bg-red-950/10 p-4">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-650 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Yield Impact Warning</p>
                <p className="mt-1 text-xs text-red-700 dark:text-red-300 font-semibold leading-relaxed">{diagnosis.estimatedYieldImpact}</p>
              </div>
            </div>
          )}

          {/* Immediate actions */}
          {diagnosis.immediateActions?.length > 0 && (
            <ExpandableSection
              title="Immediate Emergency Actions"
              icon={<Zap size={16} className="text-orange-500" />}
              defaultOpen={true}
            >
              <BulletList items={diagnosis.immediateActions} color="orange" />
            </ExpandableSection>
          )}

          {/* Cause & Symptoms */}
          {(diagnosis.cause || (diagnosis.symptoms && diagnosis.symptoms.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnosis.cause && (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900 px-5 py-4 shadow-premium">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Info size={13} /> Scientific Etiology
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">{diagnosis.cause}</p>
                </div>
              )}
              {diagnosis.symptoms?.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900 px-5 py-4 shadow-premium">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Symptoms Observed
                  </p>
                  <BulletList items={diagnosis.symptoms} color="orange" />
                </div>
              )}
            </div>
          )}

          {/* Treatment plan */}
          {diagnosis.treatment && (
            <ExpandableSection
              title="Treatment & Remedies Blueprint"
              icon={<FlaskConical size={16} className="text-blue-500" />}
              defaultOpen={!isHealthy}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {diagnosis.treatment.organic?.length > 0 && (
                  <div className="rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      🌿 Organic Control
                    </p>
                    <BulletList items={diagnosis.treatment.organic} color="leaf" />
                  </div>
                )}
                {diagnosis.treatment.chemical?.length > 0 && (
                  <div className="rounded-xl bg-blue-500/5 p-4 border border-blue-500/10">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                      🧪 Chemical Control
                    </p>
                    <BulletList items={diagnosis.treatment.chemical} color="blue" />
                  </div>
                )}
                {diagnosis.treatment.preventive?.length > 0 && (
                  <div className="rounded-xl bg-orange-500/5 p-4 border border-orange-500/10 sm:col-span-2">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-orange-800 dark:text-orange-400 flex items-center gap-1.5">
                      🛡 Preventive Management
                    </p>
                    <BulletList items={diagnosis.treatment.preventive} color="orange" />
                  </div>
                )}
              </div>
            </ExpandableSection>
          )}

          {/* Growing advice */}
          {diagnosis.growingAdvice?.length > 0 && (
            <ExpandableSection title="General Crop Growing Advice" icon={<Leaf size={16} className="text-leaf" />} defaultOpen={isHealthy}>
              <BulletList items={diagnosis.growingAdvice} />
            </ExpandableSection>
          )}

          {/* Expert alert */}
          {diagnosis.shouldConsultExpert && (
            <div className="flex gap-4 rounded-2xl border border-amber-200 dark:border-amber-950 bg-amber-500/5 dark:bg-amber-950/10 p-5 shadow-premium">
              <Phone size={20} className="mt-0.5 shrink-0 text-amber-650 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Expert Consultation Recommended</p>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{diagnosis.expertAdvice}</p>
                <div className="mt-4 flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 px-4 py-2 rounded-2xl w-max font-bold text-xs cursor-pointer shadow-premium transition-all">
                  <Phone size={13} /> Call Kisan Center: 1800-180-1551
                </div>
              </div>
            </div>
          )}

          {/* Government schemes */}
          {diagnosis.governmentSchemes?.length > 0 && (
            <ExpandableSection title="Relevant Government Support Schemes" icon={<Award size={16} className="text-purple-500" />}>
              <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Subsidy & Aid matchmakers</p>
              <BulletList items={diagnosis.governmentSchemes} color="blue" />
            </ExpandableSection>
          )}
        </div>
      )}

      {activeTab === "cultivation" && (
        <div className="grid gap-5 animate-fadeIn">
          {/* Growth Stage Progress */}
          {diagnosis.growthStage && (
            <GrowthStageProgress currentStage={diagnosis.growthStage} />
          )}

          {/* Cultivation Grid */}
          {diagnosis.cultivationRequirements && (
            <div className="grid gap-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sprout size={16} className="text-leaf" /> Cultivation Parameters
              </h3>
              <CultivationGrid requirements={diagnosis.cultivationRequirements} />
            </div>
          )}

          {/* Nutrient status & Fertilizer suggestions */}
          {(diagnosis.nutrientDeficiencies || (diagnosis.fertilizerSuggestions && diagnosis.fertilizerSuggestions.length > 0)) && (
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium grid gap-4">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <FlaskConical size={16} className="text-leaf" /> Nutrient & Chemical Status
              </h3>
              {diagnosis.nutrientDeficiencies && (
                <div className="rounded-xl border border-yellow-250 bg-yellow-500/5 p-3.5 flex gap-3 text-xs text-yellow-800 dark:text-yellow-450 font-semibold">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-605" />
                  <div>
                    <span className="font-bold">Deficiency Warning:</span> {diagnosis.nutrientDeficiencies}
                  </div>
                </div>
              )}
              {diagnosis.fertilizerSuggestions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Suggested Fertilizer Regimes</p>
                  <BulletList items={diagnosis.fertilizerSuggestions} color="leaf" />
                </div>
              )}
            </div>
          )}

          {/* Irrigation guidance */}
          {diagnosis.irrigationGuidance?.length > 0 && (
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium grid gap-3">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Droplet size={16} className="text-blue-500" /> Irrigation Directives
              </h3>
              <BulletList items={diagnosis.irrigationGuidance} color="blue" />
            </div>
          )}

          {/* Crop management & Yield maximization */}
          {(diagnosis.cropManagementTips?.length > 0 || diagnosis.yieldMaximizationTips?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnosis.cropManagementTips?.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <Wrench size={16} className="text-amber-500" /> Crop Management Tips
                  </h3>
                  <BulletList items={diagnosis.cropManagementTips} color="orange" />
                </div>
              )}
              {diagnosis.yieldMaximizationTips?.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <TrendingUp size={16} className="text-emerald-500" /> Yield Maximization
                  </h3>
                  <BulletList items={diagnosis.yieldMaximizationTips} color="leaf" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reset Scan */}
      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-leaf bg-white dark:bg-slate-900 py-3 font-bold text-leaf hover:bg-leaf hover:text-white transition-all shadow-premium"
      >
        <RefreshCw size={15} /> Scan Another Plant
      </button>
    </motion.div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onImageSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="grid gap-4 animate-fadeIn">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
          isDragging 
            ? "border-leaf bg-leaf-50/50 dark:bg-leaf-950/20 scale-[1.01]" 
            : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-leaf hover:bg-leaf-50/40 dark:hover:bg-slate-900/60"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-500/10 text-leaf shadow-glow-green">
          <Upload size={28} />
        </div>
        <div>
          <p className="text-base font-extrabold text-slate-805 dark:text-white">Drop your crop foliage photo here</p>
          <p className="mt-1.5 text-xs text-slate-500">or click to browse local files — JPG, PNG, WebP up to 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">or camera capture</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-2xl bg-leaf hover:bg-leaf-600 py-3.5 font-bold text-white shadow-premium transition-all"
      >
        <Camera size={18} /> Trigger Device Camera
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ─── Preview with Analyze Button ─────────────────────────────────────────────

function ImagePreview({ file, imageUrl, onAnalyze, onClear, loading }) {
  const [scanStep, setScanStep] = useState(0);

  // Cycle scanning milestones for realistic high-fidelity AI feedback
  useEffect(() => {
    if (!loading) return;
    setScanStep(0);
    const intervals = [
      setTimeout(() => setScanStep(1), 1000),
      setTimeout(() => setScanStep(2), 2200),
      setTimeout(() => setScanStep(3), 3500),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [loading]);

  return (
    <div className="grid gap-5 animate-fadeIn">
      
      {/* Uploaded container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-950 max-h-[300px] flex items-center justify-center">
        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover max-h-[300px] opacity-90" />
        
        {/* Scanning glowing overlay */}
        {loading && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scanning" />
          </div>
        )}

        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
        >
          <X size={15} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex justify-between items-end">
          <p className="text-xs font-bold text-white truncate max-w-[70%]">{file?.name}</p>
          <span className="text-[10px] text-green-300 font-extrabold uppercase bg-black/40 px-2 py-0.5 rounded-lg border border-white/5 backdrop-blur-md">
            {(file?.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
      </div>

      {/* Control Scan Button */}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={loading}
        className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-leaf-600 to-green-600 py-3.5 text-base font-black text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Performing Diagnostics...
          </>
        ) : (
          <>
            <Sparkles size={18} /> Initiate AI Scan
          </>
        )}
      </button>

      {/* Multi-step checkpoint scanner details */}
      {loading && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/40">
          <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">AI Scanning Progress</p>
          <div className="grid gap-2 text-xs">
            {[
              "Identifying crop species structure...",
              "Analyzing leaf lesions and chlorosis tags...",
              "Determining nutrient status indexes...",
              "Compiling custom organic control regimes..."
            ].map((stepText, index) => {
              const isActive = scanStep === index;
              const isPassed = scanStep > index;
              return (
                <div key={index} className={`flex items-center gap-2.5 transition-opacity duration-300 ${isPassed ? "text-leaf dark:text-leaf-400 font-bold" : isActive ? "text-slate-800 dark:text-white font-bold" : "text-slate-400 opacity-60"}`}>
                  {isPassed ? (
                    <CheckCircle size={13} className="shrink-0" />
                  ) : isActive ? (
                    <Loader2 size={13} className="animate-spin shrink-0 text-leaf" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlantDoctor() {
  const [step, setStep] = useState("upload"); // upload | preview | result
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);

  const handleImageSelected = (selectedFile) => {
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
    setError("");
    setStep("preview");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const base64 = await toBase64(file);
      
      // Delay mock to display scanning visual check points
      const requestPromise = http.post("/plant-doctor/analyze", {
        imageBase64: base64,
        mimeType: file.type
      });

      const [res] = await Promise.all([
        requestPromise,
        new Promise((resolve) => setTimeout(resolve, 4500)) // ensure scanning effects complete
      ]);

      setDiagnosis(res.data.diagnosis);
      setStep("result");
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try with a clearer crop photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setImageUrl("");
    setDiagnosis(null);
    setError("");
  };

  return (
    <section className="mx-auto max-w-2xl grid gap-6">
      
      {/* SaaS AI HERO TITLE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-950 via-leaf-800 to-emerald-950 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-300 via-emerald-400 to-slate-900 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3.5 mb-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/15 text-emerald-350 shadow-glow-green backdrop-blur-md">
            <Sparkles size={20} className="animate-pulse" />
          </span>
          <div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-350 tracking-wider">
              Flagship AI
            </span>
            <h1 className="text-2xl font-black tracking-tight leading-none mt-1">Plant Doctor</h1>
          </div>
        </div>
        <p className="mt-2.5 text-xs md:text-sm text-green-100/90 leading-relaxed font-semibold">
          Identify crop species, discover nutrient deficiencies, and receive instant diagnostic treatment plans in seconds. Powered by Meta Llama 4 Scout Vision.
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {["Crop Identification", "Pathogen Detection", "Nutrient Scans", "Treatment Planners"].map((tag) => (
            <span key={tag} className="rounded-xl bg-white/10 px-3 py-1 text-[10px] font-bold text-green-200 border border-white/5 backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950 bg-red-500/5 dark:bg-red-950/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-650" />
          <div>
            <p className="font-bold text-red-800 dark:text-red-400 text-sm">Analysis Pipeline Error</p>
            <p className="text-xs text-red-750 dark:text-red-300 mt-1 font-semibold leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Steps */}
      {step === "upload" && <UploadZone onImageSelected={handleImageSelected} />}
      {step === "preview" && (
        <ImagePreview
          file={file}
          imageUrl={imageUrl}
          onAnalyze={handleAnalyze}
          onClear={handleReset}
          loading={loading}
        />
      )}
      {step === "result" && diagnosis && (
        <DiagnosisResult diagnosis={diagnosis} imageUrl={imageUrl} onReset={handleReset} />
      )}

      {/* Tips */}
      {step === "upload" && (
        <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 p-5 shadow-premium">
          <p className="mb-3 text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">📸 Diagnostic Instructions</p>
          <ul className="grid gap-2.5">
            {[
              "Take a sharp close-up photo of the affected plant leaf or stem",
              "Maintain clear lighting conditions — natural daylight yields highest accuracy",
              "Center the infected node with symptoms visible in the camera viewfinder",
              "Avoid out-of-focus or blurry images to prevent detection failures"
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
