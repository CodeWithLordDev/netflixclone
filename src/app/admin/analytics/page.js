"use client";

import { useEffect, useState } from "react";
import SectionCard from "@/components/admin/common/section-card";
import UserGrowthBar from "@/components/admin/charts/user-growth-bar";
import RevenueLine from "@/components/admin/charts/revenue-line";
import SubscriptionPie from "@/components/admin/charts/subscription-pie";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      const json = await res.json();
      if (!active) return;
      setData(json?.error ? null : json);
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return <p className="text-sm text-[var(--dash-muted)]">Loading analytics...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--dash-text)]">Analytics</h1>
        <p className="text-sm text-[var(--dash-muted)]">Role-based operational and growth insights</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="User Growth">
          <UserGrowthBar data={data.charts?.userGrowth || []} />
        </SectionCard>
        <SectionCard title="Plan Distribution">
          <SubscriptionPie data={data.charts?.subscriptionDistribution || []} />
        </SectionCard>
      </section>

      {data.capabilities?.canViewRevenue ? (
        <SectionCard title="Revenue Trend">
          <RevenueLine data={data.charts?.monthlyRevenue || []} />
        </SectionCard>
      ) : (
        <SectionCard title="Revenue Trend">
          <p className="text-sm text-[var(--dash-muted)]">Revenue analytics are restricted for your role.</p>
        </SectionCard>
      )}
    </div>
  );
}

