"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

export default function UserDetailsModal({ userId, open, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    setUser(null);

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!active) return;
        if (!res.ok || data?.error) {
          setUser(null);
          setError(data?.error?.message || "Failed to load user details");
          return;
        }
        setUser(data);
      } catch {
        if (!active) return;
        setUser(null);
        setError("Failed to load user details");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [open, userId]);

  return (
    <Modal open={open} onClose={onClose} title="User Details">
      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading user details...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : !user ? (
        <p className="text-sm text-[var(--dash-muted)]">No user selected.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-[var(--dash-muted)]">User ID</p>
            <p className="font-mono text-[var(--dash-text)]">{user.id || userId}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--dash-muted)]">Name</p>
            <p className="text-[var(--dash-text)]">{user.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--dash-muted)]">Email</p>
            <p className="text-[var(--dash-text)]">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{user.role}</Badge>
            {user.isBanned ? <Badge tone="danger">Banned</Badge> : null}
            {!user.isActive ? <Badge tone="warning">Inactive</Badge> : null}
          </div>
          <div>
            <p className="text-xs text-[var(--dash-muted)]">Plan</p>
            <p className="text-[var(--dash-text)]">{user.plan || user.subscription?.planId?.name || "free"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--dash-muted)]">Joined</p>
            <p className="text-[var(--dash-text)]">
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
