"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotificationForm() {
  const [form, setForm] = useState({
    audience: "all",
    type: "info",
    title: "",
    message: "",
    actionUrl: "",
    userId: "",
  });

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      audience: form.audience,
      type: form.type,
      title: form.title,
      message: form.message,
      actionUrl: form.actionUrl,
      userId: form.audience === "user" ? form.userId : "",
    };
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm({
      audience: "all",
      type: "info",
      title: "",
      message: "",
      actionUrl: "",
      userId: "",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-2">
      <select
        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-zinc-100"
        value={form.audience}
        onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
      >
        <option value="all">All Users</option>
        <option value="user">Specific User</option>
      </select>
      <select
        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-zinc-100"
        value={form.type}
        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
      >
        <option value="info">Info</option>
        <option value="success">Success</option>
        <option value="warning">Warning</option>
        <option value="danger">Danger</option>
      </select>
      {form.audience === "user" ? (
        <Input
          placeholder="Recipient User ID"
          value={form.userId}
          onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          required
        />
      ) : (
        <Input
          placeholder="Broadcast to all users"
          value="All users"
          readOnly
          className="opacity-60"
        />
      )}
      <Input
        className="md:col-span-2"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        required
      />
      <Input
        className="md:col-span-2"
        placeholder="Action URL (optional)"
        value={form.actionUrl}
        onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))}
      />
      <textarea
        className="md:col-span-2 min-h-28 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100"
        placeholder="Message"
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        required
      />
      <div className="md:col-span-2"><Button>Send</Button></div>
    </form>
  );
}
