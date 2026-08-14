import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock, Landmark, Map, Crop, Trees, Languages, UserCheck } from "lucide-react";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import SelectField from "../components/SelectField";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    profile: {
      state: "",
      district: "",
      village: "",
      landSize: "",
      cropType: "",
      incomeCategory: "Not Specified",
      farmerCategory: "Not Specified",
      preferredLanguage: "English"
    }
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function updateProfile(field, value) {
    setForm({ ...form, profile: { ...form.profile, [field]: value } });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.email && !form.phone) {
      setError("Please provide either an email or a phone number");
      setSubmitting(false);
      return;
    }

    let formattedPhone = form.phone;
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    }

    try {
      await register({
        ...form,
        phone: formattedPhone,
        profile: {
          ...form.profile,
          landSize: Number(form.profile.landSize || 0),
          cropType: form.profile.cropType.split(",").map((crop) => crop.trim()).filter(Boolean)
        }
      });
      if (form.email) {
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please check details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Register Farm Profile" subtitle="Create your secure digital farming profile in minutes.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error ? <Alert type="error">{error}</Alert> : null}
        
        {/* Responsive Grid for Registration Form */}
        <div className="grid gap-4 sm:grid-cols-2 max-h-[480px] overflow-y-auto pr-1">
          
          {/* Section: Account Info */}
          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold text-leaf uppercase tracking-widest block mb-2 border-b pb-1 border-slate-100 dark:border-slate-800">
              Account Credentials
            </span>
          </div>

          <FormInput 
            label="Full Name" 
            value={form.name} 
            onChange={(event) => setForm({ ...form, name: event.target.value })} 
            required 
            placeholder="e.g. Ramesh Kumar"
          />
          <FormInput 
            label="Phone Number" 
            value={form.phone} 
            onChange={(event) => setForm({ ...form, phone: event.target.value })} 
            placeholder="e.g. +91 9876543210 (Optional if Email is provided)"
          />
          <FormInput 
            label="Email Address" 
            type="email" 
            value={form.email} 
            onChange={(event) => setForm({ ...form, email: event.target.value })} 
            placeholder="e.g. ramesh@example.com (Optional if Phone is provided)"
          />
          <FormInput 
            label="Password" 
            type="password" 
            value={form.password} 
            onChange={(event) => setForm({ ...form, password: event.target.value })} 
            required 
            placeholder="Minimum 8 characters"
          />

          {/* Section: Farm Geography */}
          <div className="sm:col-span-2 mt-2">
            <span className="text-[10px] font-bold text-leaf uppercase tracking-widest block mb-2 border-b pb-1 border-slate-100 dark:border-slate-800">
              Farm Location
            </span>
          </div>

          <FormInput 
            label="State applicability" 
            value={form.profile.state} 
            onChange={(event) => updateProfile("state", event.target.value)} 
            placeholder="e.g. Karnataka"
          />
          <FormInput 
            label="District" 
            value={form.profile.district} 
            onChange={(event) => updateProfile("district", event.target.value)} 
            placeholder="e.g. Bengaluru Rural"
          />
          <FormInput 
            label="Village" 
            value={form.profile.village} 
            onChange={(event) => updateProfile("village", event.target.value)} 
            placeholder="e.g. Channapatna"
          />
          <FormInput 
            label="Land Size (Acres)" 
            type="number" 
            min="0" 
            step="0.1"
            value={form.profile.landSize} 
            onChange={(event) => updateProfile("landSize", event.target.value)} 
            placeholder="e.g. 4.5"
          />

          {/* Section: Crop & Farmer category details */}
          <div className="sm:col-span-2 mt-2">
            <span className="text-[10px] font-bold text-leaf uppercase tracking-widest block mb-2 border-b pb-1 border-slate-100 dark:border-slate-800">
              Agricultural details
            </span>
          </div>

          <div className="sm:col-span-2">
            <FormInput 
              label="Crops Cultivated" 
              value={form.profile.cropType} 
              onChange={(event) => updateProfile("cropType", event.target.value)} 
              placeholder="e.g. Wheat, Rice, Cotton (comma separated)"
            />
          </div>

          <SelectField label="Income Category" value={form.profile.incomeCategory} onChange={(event) => updateProfile("incomeCategory", event.target.value)}>
            {["Not Specified", "Below Poverty Line", "Low Income", "Middle Income", "High Income"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>

          <SelectField label="Farmer Category" value={form.profile.farmerCategory} onChange={(event) => updateProfile("farmerCategory", event.target.value)}>
            {["Not Specified", "Marginal", "Small", "Medium", "Large", "Tenant", "Women Farmer", "SC/ST Farmer"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>

          <div className="sm:col-span-2">
            <SelectField label="Preferred Interface Language" value={form.profile.preferredLanguage} onChange={(event) => updateProfile("preferredLanguage", event.target.value)}>
              {["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Bengali", "Punjabi"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
          </div>
        </div>

        <button 
          className="focus-ring mt-4 flex items-center justify-center gap-2 rounded-2xl bg-leaf hover:bg-leaf-600 px-4 py-3.5 font-bold text-white shadow-premium disabled:opacity-60 transition-colors"
          disabled={submitting}
        >
          {submitting ? "Registering profile..." : "Create Digital Profile"}
        </button>
      </form>
      <p className="mt-6 text-sm font-semibold text-slate-500 text-center">
        Already registered? <Link className="text-leaf hover:underline" to="/login">Sign in here</Link>
      </p>
    </AuthLayout>
  );
}
