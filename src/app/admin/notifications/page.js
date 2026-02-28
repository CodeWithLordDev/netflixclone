"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function NotificationsPage() {
  const [form, setForm] = useState({ userId: "", title: "", message: "", type: "info", actionUrl: "" });
  const { push } = useToast();

  const submit = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      push("Notification sent", "success");
      setForm({ userId: "", title: "", message: "", type: "info", actionUrl: "" });
    } catch {
      push("Failed to send notification", "error");
    }
  };

  return (
    <div className="max-w-xl space-y-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 p-4">
      <Input placeholder="Recipient user id" value={form.userId} onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))} />
      <Input placeholder="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
      <Input placeholder="Message" value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} />
      <Input placeholder="Action URL (optional)" value={form.actionUrl} onChange={(event) => setForm((prev) => ({ ...prev, actionUrl: event.target.value }))} />
      <Button onClick={submit}>Send Notification</Button>
    </div>
  );
}
