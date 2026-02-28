"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsForm({ initialSettings }) {
  const [form, setForm] = useState(initialSettings);

  async function onSubmit(e) {
    e.preventDefault();
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-2">
      <Input placeholder="Platform Name" value={form.platformName || ""} onChange={(e) => setForm((f) => ({ ...f, platformName: e.target.value }))} />
      <Input placeholder="Logo URL" value={form.logoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} />
      <Input placeholder="SEO Title" value={form.seoTitle || ""} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
      <Input placeholder="Support Email" value={form.supportEmail || ""} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} />
      <Input placeholder="Stripe Publishable Key" value={form.stripePublicKey || ""} onChange={(e) => setForm((f) => ({ ...f, stripePublicKey: e.target.value }))} />
      <Input placeholder="Stripe Secret Key" value={form.stripeSecretKey || ""} onChange={(e) => setForm((f) => ({ ...f, stripeSecretKey: e.target.value }))} />
      <textarea className="md:col-span-2 min-h-24 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100" placeholder="SEO Description" value={form.seoDescription || ""} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
      <div className="md:col-span-2"><Button>Save Settings</Button></div>
    </form>
  );
}
