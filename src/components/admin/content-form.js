"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const defaults = {
  title: "",
  slug: "",
  description: "",
  contentType: "MOVIE",
  status: "DRAFT",
  ageRating: "PG13",
  featured: false,
  trending: false,
  thumbnailUrl: "",
  bannerUrl: "",
  trailerUrl: "",
  videoUrl: "",
  categoryIds: []
};

export default function ContentForm() {
  const [form, setForm] = useState(defaults);
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setPending(true);

    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setPending(false);
    if (res.ok) setForm(defaults);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-2">
      <Input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
      <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
      <textarea
        className="md:col-span-2 min-h-24 rounded-md border border-zinc-700 bg-zinc-900/80 p-3 text-sm text-zinc-100"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <select className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" value={form.contentType} onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}>
        <option value="MOVIE">Movie</option>
        <option value="SERIES">Series</option>
      </select>
      <select className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" value={form.ageRating} onChange={(e) => setForm((f) => ({ ...f, ageRating: e.target.value }))}>
        <option>G</option><option>PG</option><option>PG13</option><option>R</option><option>NC17</option>
      </select>
      <Input placeholder="Thumbnail URL (Cloudinary)" value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} />
      <Input placeholder="Banner URL (Cloudinary)" value={form.bannerUrl} onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))} />
      <Input placeholder="Trailer URL" value={form.trailerUrl} onChange={(e) => setForm((f) => ({ ...f, trailerUrl: e.target.value }))} />
      <Input placeholder="Video URL" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
      <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
      <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={form.trending} onChange={(e) => setForm((f) => ({ ...f, trending: e.target.checked }))} /> Trending</label>
      <div className="md:col-span-2"><Button disabled={pending}>{pending ? "Saving..." : "Create Content"}</Button></div>
    </form>
  );
}
