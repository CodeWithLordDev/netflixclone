"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import SectionCard from "@/components/admin/common/section-card";
import PageSkeleton from "@/components/admin/common/page-skeleton";
import AdRevenueLine from "@/components/admin/charts/ad-revenue-line";

const emptyForm = {
  title: "",
  duration: 15,
  status: "active",
  targetPlan: "free",
  revenuePerView: 0,
};

function buildPreview(file) {
  if (!file) return "";
  return URL.createObjectURL(file);
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 p-4 shadow-[0_15px_35px_-30px_rgba(0,0,0,.7)]">
      <p className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--dash-text)]">{value}</p>
      {helper ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{helper}</p> : null}
    </div>
  );
}

export default function AdsManagementPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({ totalAds: 0, activeAds: 0, totalRevenue: 0 });
  const [chart, setChart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState(null);
  const videoInputRef = useRef(null);

  const videoPreview = useMemo(() => buildPreview(videoFile), [videoFile]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed to load ads");
      setAds(data.items || []);
      setStats(data.stats || { totalAds: 0, activeAds: 0, totalRevenue: 0 });
      setChart(data.chart || []);
      setSelectedIds([]);
    } catch (error) {
      push(error.message || "Failed to load ads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formattedChart = useMemo(() => {
    if (!chart.length) return [];
    return chart.map((row) => {
      const parsed = new Date(row.day);
      const label = Number.isNaN(parsed.getTime())
        ? row.day
        : parsed.toLocaleDateString("en-IN", { weekday: "short" });
      return { day: label, revenue: row.revenue };
    });
  }, [chart]);

  const hasSelection = selectedIds.length > 0;
  const allSelected = ads.length > 0 && selectedIds.length === ads.length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ads.map((ad) => ad.id));
    }
  };

  const openCreate = () => {
    setEditingAd(null);
    setForm(emptyForm);
    setVideoFile(null);
    setModalOpen(true);
  };

  const openEdit = (ad) => {
    setEditingAd(ad);
    setForm({
      title: ad.title || "",
      duration: ad.duration || 15,
      status: ad.status || "active",
      targetPlan: ad.targetPlan || "free",
      revenuePerView: ad.revenuePerView || 0,
    });
    setVideoFile(null);
    setModalOpen(true);
  };

  const saveAd = async () => {
    try {
      if (!editingAd && !videoFile) {
        push("Please upload an ad video", "error");
        return;
      }

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("duration", String(form.duration));
      payload.append("status", form.status);
      payload.append("targetPlan", "free");
      payload.append("revenuePerView", String(form.revenuePerView));
      if (videoFile) payload.append("video", videoFile);

      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads";
      const method = editingAd ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        body: payload,
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed to save ad");

      push(editingAd ? "Ad updated" : "Ad created", "success");
      setModalOpen(false);
      await load();
    } catch (error) {
      push(error.message || "Failed to save ad", "error");
    }
  };

  const deleteAd = async (id) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed to delete ad");
      push("Ad deleted", "success");
      await load();
    } catch (error) {
      push(error.message || "Failed to delete ad", "error");
    }
  };

  const deleteSelected = async () => {
    if (!hasSelection) return;
    try {
      await Promise.all(selectedIds.map((id) => fetch(`/api/admin/ads/${id}`, { method: "DELETE" })));
      push("Selected ads deleted", "success");
      await load();
    } catch (error) {
      push(error.message || "Failed to delete ads", "error");
    }
  };

  const toggleStatus = async (ad) => {
    try {
      const payload = new FormData();
      payload.append("status", ad.status === "active" ? "inactive" : "active");

      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PATCH",
        body: payload,
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed to update ad");
      push(ad.status === "active" ? "Ad disabled" : "Ad enabled", "success");
      await load();
    } catch (error) {
      push(error.message || "Failed to update ad", "error");
    }
  };

  if (loading) return <PageSkeleton cards={3} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--dash-text)]">Ads Management</h1>
          <p className="text-sm text-[var(--dash-muted)]">Manage ad inventory and performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--dash-muted)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--dash-border)] bg-[var(--dash-panel)]"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
            Select all
          </label>
          <Button variant="outline" onClick={deleteSelected} disabled={!hasSelection}>
            Delete Ad
          </Button>
          <Button onClick={openCreate}>Add Ad</Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Running Ads" value={`${stats.activeAds} Active Ads`} helper="Status: Active" />
        <MetricCard
          label="Ad Revenue"
          value={`?${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`}
          helper="Total revenue from ads"
        />
        <MetricCard label="Total Ads" value={`${stats.totalAds} Ads`} helper="All created ads" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title="Ad Performance" description="Last 7 days Ad Revenue">
          <AdRevenueLine data={formattedChart} />
        </SectionCard>
        <SectionCard title="Targeting">
          <div className="space-y-2 text-sm text-[var(--dash-muted)]">
            <p>Ads are served only to Free plan users.</p>
            <p>Standard and Premium users never see ads.</p>
          </div>
        </SectionCard>
      </section>

      <DataTable
        columns={["Select", "Ad Name", "Duration", "Status", "Revenue / View", "Total Views", "Actions"]}
        rows={ads}
        renderRow={(row) => (
          <tr key={row.id} className="border-b border-[var(--dash-border)] transition hover:bg-white/[0.03]">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--dash-border)] bg-[var(--dash-panel)]"
                checked={selectedIds.includes(row.id)}
                onChange={() => toggleSelect(row.id)}
              />
            </td>
            <td className="px-4 py-3">
              <p className="font-medium text-[var(--dash-text)]">{row.title}</p>
              <p className="text-xs text-[var(--dash-muted)]">{row.videoUrl}</p>
            </td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.duration}s</td>
            <td className="px-4 py-3">
              <Badge tone={row.status === "active" ? "success" : "warning"}>{row.status}</Badge>
            </td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">
              ?{Number(row.revenuePerView || 0).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{Number(row.totalViews || 0).toLocaleString()}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(row)}>
                  {row.status === "active" ? "Disable" : "Enable"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteAd(row.id)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingAd ? "Edit Ad" : "Add Ad"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--dash-muted)]">Ad Title</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Summer Promo"
            />
          </div>

          <div
            onClick={() => videoInputRef.current?.click()}
            className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--dash-border)] bg-black/20 p-4 text-center text-sm text-[var(--dash-muted)]"
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            />
            <p className="font-semibold text-[var(--dash-text)]">Upload Ad Video</p>
            <p>Drag & drop or click to choose a video</p>
            {videoFile ? <p className="mt-2 text-xs">{videoFile.name}</p> : null}
            {!videoFile && editingAd?.videoUrl ? (
              <p className="mt-2 text-xs text-[var(--dash-muted)]">Using existing video</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--dash-border)] bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">Video preview</p>
            {videoPreview || editingAd?.videoUrl ? (
              <video className="mt-3 w-full rounded-xl" src={videoPreview || editingAd?.videoUrl} controls />
            ) : (
              <p className="mt-3 text-sm text-[var(--dash-muted)]">No video selected</p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-[var(--dash-muted)]">Ad Duration (seconds)</label>
              <Input
                type="number"
                min="1"
                value={form.duration}
                onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--dash-muted)]">Revenue Per View</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.revenuePerView}
                onChange={(event) => setForm((prev) => ({ ...prev, revenuePerView: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-[var(--dash-muted)]">Ad Status</label>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="h-10 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 px-3 text-sm text-[var(--dash-text)]"
              >
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--dash-muted)]">Target Plan</label>
              <div className="h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/40 px-3 text-sm text-[var(--dash-muted)] flex items-center">
                Free users only
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAd}>{editingAd ? "Update Ad" : "Create Ad"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
