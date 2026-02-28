"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AssignPlanModal({ open, onClose, plans = [], onSubmit }) {
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");

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
        <Input
          placeholder="User ID"
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
              {plan.name} - ${plan.price}
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
