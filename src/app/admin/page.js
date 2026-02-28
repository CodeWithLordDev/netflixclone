import DashboardOverviewClient from "@/components/admin/dashboard-overview-client";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--dash-text)]">Overview</h1>
        <p className="text-sm text-[var(--dash-muted)]">System snapshot by role permissions</p>
      </div>
      <DashboardOverviewClient />
    </div>
  );
}
