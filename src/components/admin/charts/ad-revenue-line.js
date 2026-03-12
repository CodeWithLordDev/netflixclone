"use client";

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";

const MOCK_AD_REVENUE = [
  { day: "Mon", revenue: 0 },
  { day: "Tue", revenue: 0 },
  { day: "Wed", revenue: 0 },
  { day: "Thu", revenue: 0 },
  { day: "Fri", revenue: 0 },
  { day: "Sat", revenue: 0 },
  { day: "Sun", revenue: 0 },
];

export default function AdRevenueLine({ data = [] }) {
  const chartData = data.length ? data : MOCK_AD_REVENUE;
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" vertical={false} />
        <XAxis dataKey="day" stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
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
