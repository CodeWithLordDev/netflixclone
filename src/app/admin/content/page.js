"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  category: "General",
  contentType: "POST",
  status: "DRAFT",
  thumbnailUrl: "",
};

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [role, setRole] = useState("moderator");
  const { push } = useToast();

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50", page: "1" });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/content?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || data?.error) {
        push(data?.message || "Failed to search content", "error");
        return;
      }
      setItems(data.items || []);
    } catch {
      push("Failed to search content", "error");
    }
  }, [q, push]);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (data?.user?.role) setRole(data.user.role);
      } catch {}
    };
    loadRole();
    load();
  }, [load]);

  const createContent = async () => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setOpen(false);
      setForm(EMPTY_FORM);
      await load();
      push("Content created", "success");
    } catch {
      push("Failed to create content", "error");
    }
  };

  const setStatus = async (id, status) => {
    const snapshot = items;
    setItems((prev) => prev.map((row) => (row._id === id ? { ...row, status } : row)));

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      push(`Content ${status.toLowerCase()}`, "success");
    } catch {
      setItems(snapshot);
      push("Update failed", "error");
    }
  };

  const removeContent = async (id) => {
    const snapshot = items;
    setItems((prev) => prev.filter((row) => row._id !== id));
    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      push("Content deleted", "success");
    } catch {
      setItems(snapshot);
      push("Delete failed", "error");
    }
  };

  const canManage = ["admin", "superadmin"].includes(role);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input placeholder="Search content" value={q} onChange={(event) => setQ(event.target.value)} className="max-w-sm" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Search</Button>
          {canManage ? <Button onClick={() => setOpen(true)}>New Content</Button> : null}
        </div>
      </div>

      <DataTable
        columns={["Title", "Type", "Category", "Status", "Actions"]}
        rows={items}
        renderRow={(row) => (
          <tr key={row._id} className="border-b border-[var(--dash-border)]">
            <td className="px-4 py-3 text-[var(--dash-text)]">{row.title}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.contentType}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.category}</td>
            <td className="px-4 py-3">
              <Badge tone={row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "danger" : "warning"}>{row.status}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatus(row._id, "APPROVED")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(row._id, "REJECTED")}>Reject</Button>
                {canManage ? <Button size="sm" variant="ghost" onClick={() => removeContent(row._id)}>Delete</Button> : null}
              </div>
            </td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create Content">
        <div className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          <Input placeholder="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createContent}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
