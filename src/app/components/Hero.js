"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StreamFlixLogo from "./StreamFlixLogo";

export default function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGetStarted = async () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.exists) {
        // Email exists, redirect to signin with email param
        router.push(`/signin?email=${encodeURIComponent(email)}`);
      } else {
        // Email doesn't exist, redirect to signup with email param
        router.push(`/signup?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      setEmailError("Something went wrong. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGetStarted();
    }
  };

  const signin = () => {
    router.push("/signin");
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* 🔹 Background Image */}
      <div className="absolute inset-0 brightness-[0.65]">
        <Image
          src="/Assets/Images/bg.png" // <-- your background image
          alt="StreamFlix Background"
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 🔹 Top Blur Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-[3px] z-20"></div>

      {/* 🔹 Navbar */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 z-30">
        <StreamFlixLogo className="h-[6rem] w-auto" />
        <div className="flex items-center gap-4">
          <select className="bg-black/60 border border-gray-500 px-3 py-1 rounded text-white text-sm">
            <option>English</option>
            <option>हिन्दी</option>
          </select>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold text-sm transition" onClick={signin}>
            Sign In
          </button>
        </div>
      </header>

      {/* 🔹 Hero Content */}
      <div className="relative z-20 px-4 mt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold  leading-tight">
          Unlimited movies, <br /> shows, and more
        </h1>
        <p className="mt-4 font-bold text-lg md:text-xl">
          Starts at ₹149. Cancel at any time.
        </p>
        <p className="mt-3 text-sm md:text-base font-semibold text-gray-300">
          Ready to watch? Enter your email to create or restart your membership.
        </p>

        {/* 🔹 Email Input + Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="relative w-80">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Email address"
              className={`px-4 py-3 w-full rounded bg-black/70 border focus:outline-none focus:ring-2 text-white placeholder-gray-400 transition ${
                emailError
                  ? "border-red-500 focus:ring-red-600"
                  : "border-gray-500 focus:ring-red-600"
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2 absolute left-0">
                {emailError}
              </p>
            )}
          </div>
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold px-8 py-3 rounded text-lg transition"
          >
            {loading ? "Loading..." : "Get Started →"}
          </button>
        </div>
      </div>

      {/* 🔹 Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />

      {/* <div className="relative w-full h-screen z-20 overflow-hidden bg-black">
  {/* CURVE */}
  {/* <div
    className="absolute left-1/2 -translate-x-1/2 
               w-[200%] h-[350px] 
               bg-black rounded-b-[60%]
               -top-[180px]"
  ></div> */}

  {/* RED GLOW LINE */}
  {/* <div className="absolute top-0 w-full h-[4px] 
                  bg-red-600 shadow-[0_0_25px_10px_rgba(255,0,0,0.6)]"></div>
</div> */}

    </section>
  );
}
