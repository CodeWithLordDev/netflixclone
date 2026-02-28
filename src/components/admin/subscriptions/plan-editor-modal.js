"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  duration: "",
  billingCycle: "monthly",
  videoQuality: "HD",
  maxDevices: "",
  hasAds: true,
  features: "",
  isActive: true,
};

function toForm(data) {
  if (!data) return EMPTY;
  return {
    ...data,
    features: Array.isArray(data.features) ? data.features.join(", ") : "",
  };
}

export default function PlanEditorModal({ open, onClose, initialData, onSubmit }) {
  const [form, setForm] = useState(() => toForm(initialData));

  const submit = async () => {
    await onSubmit({
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
      maxDevices: Number(form.maxDevices),
      features: String(form.features || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Edit Plan" : "New Plan"}>
      <div className="space-y-3">
        <Input
          placeholder="Enter plan name (e.g. Standard)"
          value={form.name}
          onChange={(event) => setForm((p) => ({ ...p, name: event.target.value }))}
        />
        <Input
          placeholder="Enter short plan description"
          value={form.description || ""}
          onChange={(event) => setForm((p) => ({ ...p, description: event.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Price in USD"
            value={form.price}
            onChange={(event) => setForm((p) => ({ ...p, price: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Duration in days"
            value={form.duration}
            onChange={(event) => setForm((p) => ({ ...p, duration: event.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.billingCycle}
            onChange={(event) => setForm((p) => ({ ...p, billingCycle: event.target.value }))}
            className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm"
          >
            <option value="" disabled>Select billing cycle</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
          </select>
          <Input
            type="number"
            placeholder="Maximum devices"
            value={form.maxDevices}
            onChange={(event) => setForm((p) => ({ ...p, maxDevices: event.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.videoQuality}
            onChange={(event) => setForm((p) => ({ ...p, videoQuality: event.target.value }))}
            className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm"
          >
            <option value="" disabled>Select video quality</option>
            <option value="SD">SD</option>
            <option value="HD">HD</option>
            <option value="FHD">FHD</option>
            <option value="4K">4K</option>
          </select>
          <select
            value={String(form.hasAds)}
            onChange={(event) => setForm((p) => ({ ...p, hasAds: event.target.value === "true" }))}
            className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] px-3 text-sm"
          >
            <option value="true">Ads enabled</option>
            <option value="false">No ads</option>
          </select>
        </div>
        <Input
          placeholder="Plan features (comma separated)"
          value={form.features}
          onChange={(event) => setForm((p) => ({ ...p, features: event.target.value }))}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{initialData ? "Update" : "Create"}</Button>
        </div>
      </div>
    </Modal>
  );
}
