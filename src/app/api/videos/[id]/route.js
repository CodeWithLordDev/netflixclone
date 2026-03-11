import path from "path";
import { promises as fs } from "fs";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { requireAdmin } from "@/lib/auth/guard";
import { Roles } from "@/lib/auth/rbac";

async function removeFile(publicPath = "") {
  if (!publicPath) return;
  const cleanPath = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  const fullPath = path.join(process.cwd(), "public", cleanPath);
  try {
    await fs.unlink(fullPath);
  } catch {}
}

export async function PUT(request, { params }) {
  const gate = await requireAdmin([Roles.SUPER_ADMIN]);
  if (gate.error) return gate.error;

  const payload = await request.json();
  const update = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    status: String(payload.status || "").toUpperCase() === "PRIVATE" ? "PRIVATE" : "PUBLIC",
    tags: Array.isArray(payload.tags) ? payload.tags : String(payload.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
  };

  await connectDB();
  const updated = await Video.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean();
  if (!updated) return Response.json({ error: "Video not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const gate = await requireAdmin([Roles.SUPER_ADMIN]);
  if (gate.error) return gate.error;

  await connectDB();
  const video = await Video.findById(params.id).lean();
  if (!video) return Response.json({ error: "Video not found" }, { status: 404 });

  await Video.deleteOne({ _id: params.id });
  await Promise.all([removeFile(video.videoUrl), removeFile(video.thumbnail)]);

  return Response.json({ ok: true });
}
