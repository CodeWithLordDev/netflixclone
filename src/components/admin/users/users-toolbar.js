"use client";

import { Input } from "@/components/ui/input";

export default function UsersToolbar({ query, onQuery, role, onRole, status, onStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search users by name or email"
        className="max-w-sm"
      />
      <select
        value={role}
        onChange={(event) => onRole(event.target.value)}
        className="h-10 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm text-[var(--dash-text)] focus:outline-none"
      >
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Super Admin</option>
      </select>
      <select
        value={status}
        onChange={(event) => onStatus(event.target.value)}
        className="h-10 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm text-[var(--dash-text)] focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="banned">Banned</option>
      </select>
    </div>
  );
}
