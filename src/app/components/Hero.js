"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
          alt="Netflix Background"
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
        <h1 className="text-3xl font-bold text-red-600">
          <svg
            viewBox="0 0 111 30"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width={120}
            height={32}
            fill="red"
          >
            <g>
              <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,0 L99.5313525,0 L102.593495,7.87421502 L105.874965,0 L110.999156,0 L105.06233,14.2806261 Z M90.4686475,0 L85.8749649,0 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,0 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,0 L73.9366389,0 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,0 L66.3436123,0 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,0 L50.2183897,0 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,0 L32.7809542,0 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,0 L4.4690224,0 L10.562377,17.0315868 L10.562377,0 L15.2497891,0 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z"></path>
            </g>
          </svg>
        </h1>
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
