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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a1a1d,#09090b_45%)] px-4 py-10 text-zinc-100 md:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-zinc-400">Netflix-style subscription control with instant upgrade or downgrade.</p>

        <div className="mt-6 inline-flex rounded-full border border-zinc-700 bg-zinc-900 p-1">
          <button onClick={() => setBilling("monthly")} className={`rounded-full px-4 py-2 text-sm ${billing === "monthly" ? "bg-red-600" : "text-zinc-300"}`}>Monthly</button>
          <button onClick={() => setBilling("yearly")} className={`rounded-full px-4 py-2 text-sm ${billing === "yearly" ? "bg-red-600" : "text-zinc-300"}`}>Yearly</button>
        </div>

        {active && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-zinc-900/70 p-4">
            <p className="text-sm text-zinc-400">Active Plan</p>
            <p className="text-lg font-semibold">{active?.planId?.name || "Current Plan"}</p>
            <p className="text-sm text-zinc-300">Expires in {daysLeft(active.expiryDate)} days</p>
            <p className="mt-1 text-xs text-zinc-400">Quality access: {activeQuality}. HD and above is disabled for basic plans.</p>
          </div>
        )}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Devices</th>
                <th className="px-4 py-3">Ads</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlans.map((plan) => {
                const isActive = String(activePlanId) === String(plan._id);
                const isRecommended = !!plan.isRecommended;

                return (
                  <tr key={plan._id} className={isRecommended ? "bg-red-950/20" : ""}>
                    <td className="px-4 py-4">
                      <div className="font-medium">{plan.name}</div>
                      {isRecommended && <span className="mt-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs">Recommended</span>}
                    </td>
                    <td className="px-4 py-4">Rs. {Number(plan.price || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4">{plan.videoQuality}</td>
                    <td className="px-4 py-4">{plan.maxDevices}</td>
                    <td className="px-4 py-4">{plan.hasAds ? "Yes" : "No"}</td>
                    <td className="px-4 py-4">{plan.duration} days</td>
                    <td className="px-4 py-4">
                      <button
                        disabled={isActive || pendingPlan === plan._id}
                        onClick={() => changePlan(plan._id)}
                        className={`rounded-md px-3 py-2 text-xs font-semibold ${isActive ? "bg-emerald-700" : "bg-red-600 hover:bg-red-500"} disabled:opacity-60`}
                      >
                        {isActive ? "Active" : pendingPlan === plan._id ? "Updating..." : Number(plan.price || 0) <= 0 ? "Use Free Plan" : "Proceed to Payment"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
