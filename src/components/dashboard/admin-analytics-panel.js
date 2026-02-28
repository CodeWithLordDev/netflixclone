"use client";

import { useEffect, useState } from "react";
import { RevenueLineChart, SubscriptionPieChart, UserGrowthBarChart } from "@/components/admin/charts";

function fallbackMonths() {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => ({ month: m, revenue: 0, users: 0 }));
}

export default function AdminAnalyticsPanel() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.ok) setDashboard(await res.json());
    })();
  }, []);

  const monthlyRevenue = dashboard?.monthlyRevenue?.length
    ? dashboard.monthlyRevenue
    : fallbackMonths().map((m) => ({ month: m.month, revenue: 0 }));

  const userGrowth = dashboard?.userGrowth?.length
    ? dashboard.userGrowth
    : fallbackMonths().map((m) => ({ month: m.month, users: 0 }));

  const subscriptionDist = dashboard?.subscriptionDist?.length
    ? dashboard.subscriptionDist
    : [
        { plan: "BASIC", value: 0 },
        { plan: "STANDARD", value: 0 },
        { plan: "PREMIUM", value: 0 }
      ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><p className="text-xs text-zinc-400">Total Users</p><p className="mt-1 text-2xl font-semibold">{dashboard?.metrics?.totalUsers ?? 0}</p></div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><p className="text-xs text-zinc-400">Total Movies</p><p className="mt-1 text-2xl font-semibold">{dashboard?.metrics?.totalMovies ?? 0}</p></div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><p className="text-xs text-zinc-400">Total Series</p><p className="mt-1 text-2xl font-semibold">{dashboard?.metrics?.totalSeries ?? 0}</p></div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><p className="text-xs text-zinc-400">Revenue</p><p className="mt-1 text-2xl font-semibold">${dashboard?.metrics?.totalRevenue ?? 0}</p></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><RevenueLineChart data={monthlyRevenue} /></div>
        <SubscriptionPieChart data={subscriptionDist} />
      </div>

      <UserGrowthBarChart data={userGrowth} />
    </div>
  );
}
