"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";

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
        // ✅ FIXED: Store the response in a variable
        const res = await fetch("/api/membership/select", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "free" }),
        });

        const data = await res.json();
        
        if (res.ok) {
          router.push("/browse");
        } else {
          alert(data.message || "Failed to update membership");
          setLoading(false);
        }
      } else if (selectedPlan === "premium") {
        // Premium plan - initiate Razorpay payment
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 1000 }), // ₹10 in paise
        });
        const data = await res.json();

        if (!res.ok) {
          alert("Failed to create order. Please try again.");
          setLoading(false);
          return;
        }

        // Razorpay options
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: "INR",
          name: "Netflix Clone",
          description: "Premium Membership",
          order_id: data.order_id,
          handler: async function (response) {
            await fetch("/api/payment/verify-payment", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: 1000, // ✅ FIXED: Use actual amount instead of undefined variable
              }),
            });

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

        razorpay.on("payment.failed", function (response) {
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
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="px-8 py-5">
            <svg viewBox="0 0 111 30" className="h-10 fill-red-600">
              <path d="M105.06233,14.2806261 L110.999156,30 L112.324,30 L106.38,14.2806261 L105.06233,14.2806261 Z M90.4686475,14.2806261 L94.9314164,24.5 L99.394,14.2806261 L97.9506076,14.2806261 L94.9314164,21.389 L91.912,14.2806261 L90.4686475,14.2806261 Z M82.5,14 L82.5,28 L84,28 L84,14 L82.5,14 Z M71.5,14 L71.5,28 L73,28 L73,14 L71.5,14 Z M49,14 L49,28 L50.5,28 L50.5,14 L49,14 Z M18,14 L18,28 L19.5,28 L19.5,14 L18,14 Z M105.5,25 L105.5,14 L107,14 L107,25 L105.5,25 Z M56.5,14 L56.5,28 L58,28 L58,14 L56.5,14 Z"></path>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Step Indicator */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              Step 2 of 2
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose the plan that&apos;s right for you
            </h1>
            <div className="flex flex-col gap-2 max-w-md mx-auto text-left">
              <div className="flex items-start gap-2">
                <Check className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Watch all you want. Ad-free.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Recommendations just for you.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Change or cancel your plan anytime.
                </span>
              </div>
            </div>
          </div>

          {/* Membership Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            {/* Free Plan */}
            <div
              onClick={() => setSelectedPlan("free")}
              className={`relative border-2 rounded-lg p-8 cursor-pointer transition-all ${
                selectedPlan === "free"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {selectedPlan === "free" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Selected
                </div>
              )}

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
                <div className="text-4xl font-bold text-gray-900 mb-1">₹0</div>
                <div className="text-gray-500 mb-6">per month</div>

                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      Limited content library
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      Watch on 1 device at a time
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">SD quality (480p)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ads included</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Perfect to start
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div
              onClick={() => setSelectedPlan("premium")}
              className={`relative border-2 rounded-lg p-8 cursor-pointer transition-all ${
                selectedPlan === "premium"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>

              {selectedPlan === "premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Selected
                </div>
              )}

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Premium
                </h2>
                <div className="text-4xl font-bold text-gray-900 mb-1">₹10</div>
                <div className="text-gray-500 mb-6">per month</div>

                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Full content library</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      Watch on 4 devices at a time
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      Ultra HD quality (4K+HDR)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ad-free experience</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      Download to watch offline
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Best value
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSelectPlan}
              disabled={loading || !selectedPlan}
              className="bg-red-600 text-white px-12 py-4 rounded text-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Processing..." : "Continue"}
            </button>
            <div className="text-sm text-gray-500 mt-4">
              {selectedPlan === "premium"
                ? "You'll be redirected to payment gateway"
                : "You can cancel or change your plan anytime."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-8 py-8 text-gray-500 text-sm">
            <div className="mb-6">Questions? Call 000-800-919-1694</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <a href="#" className="hover:underline">
                FAQ
              </a>
              <a href="#" className="hover:underline">
                Help Centre
              </a>
              <a href="#" className="hover:underline">
                Terms of Use
              </a>
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:underline">
                Cookie Preferences
              </a>
              <a href="#" className="hover:underline">
                Corporate Information
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}