"use client";

import { useEffect, useState } from "react";

export default function SuperadminPanel() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);

  async function load() {
    const [u, p, l] = await Promise.all([
      fetch("/api/users", { cache: "no-store" }),
      fetch("/api/plans", { cache: "no-store" }),
      fetch("/api/admin/audit-logs", { cache: "no-store" })
    ]);

    if (u.ok) {
      const uData = await u.json();
      setUsers(Array.isArray(uData) ? uData : uData.items || []);
    }
    if (p.ok) {
      const pData = await p.json();
      setPlans(Array.isArray(pData) ? pData : pData.items || []);
    }
    if (l.ok) {
      const lData = await l.json();
      setLogs(Array.isArray(lData) ? lData : lData.items || []);
    }
  }

  useEffect(() => { load(); }, []);

  async function setRole(userId, role) {
    await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    load();
  }

  async function deleteUser(userId) {
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    load();
  }

  async function deletePlan(planId) {
    await fetch(`/api/plans/${planId}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Superadmin Dashboard</h2>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Role Management</h3>
        <div className="space-y-2 text-sm">
          {Array.isArray(users) && users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-2 rounded border border-zinc-800 px-3 py-2">
              <span className="min-w-[220px]">{u.email} ({u.role})</span>
              <button className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => setRole(u._id, "moderator")}>Moderator</button>
              <button className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => setRole(u._id, "admin")}>Admin</button>
              <button className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => setRole(u._id, "user")}>User</button>
              <button className="rounded bg-red-700 px-2 py-1 text-xs" onClick={() => deleteUser(u._id)}>Delete User</button>
            </div>
          ))}
          {!Array.isArray(users) && <p className="text-zinc-500">No users available</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Delete Plans</h3>
        <div className="space-y-2 text-sm">
          {Array.isArray(plans) && plans.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2">
              <span>{p.name} (${p.price})</span>
              <button className="rounded bg-red-700 px-2 py-1 text-xs" onClick={() => deletePlan(p._id)}>Delete Plan</button>
            </div>
          ))}
          {!Array.isArray(plans) && <p className="text-zinc-500">No plans available</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Audit Logs</h3>
        <div className="space-y-2 text-xs text-zinc-300">
          {Array.isArray(logs) && logs.slice(0, 30).map((log) => (
            <div key={log._id} className="rounded border border-zinc-800 px-3 py-2">
              <p>{log.action} on {log.entity} ({log.entityId})</p>
              <p className="text-zinc-500">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {!Array.isArray(logs) && <p className="text-zinc-500">No logs available</p>}
        </div>
      </div>
    </section>
  );
}
