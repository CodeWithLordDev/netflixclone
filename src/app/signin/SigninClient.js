"use client";
export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getOrCreateDeviceId } from "@/lib/deviceId";

export default function SigninClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleSignin = async () => {
    setError("");
    setPasswordError("");

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
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceId }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/browse");
      } else if (res.status === 404) {
        router.push("/signup");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignin();
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93d6-bae2fe60a69b/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="px-8 py-5">
          <svg viewBox="0 0 111 30" className="h-10 fill-red-600">
            <path d="M105.06233,14.2806261 L110.999156,30 L112.324,30 L106.38,14.2806261 L105.06233,14.2806261 Z M90.4686475,14.2806261 L94.9314164,24.5 L99.394,14.2806261 L97.9506076,14.2806261 L94.9314164,21.389 L91.912,14.2806261 L90.4686475,14.2806261 Z M82.5,14 L82.5,28 L84,28 L84,14 L82.5,14 Z M71.5,14 L71.5,28 L73,28 L73,14 L71.5,14 Z M49,14 L49,28 L50.5,28 L50.5,14 L49,14 Z M18,14 L18,28 L19.5,28 L19.5,14 L18,14 Z M105.5,25 L105.5,14 L107,14 L107,25 L105.5,25 Z M56.5,14 L56.5,28 L58,28 L58,14 L56.5,14 Z"></path>
          </svg>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 -mt-20">
        <div className="w-full max-w-md bg-black bg-opacity-75 rounded px-16 py-14">
          <h1 className="text-white text-3xl font-bold mb-7">Sign In</h1>

          {error && (
            <div className="bg-orange-500 text-white px-4 py-3 mb-4 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Email or phone number"
              className="w-full px-5 py-4 bg-zinc-700 text-white rounded border border-zinc-600 focus:outline-none focus:border-white placeholder-zinc-400"
            />

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Password (min 8 chars + special char)"
                className={`w-full px-5 py-4 bg-zinc-700 text-white rounded border focus:outline-none focus:border-white placeholder-zinc-400 transition ${
                  passwordError ? "border-red-500" : "border-zinc-600"
                }`}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
              {password && !passwordError && (
                <p className="text-green-500 text-sm mt-2">✓ Password is valid</p>
              )}
            </div>

            <button
              onClick={handleSignin}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <label className="flex items-center text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              Remember me
            </label>
            <a href="#" className="text-zinc-400 hover:underline">
              Need help?
            </a>
          </div>

          <div className="mt-16 text-zinc-400 text-base">
            New to Netflix?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-white hover:underline cursor-pointer font-medium"
            >
              Sign up now
            </span>
            .
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Learn more
            </a>
            .
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
    </div>
  );
}
