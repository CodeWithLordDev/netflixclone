"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import StreamFlixLogo from "../components/StreamFlixLogo";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  const validatePassword = (pwd) => {
    const isLengthValid = pwd.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    return isLengthValid && hasSpecialChar;
  };

  const getPasswordErrorMessage = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return "Password must contain at least one special character (!@#$%^&*...)";
    }
    return "";
  };

  const handleSignup = async () => {
    setError("");
    setNameError("");
    setPasswordError("");

    if (!firstName.trim() || !lastName.trim()) {
      setNameError("First name and last name are required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(getPasswordErrorMessage(password));
      return;
    }

    setLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, deviceId }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(data.redirectTo || "/subscription");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0f] text-white">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a2e,#0b0b0f_60%)]" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-glow" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <StreamFlixLogo className="h-[6rem] w-auto" />
        <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
          <span className="chip">Password Rules</span>
          <span className="chip">Secure Signup</span>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 -mt-20 perspective">
        <div className="card-3d w-full max-w-md">
          <div className="card-inner bg-black/50 backdrop-blur-xl rounded-2xl px-10 py-12 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Sign Up</h1>
              <span className="text-[11px] uppercase tracking-[0.3em] text-white/50">StreamFlix</span>
            </div>

            {error && (
              <div className="bg-orange-500 text-white px-4 py-3 mb-4 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="First name"
                    className="input"
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Last name"
                    className="input"
                  />
                </div>
              </div>
              {nameError && (
                <p className="text-red-500 text-sm -mt-1">{nameError}</p>
              )}

              <div className="field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Email"
                  className="input"
                />
                <span className="hint">We will verify this email.</span>
              </div>

              <div className="field">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Password (min 8 chars + special char)"
                    className={`input pr-24 ${
                      passwordError ? "border-red-500" : "border-white/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="toggle"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                )}
                {password && !passwordError && (
                  <p className="text-green-500 text-sm mt-2">✓ Password is valid</p>
                )}
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              By signing up, you agree to our{" "}
              <a href="#" className="hover:underline">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              .
            </div>

            <div className="mt-12 text-white/70 text-base">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/signin")}
                className="text-white hover:underline cursor-pointer font-medium"
              >
                Sign in now
              </span>
              .
            </div>

            <div className="mt-3 text-xs text-white/40">
              This page is protected by reCAPTCHA to ensure you&apos;re not a bot.{" "}
              <a href="#" className="text-blue-400 hover:underline">
                Learn more
              </a>
              .
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-black bg-opacity-75 mt-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 text-zinc-500 text-sm">
          <div className="mb-6">
            Questions? Call 000-800-919-1694
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <a href="#" className="hover:underline">FAQ</a>
            <a href="#" className="hover:underline">Help Centre</a>
            <a href="#" className="hover:underline">Terms of Use</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Cookie Preferences</a>
            <a href="#" className="hover:underline">Corporate Information</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }
        .card-3d:hover .card-inner {
          transform: rotateX(4deg) rotateY(-6deg) translateY(-2px);
        }
        .card-inner {
          transform: translateZ(0);
          transition: transform 500ms ease, box-shadow 500ms ease;
        }
        .orb {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.35;
          animation: float 10s ease-in-out infinite;
        }
        .orb-a {
          background: radial-gradient(circle, rgba(229,9,20,0.6), transparent 60%);
          top: -140px;
          left: -120px;
        }
        .orb-b {
          background: radial-gradient(circle, rgba(79,70,229,0.5), transparent 60%);
          bottom: -160px;
          right: -80px;
          animation-delay: 1.5s;
        }
        .orb-c {
          background: radial-gradient(circle, rgba(16,185,129,0.4), transparent 60%);
          top: 40%;
          left: 60%;
          animation-delay: 3s;
        }
        .grid-glow {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(transparent 95%, rgba(255,255,255,0.04) 96%),
            linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.04) 96%);
          background-size: 50px 50px;
          opacity: 0.25;
          transform: perspective(800px) rotateX(65deg) translateY(120px);
        }
        .input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(15, 15, 20, 0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          outline: none;
          color: white;
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .input:focus {
          border-color: rgba(229,9,20,0.7);
          box-shadow: 0 0 0 4px rgba(229,9,20,0.15);
        }
        .hint {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }
        .btn-primary {
          width: 100%;
          margin-top: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e50914, #ff3a2e);
          font-weight: 700;
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(229,9,20,0.35);
        }
        .toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }
        .chip {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}
