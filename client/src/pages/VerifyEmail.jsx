import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { http } from "../api/http";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await verifyEmail({ email, otp });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    }
  }

  async function resendOtp() {
    setError("");
    setMessage("");
    try {
      await http.post("/auth/resend-otp", { email });
      setMessage("A fresh OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP.");
    }
  }

  return (
    <AuthLayout title="Verify email" subtitle="Enter the six digit OTP sent to your registered email.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error ? <Alert type="error">{error}</Alert> : null}
        {message ? <Alert type="success">{message}</Alert> : null}
        <FormInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <FormInput label="OTP" value={otp} onChange={(event) => setOtp(event.target.value)} maxLength={6} required />
        <button className="focus-ring rounded-md bg-leaf px-4 py-3 font-bold text-white shadow-sm">Verify account</button>
      </form>
      <button onClick={resendOtp} className="focus-ring mt-4 rounded-md border border-leaf px-4 py-2 font-semibold text-leaf">
        Resend OTP
      </button>
    </AuthLayout>
  );
}
