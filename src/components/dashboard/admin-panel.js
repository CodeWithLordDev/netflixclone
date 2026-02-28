"use client";

import { useEffect, useState } from "react";
import AdminAnalyticsPanel from "@/components/dashboard/admin-analytics-panel";

const emptyPlan = { name: "", price: 0, duration: 30, videoQuality: "HD", maxDevices: 2, hasAds: false, billingCycle: "monthly" };
const emptyVideo = { title: "", description: "", category: "", thumbnail: "", videoUrl: "", ageRating: "UA13+", isFeatured: false, isTrending: false };

export default function AdminPanel() {
  const [plans, setPlans] = useState([]);
  const [videos, setVideos] = useState([]);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [videoForm, setVideoForm] = useState(emptyVideo);

  async function load() {
    const [p, v] = await Promise.all([
      fetch("/api/plans", { cache: "no-store" }),
      fetch("/api/videos", { cache: "no-store" })
    ]);
    if (p.ok) setPlans(await p.json());
    if (v.ok) setVideos(await v.json());
  }

  useEffect(() => { load(); }, []);

  async function createPlan(e) {
    e.preventDefault();
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...planForm, price: Number(planForm.price), duration: Number(planForm.duration), maxDevices: Number(planForm.maxDevices) })
    });
    setPlanForm(emptyPlan);
    load();
  }

  async function createVideo(e) {
    e.preventDefault();
    await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoForm)
    });
    setVideoForm(emptyVideo);
    load();
  }

  async function deleteVideo(id) {
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>

      <AdminAnalyticsPanel />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createPlan} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <h3 className="font-semibold">Create Plan</h3>
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Plan Name" value={planForm.name} onChange={(e) => setPlanForm((s) => ({ ...s, name: e.target.value }))} required />
          <div className="grid grid-cols-3 gap-2">
            <input className="rounded bg-zinc-800 px-3 py-2" placeholder="Price" type="number" value={planForm.price} onChange={(e) => setPlanForm((s) => ({ ...s, price: e.target.value }))} required />
            <input className="rounded bg-zinc-800 px-3 py-2" placeholder="Duration" type="number" value={planForm.duration} onChange={(e) => setPlanForm((s) => ({ ...s, duration: e.target.value }))} required />
            <input className="rounded bg-zinc-800 px-3 py-2" placeholder="Devices" type="number" value={planForm.maxDevices} onChange={(e) => setPlanForm((s) => ({ ...s, maxDevices: e.target.value }))} required />
          </div>
          <button className="rounded bg-red-600 px-3 py-2 text-sm">Create Plan</button>
        </form>

        <form onSubmit={createVideo} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <h3 className="font-semibold">Upload Video</h3>
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Title" value={videoForm.title} onChange={(e) => setVideoForm((s) => ({ ...s, title: e.target.value }))} required />
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Description" value={videoForm.description} onChange={(e) => setVideoForm((s) => ({ ...s, description: e.target.value }))} required />
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Category" value={videoForm.category} onChange={(e) => setVideoForm((s) => ({ ...s, category: e.target.value }))} required />
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Thumbnail URL" value={videoForm.thumbnail} onChange={(e) => setVideoForm((s) => ({ ...s, thumbnail: e.target.value }))} required />
          <input className="w-full rounded bg-zinc-800 px-3 py-2" placeholder="Video URL" value={videoForm.videoUrl} onChange={(e) => setVideoForm((s) => ({ ...s, videoUrl: e.target.value }))} required />
          <button className="rounded bg-red-600 px-3 py-2 text-sm">Upload Video</button>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Manage Videos</h3>
        <div className="space-y-2">
          {videos.slice(0, 10).map((v) => (
            <div key={v._id} className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2 text-sm">
              <span>{v.title}</span>
              <button onClick={() => deleteVideo(v._id)} className="rounded bg-red-700 px-2 py-1 text-xs">Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Plans</h3>
        <div className="space-y-2 text-sm">
          {plans.map((p) => (
            <div key={p._id} className="rounded border border-zinc-800 px-3 py-2">{p.name} - ${p.price} / {p.duration} days</div>
          ))}
        </div>
      </div>
    </section>
  );
}
