import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, Phone, KeyRound, ArrowRight } from "lucide-react";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [method, setMethod] = useState("password"); // password | otp
  const [form, setForm] = useState({ emailOrPhone: "", password: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (method === "otp") {
        if (!otpSent) {
          // Mock OTP send
          if (!form.emailOrPhone) throw new Error("Please enter your phone number");
          
          // Show mock OTP in alert popup
          alert(`Your Mock OTP is: 123456\n\n(This is shown because Firebase billing is disabled)`);
          
          setOtpSent(true);
          setSubmitting(false);
          return;
        } else {
          // Validate mock OTP
          if (form.otp !== "123456") {
            throw new Error("Invalid OTP. Please enter 123456.");
          }
        }
      }
      
      let formattedEmailOrPhone = form.emailOrPhone;
      // If it looks like a 10-digit Indian phone number without country code, add +91
      if (/^\d{10}$/.test(formattedEmailOrPhone)) {
        formattedEmailOrPhone = `+91${formattedEmailOrPhone}`;
      }
      
      // Perform normal login (mocking OTP verification using the same login utility or alert)
      const data = await login({ 
        emailOrPhone: formattedEmailOrPhone, 
        password: method === "otp" ? "mock_otp_pass_123" : form.password 
      });
      
      const defaultPath = data.user?.role === "Admin" ? "/admin/dashboard" : "/dashboard";
      navigate(location.state?.from?.pathname || defaultPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Authentication failed. Please verify details.");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Namaste, Welcome Back" subtitle="Secure access to your smart farmer account.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error ? <Alert type="error">{error}</Alert> : null}

        {/* Method Toggle Selector */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-2">
          <button
            type="button"
            onClick={() => { setMethod("password"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              method === "password"
                ? "bg-white dark:bg-slate-900 text-leaf shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Lock size={13} /> Password
          </button>
          <button
            type="button"
            onClick={() => { setMethod("otp"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
              method === "otp"
                ? "bg-white dark:bg-slate-900 text-leaf shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Phone size={13} /> Mobile OTP
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {method === "otp" ? "Phone Number" : "Email or Phone"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {method === "otp" ? <Phone size={16} /> : <Mail size={16} />}
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-3 pl-11 pr-4 text-sm outline-none focus:border-leaf dark:focus:border-leaf transition-colors dark:text-white"
                value={form.emailOrPhone}
                onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                placeholder={method === "otp" ? "+91 98765 43210" : "farmer@example.com"}
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {method === "password" ? (
              <motion.div
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-3 pl-11 pr-4 text-sm outline-none focus:border-leaf dark:focus:border-leaf transition-colors dark:text-white"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
              </motion.div>
            ) : (
              otpSent && (
                <motion.div
                  key="otp-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <KeyRound size={16} />
                    </span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-3 pl-11 pr-4 text-sm outline-none focus:border-leaf dark:focus:border-leaf transition-colors dark:text-white"
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value })}
                      placeholder="XXXXXX"
                      maxLength={6}
                      required
                    />
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        <button 
          className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-2xl bg-leaf hover:bg-leaf-600 px-4 py-3.5 font-bold text-white shadow-premium disabled:opacity-60 transition-colors"
          disabled={submitting}
        >
          {submitting ? (
            "Authenticating..."
          ) : method === "otp" && !otpSent ? (
            <>Send Verification Code <ArrowRight size={16} /></>
          ) : (
            "Login to Dashboard"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">or sign in with</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeWidth="0" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.97 1.1.09 2.24-.57 3-1.41z" />
            </svg>
            Apple
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-xs font-bold uppercase tracking-wider">
        <Link className="text-leaf hover:underline" to="/forgot-password">
          Forgot Password?
        </Link>
        <Link className="text-leaf hover:underline" to="/register">
          Create Farmer Account
        </Link>
      </div>
    </AuthLayout>
  );
}
