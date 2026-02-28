"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";

function statusTone(row) {
  if (row.status === "banned") return "danger";
  if (row.status === "inactive") return "warning";
  return "success";
}

export default function UsersTable({
  rows = [],
  viewerRole = "moderator",
  onRoleChange,
  onBanToggle,
  onOpenDetails,
}) {
  const resolveId = (row) => {
    if (!row) return "";
    if (typeof row.id === "string" && row.id.trim()) return row.id.trim();
    if (typeof row._id === "string" && row._id.trim()) return row._id.trim();
    return "";
  };

  const roleOptions = useMemo(() => {
    if (viewerRole === "superadmin") return ["user", "moderator", "admin"];
    if (viewerRole === "admin") return ["user", "moderator"];
    return [];
  }, [viewerRole]);

  return (
    <DataTable
      columns={["User ID", "User", "Role", "Status", "Plan", "Actions"]}
      rows={rows}
      renderRow={(row) => (
        <tr key={resolveId(row) || row.email} className="border-b border-[var(--dash-border)] transition hover:bg-white/[0.03]">
          <td className="px-4 py-3 font-mono text-xs text-[var(--dash-muted)]">{resolveId(row)}</td>
          <td className="px-4 py-3">
            <p className="font-medium text-[var(--dash-text)]">{row.name || "-"}</p>
            <p className="text-xs text-[var(--dash-muted)]">{row.email}</p>
          </td>
          <td className="px-4 py-3 text-[var(--dash-text)]">
            <div className="flex items-center gap-2">
              <Badge>{row.role}</Badge>
              {roleOptions.length > 0 ? (
                <select
                  value={row.role}
                  onChange={(event) => onRoleChange(resolveId(row), event.target.value)}
                  className="h-8 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-2 text-xs"
                >
                  {!roleOptions.includes(row.role) ? (
                    <option value={row.role}>{row.role}</option>
                  ) : null}
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </td>
          <td className="px-4 py-3">
            <Badge tone={statusTone(row)}>{row.status}</Badge>
          </td>
          <td className="px-4 py-3 text-[var(--dash-muted)]">{row.plan || "free"}</td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {viewerRole !== "moderator" ? (
                <Button size="sm" variant="outline" onClick={() => onBanToggle(row)}>
                  {row.status === "banned" ? "Unban" : "Ban"}
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => onOpenDetails(resolveId(row))}>
                Details
              </Button>
            </div>
          </td>
        </tr>
      )}
    />
  );
}
