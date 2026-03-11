"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = ["Tutorial", "Movie", "Series", "Documentary", "Trailer", "General"];

function buildPreview(file) {
  if (!file) return "";
  return URL.createObjectURL(file);
}

export default function ContentUploadForm() {
  const router = useRouter();
  const { push } = useToast();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState("PUBLIC");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const videoPreview = useMemo(() => buildPreview(videoFile), [videoFile]);
  const thumbPreview = useMemo(() => buildPreview(thumbFile), [thumbFile]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
  }, [videoPreview, thumbPreview]);

  const onDrop = (event, type) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (type === "video") setVideoFile(file);
    if (type === "thumb") setThumbFile(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!title || !description || !category || !videoFile || !thumbFile) {
      push("Please fill all required fields", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("status", status);
    formData.append("tags", tags);
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbFile);

    try {
      setLoading(true);
      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      push("Content uploaded", "success");
      router.push("/admin/content");
    } catch {
      push("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--dash-muted)]">Title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="React Hooks Tutorial" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--dash-muted)]">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-[120px] w-full rounded-2xl border border-[var(--dash-border)] bg-black/20 px-4 py-3 text-sm text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder="Short description of the content"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--dash-muted)]">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-[var(--dash-border)] bg-black/20 px-3 text-sm text-[var(--dash-text)]"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--dash-muted)]">Status</label>
              <div className="mt-2 flex rounded-2xl border border-[var(--dash-border)] bg-black/20 p-1">
                {["PUBLIC", "PRIVATE"].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      status === value ? "bg-sky-500 text-black" : "text-[var(--dash-muted)]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--dash-muted)]">Tags (optional)</label>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="react, hooks, tutorial" />
          </div>
        </div>

        <div className="space-y-4">
          <div
            onDrop={(event) => onDrop(event, "video")}
            onDragOver={(event) => event.preventDefault()}
            onClick={() => videoInputRef.current?.click()}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--dash-border)] bg-black/20 p-4 text-center text-sm text-[var(--dash-muted)]"
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            />
            <p className="font-semibold text-[var(--dash-text)]">Upload Video</p>
            <p>Drag & drop or click to choose a video</p>
            {videoFile ? <p className="mt-2 text-xs">{videoFile.name}</p> : null}
          </div>

          <div
            onDrop={(event) => onDrop(event, "thumb")}
            onDragOver={(event) => event.preventDefault()}
            onClick={() => thumbInputRef.current?.click()}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--dash-border)] bg-black/20 p-4 text-center text-sm text-[var(--dash-muted)]"
          >
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setThumbFile(event.target.files?.[0] || null)}
            />
            <p className="font-semibold text-[var(--dash-text)]">Upload Thumbnail</p>
            <p>Drag & drop or click to choose an image</p>
            {thumbFile ? <p className="mt-2 text-xs">{thumbFile.name}</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--dash-border)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">Video preview</p>
          {videoPreview ? (
            <video className="mt-3 w-full rounded-xl" src={videoPreview} controls />
          ) : (
            <p className="mt-3 text-sm text-[var(--dash-muted)]">No video selected</p>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--dash-border)] bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--dash-muted)]">Thumbnail preview</p>
          {thumbPreview ? (
            <img className="mt-3 w-full rounded-xl object-cover" src={thumbPreview} alt="Thumbnail preview" />
          ) : (
            <p className="mt-3 text-sm text-[var(--dash-muted)]">No thumbnail selected</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
