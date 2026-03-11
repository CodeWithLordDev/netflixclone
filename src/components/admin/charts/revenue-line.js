"use client";

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";

const MOCK_REVENUE = [
  { month: "Oct", revenue: 1200 },
  { month: "Nov", revenue: 1800 },
  { month: "Dec", revenue: 2400 },
  { month: "Jan", revenue: 2100 },
  { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 4100 },
];

export default function RevenueLine({ data = [] }) {
  const chartData = data.length ? data : MOCK_REVENUE;
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--dash-muted)" tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid var(--dash-border)",
            background: "var(--dash-panel)",
          }}
          formatter={(value) => [formatCurrency(value), "Revenue"]}
        />
        <Line
          dataKey="revenue"
          type="monotone"
          stroke="#38bdf8"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
