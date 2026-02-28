import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MetricCard({ label, value }) {
  return (
    <Card className="rounded-2xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-28px_rgba(2,6,23,.85)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-[var(--dash-text)]">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function MetricsGrid({ cards }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Total Users" value={Number(cards?.totalUsers || 0).toLocaleString()} />
      <MetricCard label="Active Users" value={Number(cards?.activeUsers || 0).toLocaleString()} />
      <MetricCard label="Banned Users" value={Number(cards?.bannedUsers || 0).toLocaleString()} />
      <MetricCard label="Total Revenue" value={`$${Number(cards?.totalRevenue || 0).toLocaleString()}`} />
      <MetricCard label="Active Subscriptions" value={Number(cards?.activeSubscriptions || 0).toLocaleString()} />
    </section>
  );
}
