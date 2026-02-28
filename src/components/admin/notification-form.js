"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotificationForm() {
  const [form, setForm] = useState({ type: "PUSH", title: "", body: "", recipientId: "" });

  async function onSubmit(e) {
    e.preventDefault();
    await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ type: "PUSH", title: "", body: "", recipientId: "" });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-2">
      <select className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-zinc-100" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
        <option value="PUSH">Push Notification</option>
        <option value="EMAIL">Promotional Email</option>
      </select>
      <Input placeholder="Recipient User ID (optional)" value={form.recipientId} onChange={(e) => setForm((f) => ({ ...f, recipientId: e.target.value }))} />
      <Input className="md:col-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
      <textarea className="md:col-span-2 min-h-28 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100" placeholder="Message" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required />
      <div className="md:col-span-2"><Button>Send</Button></div>
    </form>
  );
}
