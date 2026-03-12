"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function daysLeft(expiryDate) {
  if (!expiryDate) return 0;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [active, setActive] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [pendingPlan, setPendingPlan] = useState("");

  useEffect(() => {
    (async () => {
      const [planRes, subRes] = await Promise.all([
        fetch("/api/plans", { cache: "no-store" }),
        fetch("/api/subscription", { cache: "no-store" }),
      ]);

      if (planRes.ok) setPlans(await planRes.json());
      if (subRes.ok) setActive(await subRes.json());
    })();
  }, []);

  const visiblePlans = useMemo(
    () => plans.filter((p) => p.billingCycle === billing || !p.billingCycle),
    [plans, billing]
  );

  async function changePlan(planId) {
    setPendingPlan(planId);

    const selected = plans.find((p) => String(p._id) === String(planId));
    if (!selected) {
      setPendingPlan("");
      return;
    }

    if (Number(selected.price || 0) <= 0) {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (res.ok) {
        router.push("/browse");
        return;
      }

      setPendingPlan("");
      return;
    }

    router.push(`/payment?planId=${encodeURIComponent(planId)}`);
    setPendingPlan("");
  }

  const activePlanId = active?.planId?._id || active?.planId;
  const activeQuality = active?.planId?.videoQuality || "SD";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0f] px-4 py-12 text-zinc-100 md:px-10">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a2e,#0b0b0f_60%)]" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-glow" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Choose Your Plan</h1>
          <p className="mx-auto max-w-2xl text-sm text-zinc-400 md:text-base">
            Minimal, cinematic plan selector with instant upgrade or downgrade. All changes apply immediately.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="segmented">
            <button
              onClick={() => setBilling("monthly")}
              className={`segmented-btn ${billing === "monthly" ? "segmented-active" : ""}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`segmented-btn ${billing === "yearly" ? "segmented-active" : ""}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {active && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-zinc-900/60 p-4 backdrop-blur">
            <p className="text-sm text-zinc-400">Active Plan</p>
            <p className="text-lg font-semibold">{active?.planId?.name || "Current Plan"}</p>
            <p className="text-sm text-zinc-300">Expires in {daysLeft(active.expiryDate)} days</p>
            <p className="mt-1 text-xs text-zinc-400">Quality access: {activeQuality}. HD and above is disabled for basic plans.</p>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan) => {
            const isActive = String(activePlanId) === String(plan._id);
            const isRecommended = !!plan.isRecommended;
            const priceLabel = Number(plan.price || 0) <= 0 ? "Free" : `₹${Number(plan.price || 0).toLocaleString("en-IN")}`;
            const actionLabel = isActive
              ? "Active"
              : pendingPlan === plan._id
              ? "Updating..."
              : Number(plan.price || 0) <= 0
              ? "Use Free Plan"
              : "Proceed to Payment";

            return (
              <article
                key={plan._id}
                className={`plan-card ${isRecommended ? "plan-reco" : ""} ${isActive ? "plan-active" : ""}`}
              >
                <div className="plan-card-inner">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Plan</p>
                      <h3 className="mt-2 text-2xl font-semibold">{plan.name}</h3>
                    </div>
                    {isRecommended ? (
                      <span className="badge-reco">Recommended</span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-bold">{priceLabel}</span>
                    <span className="text-xs text-white/50">per {billing}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/70">
                    <div className="stat">
                      <span className="stat-label">Quality</span>
                      <span className="stat-value">{plan.videoQuality}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Devices</span>
                      <span className="stat-value">{plan.maxDevices}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ads</span>
                      <span className="stat-value">{plan.hasAds ? "Yes" : "No"}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Duration</span>
                      <span className="stat-value">{plan.duration} days</span>
                    </div>
                  </div>

                  <button
                    disabled={isActive || pendingPlan === plan._id}
                    onClick={() => changePlan(plan._id)}
                    className={`btn-plan ${isActive ? "btn-active" : "btn-cta"}`}
                  >
                    {actionLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
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
        .segmented {
          display: inline-flex;
          gap: 6px;
          padding: 6px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
        }
        .segmented-btn {
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          transition: all 200ms ease;
        }
        .segmented-btn:hover {
          color: white;
        }
        .segmented-active {
          background: linear-gradient(135deg, #e50914, #ff3a2e);
          color: white;
          box-shadow: 0 10px 25px rgba(229,9,20,0.35);
        }
        .plan-card {
          perspective: 1200px;
        }
        .plan-card-inner {
          border-radius: 20px;
          padding: 22px;
          background: rgba(10, 10, 16, 0.65);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          transition: transform 350ms ease, box-shadow 350ms ease, border-color 350ms ease;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .plan-card:hover .plan-card-inner {
          transform: rotateX(4deg) rotateY(-6deg) translateY(-3px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.18);
        }
        .plan-reco .plan-card-inner {
          background: linear-gradient(160deg, rgba(229,9,20,0.18), rgba(10,10,16,0.75));
          border-color: rgba(229,9,20,0.35);
        }
        .plan-active .plan-card-inner {
          box-shadow: 0 30px 70px rgba(16,185,129,0.25);
          border-color: rgba(16,185,129,0.4);
        }
        .badge-reco {
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(229,9,20,0.9);
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .stat-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }
        .btn-plan {
          margin-top: auto;
          width: 100%;
          border-radius: 14px;
          padding: 12px 16px;
          font-weight: 700;
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
        }
        .btn-cta {
          background: linear-gradient(135deg, #e50914, #ff3a2e);
          box-shadow: 0 12px 30px rgba(229,9,20,0.35);
        }
        .btn-cta:hover {
          transform: translateY(-1px);
        }
        .btn-active {
          background: rgba(16,185,129,0.7);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}
