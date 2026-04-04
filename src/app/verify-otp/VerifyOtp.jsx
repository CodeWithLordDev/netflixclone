"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/verify-otp", { email, otp });
      push("OTP verified successfully", "success");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to verify OTP");
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
        <h1 className="text-3xl font-bold">Verify OTP</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the 6-digit OTP sent to {email || "your email"}.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          placeholder="6-digit OTP"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 tracking-[0.4em] outline-none transition focus:border-red-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}
