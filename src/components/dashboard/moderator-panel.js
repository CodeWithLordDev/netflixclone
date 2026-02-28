"use client";

import { useEffect, useState } from "react";

export default function ModeratorPanel() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [u, r, v] = await Promise.all([
      fetch("/api/users", { cache: "no-store" }),
      fetch("/api/videos/reports", { cache: "no-store" }),
      fetch("/api/videos", { cache: "no-store" })
    ]);

    if (u.ok) setUsers(await u.json());
    if (r.ok) setReports(await r.json());
    if (v.ok) setVideos(await v.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBan(userId, isBanned) {
    setLoading(true);
    await fetch(`/api/users/${userId}/ban`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !isBanned })
    });
    await load();
    setLoading(false);
  }

  async function removeVideo(videoId) {
    setLoading(true);
    await fetch(`/api/videos/${videoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Moderation action" })
    });
    await load();
    setLoading(false);
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Moderator Dashboard</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <h3 className="mb-3 font-semibold">Users (Ban / Unban)</h3>
          <div className="space-y-2 text-sm">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2">
                <span>{u.email} ({u.role})</span>
                <button
                  disabled={loading}
                  onClick={() => toggleBan(u._id, u.isBanned)}
                  className={`rounded px-2 py-1 text-xs ${u.isBanned ? "bg-emerald-700" : "bg-red-700"}`}
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <h3 className="mb-3 font-semibold">Reported Content</h3>
          <div className="space-y-2 text-sm text-zinc-300">
            {reports.map((r) => (
              <div key={r._id} className="rounded border border-zinc-800 px-3 py-2">
                <p>Video: {r.videoId?.title || r.videoId}</p>
                <p className="text-zinc-400">Reason: {r.reason}</p>
              </div>
            ))}
            {!reports.length && <p className="text-zinc-500">No open reports</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
        <h3 className="mb-3 font-semibold">Remove Inappropriate Video</h3>
        <div className="space-y-2 text-sm">
          {videos.slice(0, 10).map((v) => (
            <div key={v._id} className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2">
              <span>{v.title}</span>
              <button disabled={loading} onClick={() => removeVideo(v._id)} className="rounded bg-red-700 px-2 py-1 text-xs">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
