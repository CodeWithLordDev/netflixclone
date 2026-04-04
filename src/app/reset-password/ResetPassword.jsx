"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/reset-password", { email, otp, password });
      push("Password updated successfully", "success");
      router.push("/signin");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="mt-2 text-sm text-white/60">
          Create a new password for {email || "your account"}.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-red-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
