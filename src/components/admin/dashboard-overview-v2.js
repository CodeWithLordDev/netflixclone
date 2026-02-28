"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { AlertCircle, TrendingUp, Users, CreditCard, Activity } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, trend, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    pink: "text-pink-400",
  };

  return (
    <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400">{label}</CardTitle>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewClient({ userRole = "admin" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/signin");
            return;
          }
          throw new Error("Failed to fetch analytics");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Analytics error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { metrics, charts, advancedMetrics } = data || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={metrics?.users?.total?.toLocaleString() || "0"}
          trend="+12% from last month"
          color="blue"
        />
        <MetricCard
          icon={Activity}
          label="Active Users"
          value={metrics?.users?.active?.toLocaleString() || "0"}
          trend="Online today"
          color="green"
        />
        <MetricCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={metrics?.subscriptions?.active?.toLocaleString() || "0"}
          trend={Math.round((metrics?.subscriptions?.active / metrics?.subscriptions?.total) * 100) + "%"}
          color="purple"
        />
        <MetricCard
          icon={AlertCircle}
          label="Open Reports"
          value={metrics?.reports?.open || "0"}
          color="pink"
        />
      </div>

      {/* Advanced Metrics for Admin+ */}
      {advancedMetrics && (
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            icon={TrendingUp}
            label="Total Revenue"
            value={`$${advancedMetrics.revenue?.total?.toLocaleString() || "0"}`}
            trend={`$${Math.round(advancedMetrics.revenue?.avgMonthly || 0)}/mo average`}
            color="green"
          />
          <MetricCard
            icon={Activity}
            label="Churn Rate"
            value={`${advancedMetrics.churnRate || "0"}%`}
            color="pink"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.userGrowth && charts.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.userGrowth}>
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-center py-12">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart (Admin+) */}
        {charts?.revenueData && (
          <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {charts.revenueData && charts.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={charts.revenueData}>
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="rgba(16,185,129,0.1)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-center py-12">No revenue data available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plan Distribution (Admin+) */}
      {advancedMetrics?.planDistribution && (
        <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {advancedMetrics.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={advancedMetrics.planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ plan, value }) => `${plan}: ${value}`}
                    outerRadius={100}
                    fill="#3b82f6"
                    dataKey="value"
                  >
                    {advancedMetrics.planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-center py-12">No plan data available</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="text-slate-200 font-medium">{activity.name}</p>
                    <p className="text-xs text-slate-400">{activity.action}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(activity.time).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-6">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
