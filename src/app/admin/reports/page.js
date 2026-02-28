"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "REJECTED"];

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("moderator");
  const { push } = useToast();

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "20" });
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    const res = await fetch(`/api/admin/reports?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
  }, [q, status]);

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

  const canResolve = ["admin", "superadmin"].includes(role);

  const updateStatus = async (id, next) => {
    const snapshot = items;
    setItems((prev) => prev.map((row) => (row._id === id ? { ...row, status: next } : row)));
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      push("Report updated", "success");
    } catch {
      setItems(snapshot);
      push("Failed to update report", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search reports" className="max-w-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm text-[var(--dash-text)]">
          <option value="">All Statuses</option>
          {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <Button variant="outline" onClick={load}>Apply</Button>
      </div>

      <DataTable
        columns={["Target", "Reason", "Priority", "Status", "Actions"]}
        rows={items}
        renderRow={(row) => (
          <tr key={row._id} className="border-b border-[var(--dash-border)]">
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.targetType}: {row.targetId}</td>
            <td className="px-4 py-3 text-[var(--dash-text)]">{row.reason}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.priority}</td>
            <td className="px-4 py-3"><Badge>{row.status}</Badge></td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(row._id, "IN_REVIEW")}>Review</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(row._id, "ESCALATED")}>Escalate</Button>
                {canResolve ? <Button size="sm" onClick={() => updateStatus(row._id, "RESOLVED")}>Resolve</Button> : null}
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
