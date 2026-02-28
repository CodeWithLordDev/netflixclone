"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ["#E50914", "#B20710", "#7A1016"];

export function RevenueLineChart({ data }) {
  return (
    <Card>
      <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}><CartesianGrid stroke="#27272a" /><XAxis dataKey="month" stroke="#a1a1aa" /><YAxis stroke="#a1a1aa" /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function UserGrowthBarChart({ data }) {
  return (
    <Card>
      <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}><CartesianGrid stroke="#27272a" /><XAxis dataKey="month" stroke="#a1a1aa" /><YAxis stroke="#a1a1aa" /><Tooltip /><Bar dataKey="users" fill="#B20710" radius={[6, 6, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SubscriptionPieChart({ data }) {
  return (
    <Card>
      <CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="plan" outerRadius={100}>
              {data.map((entry, index) => (<Cell key={entry.plan} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
