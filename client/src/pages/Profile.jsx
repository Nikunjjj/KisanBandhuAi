import React from "react";
import { useState } from "react";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import SelectField from "../components/SelectField";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    ...(user?.profile || {}),
    cropType: user?.profile?.cropType?.join(", ") || "",
    livestockDetails: user?.profile?.livestockDetails || []
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        landSize: Number(form.landSize || 0),
        cropType: String(form.cropType || "").split(",").map((crop) => crop.trim()).filter(Boolean)
      };
      const { data } = await http.put("/profile", payload);
      setUser(data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    }
  }

  return (
    <section className="rounded-md border border-green-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-950">Farmer profile</h1>
        <p className="mt-1 text-slate-600">This information will be used for scheme matching and DBT readiness.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {message ? <Alert type="success">{message}</Alert> : null}
        {error ? <Alert type="error">{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="State" value={form.state || ""} onChange={(event) => update("state", event.target.value)} />
          <FormInput label="District" value={form.district || ""} onChange={(event) => update("district", event.target.value)} />
          <FormInput label="Village" value={form.village || ""} onChange={(event) => update("village", event.target.value)} />
          <FormInput label="Land size (acres)" type="number" min="0" value={form.landSize || ""} onChange={(event) => update("landSize", event.target.value)} />
          <FormInput label="Crop types" value={form.cropType || ""} onChange={(event) => update("cropType", event.target.value)} />
          <SelectField label="Income category" value={form.incomeCategory || "Not Specified"} onChange={(event) => update("incomeCategory", event.target.value)}>
            {["Not Specified", "Below Poverty Line", "Low Income", "Middle Income", "High Income"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField label="Farmer category" value={form.farmerCategory || "Not Specified"} onChange={(event) => update("farmerCategory", event.target.value)}>
            {["Not Specified", "Marginal", "Small", "Medium", "Large", "Tenant", "Women Farmer", "SC/ST Farmer"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField label="Preferred language" value={form.preferredLanguage || "English"} onChange={(event) => update("preferredLanguage", event.target.value)}>
            {["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Bengali", "Punjabi"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        </div>
        <button className="focus-ring w-fit rounded-md bg-leaf px-5 py-3 font-bold text-white shadow-sm">Save profile</button>
      </form>
    </section>
  );
}
