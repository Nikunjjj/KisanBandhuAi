import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  IdCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  XCircle,
  X
} from "lucide-react";
import { http } from "../api/http";
import Alert from "../components/Alert";

// ─── Document type config ────────────────────────────────────────────────────
const DOC_TYPES = [
  {
    type: "aadhaar",
    label: "Aadhaar Card",
    description: "Upload your Aadhaar card (front & back on one page)",
    icon: IdCard,
    color: "sky"
  },
  {
    type: "land_ownership",
    label: "Land Ownership Document",
    description: "Khasra / ROR / 7-12 extract or patta document",
    icon: Landmark,
    color: "green"
  },
  {
    type: "income_certificate",
    label: "Income Certificate",
    description: "Annual income certificate issued by Tehsildar/SDM",
    icon: FileText,
    color: "amber"
  },
  {
    type: "farmer_verification",
    label: "Farmer Verification Document",
    description: "PM-KISAN registration / Kisan card / state farmer ID",
    icon: UserCheck,
    color: "violet"
  }
];

const COLOR_MAP = {
  sky: { bg: "bg-sky-50", border: "border-sky-200", icon: "bg-sky-100 text-sky-700", badge: "text-sky-700" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "bg-green-100 text-green-700", badge: "text-green-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "bg-amber-100 text-amber-700", badge: "text-amber-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "bg-violet-100 text-violet-700", badge: "text-violet-700" }
};

// Status badge helpers
function StatusBadge({ status }) {
  const cfg = {
    pending: { icon: Clock, cls: "bg-amber-100 text-amber-800", label: "Pending Review" },
    verified: { icon: CheckCircle, cls: "bg-green-100 text-green-800", label: "Verified" },
    rejected: { icon: XCircle, cls: "bg-red-100 text-red-800", label: "Rejected" }
  };
  const { icon: Icon, cls, label } = cfg[status] || cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Single document card ────────────────────────────────────────────────────
function DocCard({ config, doc, onUpload, onDelete, onPreview }) {
  const { type, label, description, icon: Icon, color } = config;
  const c = COLOR_MAP[color];
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const isUploaded = doc?.uploaded;

  async function handleFile(file) {
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!ALLOWED.includes(file.type)) {
      setUploadErr("Only JPEG, PNG, or PDF files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr("File must be under 5 MB.");
      return;
    }
    setUploadErr("");
    setUploading(true);
    try {
      const dataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await onUpload({ type, fileName: file.name, mimeType: file.type, dataUri });
    } catch (e) {
      setUploadErr(e?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <article className={`rounded-xl border-2 ${isUploaded ? c.border : "border-dashed border-slate-200"} bg-white shadow-sm transition-all`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${c.icon}`}>
            <Icon size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">{label}</h3>
              {isUploaded && <StatusBadge status={doc.verificationStatus || "pending"} />}
            </div>
            <p className="mt-1 text-sm text-slate-500">{description}</p>

            {isUploaded && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {doc.fileName}
                </span>
                <span>{formatBytes(doc.size)}</span>
                <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : ""}</span>
              </div>
            )}
          </div>
        </div>

        {uploadErr && (
          <p className="mt-3 flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <XCircle size={14} /> {uploadErr}
          </p>
        )}

        {/* Action row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isUploaded ? (
            <>
              <button
                onClick={() => onPreview(doc._id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Eye size={15} /> Preview
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                <Upload size={15} /> Replace
                <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={onInputChange} ref={fileRef} />
              </label>
              <button
                onClick={() => onDelete(doc._id, type)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={15} /> Remove
              </button>
            </>
          ) : (
            <label
              className={`flex-1 cursor-pointer rounded-lg border-2 border-dashed ${dragOver ? c.border + " " + c.bg : "border-slate-200"} p-4 text-center transition-colors hover:${c.bg} hover:${c.border}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                  <Loader2 size={18} className="animate-spin" /> Uploading…
                </span>
              ) : (
                <>
                  <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">Click to upload or drag &amp; drop</p>
                  <p className="mt-1 text-xs text-slate-400">JPEG, PNG, PDF · max 5 MB</p>
                </>
              )}
              <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={onInputChange} disabled={uploading} />
            </label>
          )}
          {isUploaded && uploading && (
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Uploading…
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Preview modal (iframe for PDF, img for images) ─────────────────────────
function PreviewModal({ docId, onClose }) {
  const token = localStorage.getItem("kisanbandhu_token");
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const previewUrl = `${base}/documents/${docId}/preview?token=${encodeURIComponent(token || "")}`;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Document Preview</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden rounded-b-2xl">
          <iframe
            src={previewUrl}
            title="Document Preview"
            className="h-full w-full"
            style={{ border: "none" }}
            // Pass auth header via URL is not possible for iframes;
            // we embed the token in the src via query param (server must accept it)
          />
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Note: If the document is protected, open it in a new tab for full access.
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type }

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await http.get("/documents");
      setDocuments(res.data.documents || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function handleUpload({ type, fileName, mimeType, dataUri }) {
    await http.post("/documents/upload", { type, fileName, mimeType, dataUri });
    setSuccess("Document uploaded successfully!");
    setTimeout(() => setSuccess(""), 4000);
    fetchDocs();
  }

  async function handleDelete(id) {
    try {
      await http.delete(`/documents/${id}`);
      setSuccess("Document removed.");
      setTimeout(() => setSuccess(""), 3000);
      setDeleteTarget(null);
      fetchDocs();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete document.");
    }
  }

  const docMap = {};
  for (const d of documents) docMap[d.type] = d;

  const verifiedCount = documents.filter((d) => d.uploaded && d.verificationStatus === "verified").length;
  const uploadedCount = documents.filter((d) => d.uploaded).length;

  return (
    <section className="grid gap-6">
      {/* ── Page header ── */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Secure Document Vault</p>
            <h1 className="text-2xl font-bold">Document Management</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-slate-300">
          Securely store your KYC documents required for government scheme applications. All documents are encrypted
          and visible only to you.
        </p>

        {/* Progress bar */}
        <div className="mt-5 max-w-sm">
          <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300">
            <span>{uploadedCount} of {DOC_TYPES.length} documents uploaded</span>
            <span>{verifiedCount} verified</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-green-400 transition-all duration-700"
              style={{ width: `${(uploadedCount / DOC_TYPES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && <Alert type="error">{error}</Alert>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* ── Security info strip ── */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <span className="flex items-center gap-1.5"><ShieldCheck size={15} /> End-to-end encrypted storage</span>
        <span className="flex items-center gap-1.5"><CheckCircle size={15} /> Documents used only for scheme verification</span>
        <span className="flex items-center gap-1.5"><Clock size={15} /> Verification typically takes 3–5 working days</span>
      </div>

      {/* ── Document cards grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {DOC_TYPES.map((cfg) => (
            <DocCard
              key={cfg.type}
              config={cfg}
              doc={docMap[cfg.type]}
              onUpload={handleUpload}
              onPreview={(id) => setPreviewId(id)}
              onDelete={(id, type) => setDeleteTarget({ id, type })}
            />
          ))}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Remove Document?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently delete the document. You will need to re-upload it for scheme verification.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {previewId && <PreviewModal docId={previewId} onClose={() => setPreviewId(null)} />}
    </section>
  );
}
