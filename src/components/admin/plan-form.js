"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlanForm() {
  const [form, setForm] = useState({ name: "", type: "BASIC", priceMonthly: 0, durationDays: 30, maxDevices: 1, resolution: "720p" });

  async function submit(e) {
    e.preventDefault();
    await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priceMonthly: Number(form.priceMonthly), durationDays: Number(form.durationDays), maxDevices: Number(form.maxDevices) })
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-3">
      <Input placeholder="Plan Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
      <select className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-zinc-100" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option>BASIC</option><option>STANDARD</option><option>PREMIUM</option></select>
      <Input type="number" placeholder="Price" value={form.priceMonthly} onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))} required />
      <Input type="number" placeholder="Duration (days)" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))} required />
      <Input type="number" placeholder="Max Devices" value={form.maxDevices} onChange={(e) => setForm((f) => ({ ...f, maxDevices: e.target.value }))} required />
      <Input placeholder="Resolution" value={form.resolution} onChange={(e) => setForm((f) => ({ ...f, resolution: e.target.value }))} required />
      <div className="md:col-span-3"><Button>Create / Update Plan</Button></div>
    </form>
  );
}
