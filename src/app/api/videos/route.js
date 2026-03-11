import path from "path";
import { promises as fs } from "fs";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { requireAdmin } from "@/lib/auth/guard";
import { Roles } from "@/lib/auth/rbac";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function saveFile(file, targetDir, namePrefix) {
  const ext = path.extname(file.name || "") || ".bin";
  const filename = `${namePrefix}-${Date.now()}${ext}`;
  const outputPath = path.join(targetDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  return filename;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    const gate = await requireAdmin([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.MODERATOR]);
    if (gate.error) return gate.error;
    await connectDB();
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    console.info(`[videos] admin fetch: ${videos.length}`);
    return Response.json(videos);
  }

  await connectDB();
  const videos = await Video.find({ status: "PUBLIC" }).sort({ createdAt: -1 }).lean();
  console.info(`[videos] public fetch: ${videos.length}`);
  return Response.json(videos);
}

export async function POST(request) {
  const gate = await requireAdmin([Roles.SUPER_ADMIN]);
  if (gate.error) return gate.error;

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const category = formData.get("category");
  const status = formData.get("status") || "PUBLIC";
  const tagsRaw = formData.get("tags") || "";
  const videoFile = formData.get("video");
  const thumbnailFile = formData.get("thumbnail");

  if (!title || !description || !category || !videoFile || !thumbnailFile) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const safeCategory = slugify(category) || "general";
  const videosDir = path.join(process.cwd(), "public", "videos", safeCategory);
  const thumbsDir = path.join(process.cwd(), "public", "thumbnails");

  await fs.mkdir(videosDir, { recursive: true });
  await fs.mkdir(thumbsDir, { recursive: true });

  const base = slugify(title) || "video";
  const videoName = await saveFile(videoFile, videosDir, base);
  const thumbName = await saveFile(thumbnailFile, thumbsDir, base);

  await connectDB();

  const tags = String(tagsRaw)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const created = await Video.create({
    title: String(title),
    description: String(description),
    category: String(category),
    videoUrl: `/videos/${safeCategory}/${videoName}`,
    thumbnail: `/thumbnails/${thumbName}`,
    source: "Custom",
    type: "CUSTOM",
    status: String(status).toUpperCase() === "PRIVATE" ? "PRIVATE" : "PUBLIC",
    tags,
  });

  return Response.json(created, { status: 201 });
}
