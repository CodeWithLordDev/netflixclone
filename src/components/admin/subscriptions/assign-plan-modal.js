"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AssignPlanModal({ open, onClose, plans = [], onSubmit }) {
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/admin/users?page=1&limit=100", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setUsers(Array.isArray(data?.items) ? data.items : data?.items?.results || data?.results || data || []);
      } catch (error) {
        if (active) setUsers([]);
      } finally {
        if (active) setLoadingUsers(false);
      }
    };
    loadUsers();
    return () => {
      active = false;
    };
  }, [open]);

  const submit = async () => {
    if (!userId || !planId) return;
    await onSubmit({ userId, planId });
    setUserId("");
    setPlanId("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Plan To User">
      <div className="space-y-3">
        <select
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="h-10 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm text-[var(--dash-text)]"
        >
          <option value="">{loadingUsers ? "Loading users..." : "Select user"}</option>
          {users.map((user) => (
            <option key={user.id || user._id} value={user.id || user._id}>
              {user.id || user._id} - {user.name || user.email || "Unknown"}
            </option>
          ))}
        </select>
        <Input
          placeholder="User ID (manual)"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
        />
        <select
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          className="h-10 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm text-[var(--dash-text)]"
        >
          <option value="">Select plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ₹{Number(plan.price || 0).toLocaleString("en-IN")}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Assign</Button>
        </div>
      </div>
    </Modal>
  );
}
