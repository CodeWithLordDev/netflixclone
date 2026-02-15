"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import Script from "next/script";

const PREMIUM_AMOUNT_PAISE = 1000;

export default function Membership() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      alert("Please select a membership plan");
      return;
    }

    setLoading(true);

    try {
      if (selectedPlan === "free") {
        const res = await fetch("/api/membership/select", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "free" }),
        });

        const data = await res.json();

        if (res.ok) {
          router.push("/browse");
          return;
        }

        alert(data.message || "Failed to update membership");
        setLoading(false);
        return;
      }

      if (selectedPlan === "premium") {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: PREMIUM_AMOUNT_PAISE }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to create order. Please try again.");
          setLoading(false);
          return;
        }

        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: "INR",
          name: "Netflix Clone",
          description: "Premium Membership",
          order_id: data.order_id,
          handler: async function (response) {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: PREMIUM_AMOUNT_PAISE,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json();
              alert(verifyData.message || "Payment verification failed.");
              setLoading(false);
              return;
            }

            router.push("/browse");
          },
          prefill: {
            email: data.email || "",
          },
          theme: {
            color: "#E50914",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

        razorpay.on("payment.failed", function () {
          alert("Payment failed. Please try again.");
          setLoading(false);
        });
      }
    } catch (err) {
      console.error("Membership error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fff_42%,#fff5f5_100%)]">
        <div className="border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="px-8 py-5">
            <svg viewBox="0 0 111 30" className="h-10 fill-red-600">
              <path d="M105.06233,14.2806261 L110.999156,30 L112.324,30 L106.38,14.2806261 L105.06233,14.2806261 Z M90.4686475,14.2806261 L94.9314164,24.5 L99.394,14.2806261 L97.9506076,14.2806261 L94.9314164,21.389 L91.912,14.2806261 L90.4686475,14.2806261 Z M82.5,14 L82.5,28 L84,28 L84,14 L82.5,14 Z M71.5,14 L71.5,28 L73,28 L73,14 L71.5,14 Z M49,14 L49,28 L50.5,28 L50.5,14 L49,14 Z M18,14 L18,28 L19.5,28 L19.5,14 L18,14 Z M105.5,25 L105.5,14 L107,14 L107,25 L105.5,25 Z M56.5,14 L56.5,28 L58,28 L58,14 L56.5,14 Z"></path>
            </svg>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-gray-500">
              Step 2 of 2
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Choose the plan that&apos;s right for you
            </h1>
            <div className="mx-auto flex max-w-md flex-col gap-2 text-left">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                <span className="text-gray-700">Watch all you want. Ad-free.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                <span className="text-gray-700">Recommendations just for you.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                <span className="text-gray-700">Change or cancel your plan anytime.</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedPlan("free")}
              className={`group relative overflow-hidden rounded-2xl border p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                selectedPlan === "free"
                  ? "border-red-500 bg-gradient-to-b from-red-50 to-white shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.1),transparent_55%)] opacity-40" />
              {selectedPlan === "free" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-sm font-semibold text-white shadow">
                  Selected
                </span>
              )}

              <div className="relative text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Free</h2>
                <div className="mb-1 text-4xl font-bold text-gray-900">&#8377;0</div>
                <div className="mb-6 text-gray-500">per month</div>

                <div className="mb-6 space-y-3 text-left">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Limited content library</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Watch on 1 device at a time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">SD quality (480p)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Ads included</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    Perfect to start
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan("premium")}
              className={`group relative overflow-hidden rounded-2xl border p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                selectedPlan === "premium"
                  ? "border-red-500 bg-gradient-to-b from-red-50 via-white to-amber-50 shadow-xl"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.25),transparent_55%)] opacity-60" />
              <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1 text-sm font-semibold text-white shadow">
                Most Popular
              </span>

              {selectedPlan === "premium" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-sm font-semibold text-white shadow">
                  Selected
                </span>
              )}

              <div className="relative text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Premium</h2>
                <div className="mb-1 text-4xl font-bold text-gray-900">&#8377;10</div>
                <div className="mb-6 text-gray-500">per month</div>

                <div className="mb-6 space-y-3 text-left">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Full content library</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Watch on 4 devices at a time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Ultra HD quality (4K + HDR)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Ad-free experience</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Download to watch offline</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    Best value
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={handleSelectPlan}
              disabled={loading || !selectedPlan}
              className="rounded-md bg-red-600 px-12 py-4 text-xl font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Continue"}
            </button>
            <div className="mt-4 text-sm text-gray-500">
              {selectedPlan === "premium"
                ? "You'll be redirected to payment gateway"
                : "You can cancel or change your plan anytime."}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 bg-white/70">
          <div className="mx-auto max-w-6xl px-8 py-8 text-sm text-gray-500">
            <div className="mb-6">Questions? Call 000-800-919-1694</div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
    </>
  );
}
