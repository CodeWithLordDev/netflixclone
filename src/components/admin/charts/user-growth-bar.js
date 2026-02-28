"use client";

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";

export default function UserGrowthBar({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--dash-muted)" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid var(--dash-border)",
            background: "var(--dash-panel)",
          }}
        />
        <Bar dataKey="users" radius={[10, 10, 0, 0]} fill="#60a5fa" />
      </BarChart>
    </ResponsiveContainer>
  );
}
