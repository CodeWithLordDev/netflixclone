"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || "";

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await fetch("/api/plans", { cache: "no-store" });
        const plans = await res.json();
        if (!active) return;
        const selected = (Array.isArray(plans) ? plans : []).find((item) => String(item._id) === String(planId));
        if (!selected) {
          setError("Selected plan not found.");
          return;
        }
        setPlan(selected);
      } catch {
        if (active) setError("Failed to load selected plan.");
      }
    };
    if (planId) run();
    else setError("Plan id is missing.");
    return () => {
      active = false;
    };
  }, [planId]);

  const amountPaise = useMemo(() => {
    return Math.max(0, Math.round(Number(plan?.price || 0) * 100));
  }, [plan]);

  const amountRupeesLabel = useMemo(() => {
    return `Rs. ${Number(plan?.price || 0).toLocaleString("en-IN")}`;
  }, [plan]);

  const payNow = async () => {
    if (!plan || amountPaise <= 0) return;
    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment SDK not loaded. Refresh and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to create payment order");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "Netflix Clone",
        description: `${plan.name} subscription`,
        order_id: orderData.order_id,
        handler: async (response) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountPaise,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.message || "Payment verification failed");
            setLoading(false);
            return;
          }

          const subRes = await fetch("/api/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId: plan._id, transactionRef: response.razorpay_payment_id }),
          });

          if (!subRes.ok) {
            setError("Payment succeeded but subscription activation failed.");
            setLoading(false);
            return;
          }

          router.push("/browse");
        },
        theme: { color: "#E50914" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
    } catch (err) {
      setError(err.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a1a1d,#09090b_45%)] px-4 py-10 text-zinc-100 md:px-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h1 className="text-2xl font-semibold">Complete Payment</h1>
          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

          {plan ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Amount (INR)</span>
                <span className="text-lg font-semibold">{amountRupeesLabel}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <span className="text-sm text-zinc-400">Billing Cycle</span>
                <span>{plan.billingCycle || "monthly"}</span>
              </div>
              <button
                disabled={loading}
                onClick={payNow}
                className="mt-3 w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {loading ? "Processing..." : `Pay ${amountRupeesLabel}`}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">Loading selected plan...</p>
          )}
        </div>
      </div>
    </>
  );
}
