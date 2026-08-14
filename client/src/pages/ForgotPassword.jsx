import React from "react";
import { useState } from "react";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import AuthLayout from "../layouts/AuthLayout";
import { http } from "../api/http";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await http.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to request password reset.");
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="We will email a secure reset link if the account exists.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {message ? <Alert type="success">{message}</Alert> : null}
        {error ? <Alert type="error">{error}</Alert> : null}
        <FormInput label="Registered email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <button className="focus-ring rounded-md bg-leaf px-4 py-3 font-bold text-white shadow-sm">Send reset link</button>
      </form>
    </AuthLayout>
  );
}
