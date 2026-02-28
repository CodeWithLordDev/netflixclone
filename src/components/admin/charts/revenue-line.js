"use client";

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";

export default function RevenueLine({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid var(--dash-border)",
            background: "var(--dash-panel)",
          }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
        />
        <Line dataKey="revenue" type="monotone" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
