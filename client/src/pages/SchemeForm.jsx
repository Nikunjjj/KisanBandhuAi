import React, { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import SelectField from "../components/SelectField";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";
import { indianStates, schemeCategories } from "../utils/schemeOptions";

const emptyForm = {
  schemeName: "",
  description: "",
  benefits: "",
  eligibilityCriteria: "",
  requiredDocuments: "",
  applicationDeadline: "",
  stateApplicability: "All India",
  ministryDepartment: "",
  applicationLink: "",
  category: "Agriculture schemes",
  isTrending: false,
  status: "Published"
};

function toTextarea(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}

function toArray(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function SchemeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadScheme() {
      if (!isEdit) return;
      try {
        const { data } = await http.get(`/schemes/${id}`);
        const scheme = data.scheme;
        setForm({
          schemeName: scheme.schemeName,
          description: scheme.description,
          benefits: toTextarea(scheme.benefits),
          eligibilityCriteria: toTextarea(scheme.eligibilityCriteria),
          requiredDocuments: toTextarea(scheme.requiredDocuments),
          applicationDeadline: toDateInput(scheme.applicationDeadline),
          stateApplicability: toTextarea(scheme.stateApplicability),
          ministryDepartment: scheme.ministryDepartment,
          applicationLink: scheme.applicationLink,
          category: scheme.category,
          isTrending: Boolean(scheme.isTrending),
          status: scheme.status
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load scheme.");
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [id, isEdit]);

  if (user?.role !== "Admin") {
    return (
      <section className="rounded-md border border-green-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Scheme management</h1>
        <p className="mt-2 text-slate-600">Only admin users can add, edit, or delete government schemes.</p>
        <Link to="/schemes" className="focus-ring mt-4 inline-flex rounded-md bg-leaf px-4 py-2 font-bold text-white">
          Browse schemes
        </Link>
      </section>
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function payload() {
    return {
      ...form,
      benefits: toArray(form.benefits),
      eligibilityCriteria: toArray(form.eligibilityCriteria),
      requiredDocuments: toArray(form.requiredDocuments),
      stateApplicability: toArray(form.stateApplicability)
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data } = isEdit ? await http.put(`/schemes/${id}`, payload()) : await http.post("/schemes", payload());
      navigate(`/schemes/${data.scheme._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save scheme.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this scheme permanently?");
    if (!confirmed) return;

    try {
      await http.delete(`/schemes/${id}`);
      navigate("/schemes");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete scheme.");
    }
  }

  if (loading) {
    return <section className="rounded-md border border-green-100 bg-white p-6 shadow-sm">Loading scheme form...</section>;
  }

  return (
    <section className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{isEdit ? "Edit scheme" : "Add government scheme"}</h1>
          <p className="mt-1 text-slate-600">Maintain verified scheme records for farmer discovery.</p>
        </div>
        {isEdit ? (
          <button type="button" onClick={handleDelete} className="focus-ring inline-flex w-fit items-center gap-2 rounded-md border border-red-200 px-4 py-2 font-bold text-red-700">
            <Trash2 size={18} /> Delete
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {error ? <Alert type="error">{error}</Alert> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <FormInput label="Scheme name" value={form.schemeName} onChange={(event) => update("schemeName", event.target.value)} required />
          <SelectField label="Category" value={form.category} onChange={(event) => update("category", event.target.value)}>
            {schemeCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <FormInput label="Ministry / department" value={form.ministryDepartment} onChange={(event) => update("ministryDepartment", event.target.value)} required />
          <FormInput label="Application deadline" type="date" value={form.applicationDeadline} onChange={(event) => update("applicationDeadline", event.target.value)} required />
          <FormInput label="Application link" type="url" value={form.applicationLink} onChange={(event) => update("applicationLink", event.target.value)} placeholder="https://official-portal.gov.in" required />
          <SelectField label="Primary state helper" value="" onChange={(event) => update("stateApplicability", event.target.value)}>
            <option value="">Choose to replace state list</option>
            {indianStates.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Description</span>
          <textarea className="focus-ring min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm" value={form.description} onChange={(event) => update("description", event.target.value)} required />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Benefits" value={form.benefits} onChange={(value) => update("benefits", value)} />
          <TextArea label="Eligibility criteria" value={form.eligibilityCriteria} onChange={(value) => update("eligibilityCriteria", value)} />
          <TextArea label="Required documents" value={form.requiredDocuments} onChange={(value) => update("requiredDocuments", value)} />
          <TextArea label="State applicability" value={form.stateApplicability} onChange={(value) => update("stateApplicability", value)} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.isTrending} onChange={(event) => update("isTrending", event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-leaf focus:ring-leaf" />
            Mark as trending
          </label>
          <SelectField label="Publication status" value={form.status} onChange={(event) => update("status", event.target.value)}>
            {["Published", "Draft", "Archived"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        </div>

        <button disabled={submitting} className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-leaf px-5 py-3 font-bold text-white shadow-sm disabled:opacity-60">
          <Save size={18} /> {submitting ? "Saving..." : "Save scheme"}
        </button>
      </form>
    </section>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        className="focus-ring min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Add one item per line"
        required
      />
    </label>
  );
}
