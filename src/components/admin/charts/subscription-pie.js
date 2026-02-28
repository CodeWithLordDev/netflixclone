"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#38bdf8", "#22c55e", "#f59e0b", "#f97316", "#a3a3a3"];

export default function SubscriptionPie({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid var(--dash-border)",
            background: "var(--dash-panel)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
