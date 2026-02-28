"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import MetricsGrid from "@/components/admin/metrics-grid";
import SectionCard from "@/components/admin/common/section-card";
import PageSkeleton from "@/components/admin/common/page-skeleton";
import RevenueLine from "@/components/admin/charts/revenue-line";
import UserGrowthBar from "@/components/admin/charts/user-growth-bar";
import SubscriptionPie from "@/components/admin/charts/subscription-pie";

export default function DashboardOverviewClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        setData(json?.error ? null : json);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageSkeleton cards={5} />;
  if (!data) return <p className="text-sm text-[var(--dash-muted)]">Failed to load dashboard data.</p>;

  return (
    <div className="space-y-5">
      <MetricsGrid cards={data.cards} />

      <section className="grid gap-4 lg:grid-cols-2">
        {data.capabilities?.canViewRevenue ? (
          <SectionCard title="Monthly Revenue" description="Last 6 months">
            <RevenueLine data={data.charts?.monthlyRevenue || []} />
          </SectionCard>
        ) : (
          <SectionCard title="Monthly Revenue" description="Restricted by role">
            <p className="text-sm text-[var(--dash-muted)]">Revenue metrics are visible to admin and superadmin roles only.</p>
          </SectionCard>
        )}
        <SectionCard title="User Growth" description="Last 6 months">
          <UserGrowthBar data={data.charts?.userGrowth || []} />
        </SectionCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Subscription Distribution">
          <SubscriptionPie data={data.charts?.subscriptionDistribution || []} />
        </SectionCard>

        <SectionCard title="Currently Active Users">
          <div className="space-y-2">
            {(data.activeUsersList || []).length ? (
              (data.activeUsersList || []).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] bg-black/10 px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-[var(--dash-text)]">{user.name}</p>
                    <p className="text-xs text-[var(--dash-muted)]">{user.email}</p>
                  </div>
                  <Badge>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "No login yet"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--dash-muted)]">No active users found.</p>
            )}
          </div>
        </SectionCard>
      </section>

      <section>
        <SectionCard title="Recent Activity">
          <div className="space-y-2">
            {(data.recentActivity || []).map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] bg-black/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-[var(--dash-text)]">{row.type}</p>
                  <p className="text-xs text-[var(--dash-muted)]">{row.actor} • {row.target}</p>
                </div>
                <Badge>{new Date(row.createdAt).toLocaleDateString()}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}

