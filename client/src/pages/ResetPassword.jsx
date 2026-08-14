import React from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { http } from "../api/http";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setSession } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const { data } = await http.post("/auth/reset-password", {
        email: params.get("email"),
        token: params.get("token"),
        password
      });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    }
  }

  return (
    <AuthLayout title="Choose new password" subtitle="Create a new password with at least eight characters.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error ? <Alert type="error">{error}</Alert> : null}
        <FormInput label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="focus-ring rounded-md bg-leaf px-4 py-3 font-bold text-white shadow-sm">Update password</button>
      </form>
    </AuthLayout>
  );
}
