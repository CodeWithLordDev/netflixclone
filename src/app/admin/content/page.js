"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useAdminSearch } from "@/components/admin/admin-shell";

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [role, setRole] = useState("moderator");
  const { push } = useToast();
  const { query: adminQuery } = useAdminSearch();
  const router = useRouter();

  useEffect(() => {
    if (typeof adminQuery === "string" && adminQuery !== q) {
      setQ(adminQuery);
    }
  }, [adminQuery, q]);

  const normalizedQuery = useMemo(() => q.trim(), [q]);
  const publicTmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50", page: "1" });
      if (normalizedQuery) params.set("q", normalizedQuery);

      const customParams = new URLSearchParams();
      if (normalizedQuery) customParams.set("search", normalizedQuery);

      const [contentRes, customRes, videosRes] = await Promise.all([
        fetch(`/api/admin/content?${params.toString()}`),
        fetch(`/api/custom-videos?${customParams.toString()}`),
        fetch("/api/videos?scope=all"),
      ]);

      const contentData = await contentRes.json();
      if (!contentRes.ok || contentData?.error) {
        push(contentData?.message || "Failed to search content", "error");
        return;
      }

      const customData = customRes.ok ? await customRes.json() : [];
      const videosData = videosRes.ok ? await videosRes.json() : [];
      let tmdbData = { results: [] };
      if (publicTmdbKey && normalizedQuery.length >= 1) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 7000);
          const tmdbUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(normalizedQuery)}&include_adult=false&page=1&api_key=${encodeURIComponent(publicTmdbKey)}`;
          const tmdbRes = await fetch(tmdbUrl, { signal: controller.signal });
          clearTimeout(timeout);
          if (tmdbRes.ok) {
            tmdbData = await tmdbRes.json();
          }
        } catch {}
      }

      const adminRows = (contentData.items || []).map((row) => ({
        ...row,
        source: "Admin",
        _rowId: row._id,
      }));

      const customRows = Array.isArray(customData)
        ? customData.map((video) => ({
            _rowId: `custom-${video.videoId || video._id}`,
            title: video.title || "Untitled",
            contentType: "CUSTOM",
            category: video.genre || "Custom",
            status: video.isPublic ? "PUBLIC" : "PRIVATE",
            source: "Custom",
          }))
        : [];

      const uploadRows = Array.isArray(videosData)
        ? videosData.map((video) => ({
            _rowId: `upload-${video._id}`,
            _videoId: video._id,
            title: video.title || "Untitled",
            description: video.description || "",
            contentType: video.type || "CUSTOM",
            category: video.category || "Custom",
            status: video.status || "PUBLIC",
            source: video.source || "Custom Upload",
            videoUrl: video.videoUrl,
            thumbnail: video.thumbnail,
            tags: video.tags || [],
          }))
        : [];

      const tmdbRows = (tmdbData?.results || []).map((item) => ({
        _rowId: `tmdb-${item.id}`,
        title: item.title || item.name || "Untitled",
        contentType: item.media_type === "tv" ? "SERIES" : "MOVIE",
        category: item.media_type === "tv" ? "TV" : "Movie",
        status: "TMDB",
        source: "TMDB",
      }));

      setItems([...adminRows, ...uploadRows, ...customRows, ...tmdbRows]);
    } catch {
      push("Failed to search content", "error");
    }
  }, [normalizedQuery, push]);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (data?.user?.role) setRole(data.user.role);
      } catch {}
    };
    loadRole();
    load();
  }, [load]);

  // Manual search only (Search button).

  const setStatus = async (id, status) => {
    const snapshot = items;
    setItems((prev) => prev.map((row) => (row._id === id ? { ...row, status } : row)));

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      push(`Content ${status.toLowerCase()}`, "success");
    } catch {
      setItems(snapshot);
      push("Update failed", "error");
    }
  };

  const removeContent = async (id) => {
    const snapshot = items;
    setItems((prev) => prev.filter((row) => row._id !== id));
    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      push("Content deleted", "success");
    } catch {
      setItems(snapshot);
      push("Delete failed", "error");
    }
  };

  const openEdit = (row) => {
    setEditForm({
      id: row._videoId,
      title: row.title || "",
      description: row.description || "",
      category: row.category || "",
      status: row.status || "PUBLIC",
      tags: Array.isArray(row.tags) ? row.tags.join(", ") : "",
    });
    setEditOpen(true);
  };

  const updateVideo = async () => {
    if (!editForm?.id) return;
    const payload = {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      status: editForm.status,
      tags: editForm.tags,
    };
    try {
      const res = await fetch(`/api/videos/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) =>
        prev.map((row) =>
          row._videoId === updated._id
            ? {
                ...row,
                title: updated.title,
                description: updated.description,
                category: updated.category,
                status: updated.status,
                tags: updated.tags || [],
              }
            : row
        )
      );
      setEditOpen(false);
      push("Video updated", "success");
    } catch {
      push("Update failed", "error");
    }
  };

  const deleteVideo = async (id) => {
    const snapshot = items;
    setItems((prev) => prev.filter((row) => row._videoId !== id));
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      push("Video deleted", "success");
    } catch {
      setItems(snapshot);
      push("Delete failed", "error");
    }
  };

  const canManage = ["admin", "superadmin"].includes(role);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input placeholder="Search content (TMDB or custom)" value={q} onChange={(event) => setQ(event.target.value)} className="max-w-sm" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Search</Button>
          {role === "superadmin" ? <Button onClick={() => router.push("/dashboard/content/new")}>New Content</Button> : null}
        </div>
      </div>

      <DataTable
        columns={["Title", "Source", "Type", "Category", "Status", "Actions"]}
        rows={items}
        renderRow={(row) => (
          <tr key={row._rowId || row._id} className="border-b border-[var(--dash-border)]">
            <td className="px-4 py-3 text-[var(--dash-text)]">{row.title}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.source || "Admin"}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.contentType}</td>
            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.category}</td>
            <td className="px-4 py-3">
              <Badge tone={row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "danger" : "warning"}>{row.status}</Badge>
            </td>
            <td className="px-4 py-3">
              {row.source === "Admin" ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(row._id, "APPROVED")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(row._id, "REJECTED")}>Reject</Button>
                  {canManage ? <Button size="sm" variant="ghost" onClick={() => removeContent(row._id)}>Delete</Button> : null}
                </div>
              ) : row._videoId ? (
                <div className="flex flex-wrap gap-2">
                  {role === "superadmin" ? <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button> : null}
                  {role === "superadmin" ? <Button size="sm" variant="outline" onClick={() => deleteVideo(row._videoId)}>Delete</Button> : null}
                  <Button size="sm" variant="ghost" onClick={() => window.open(row.videoUrl, "_blank")}>Preview</Button>
                </div>
              ) : (
                <span className="text-[var(--dash-muted)]">-</span>
              )}
            </td>
          </tr>
        )}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Video">
        <div className="space-y-3">
          <Input
            placeholder="Title"
            value={editForm?.title || ""}
            onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <textarea
            placeholder="Description"
            value={editForm?.description || ""}
            onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
            className="min-h-[120px] w-full rounded-2xl border border-[var(--dash-border)] bg-black/10 px-4 py-3 text-sm text-[var(--dash-text)]"
          />
          <Input
            placeholder="Category"
            value={editForm?.category || ""}
            onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={editForm?.tags || ""}
            onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))}
          />
          <div className="flex rounded-2xl border border-[var(--dash-border)] bg-black/10 p-1">
            {["PUBLIC", "PRIVATE"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setEditForm((prev) => ({ ...prev, status: value }))}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  editForm?.status === value ? "bg-sky-500 text-black" : "text-[var(--dash-muted)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={updateVideo}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
