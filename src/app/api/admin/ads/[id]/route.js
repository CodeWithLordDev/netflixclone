import path from "path";
import { promises as fs } from "fs";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { adSchema } from "@/lib/validators/admin";
import { fail, ok } from "@/lib/api/response";
import Ad from "@/models/Ad";

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

async function removeFile(publicPath = "") {
  if (!publicPath) return;
  const cleanPath = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  const fullPath = path.join(process.cwd(), "public", cleanPath);
  try {
    await fs.unlink(fullPath);
  } catch {}
}

export async function PATCH(request, { params }) {
  const gate = await requirePermission(Permissions.ADS_MANAGE);
  if (gate.error) return gate.error;

  const { id } = params;
  if (!Types.ObjectId.isValid(id)) return fail("INVALID_AD_ID", "Invalid ad id", 400);

  try {
    const contentType = request.headers.get("content-type") || "";
    await connectDB();

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const update = {};

      const title = formData.get("title");
      const durationRaw = formData.get("duration");
      const statusRaw = formData.get("status");
      const revenueRaw = formData.get("revenuePerView");
      const videoFile = formData.get("video");

      if (title) update.title = String(title);
      if (durationRaw !== null) {
        const duration = Number(durationRaw);
        if (!Number.isFinite(duration) || duration <= 0) {
          return fail("VALIDATION_ERROR", "Invalid duration", 400);
        }
        update.duration = duration;
      }
      if (statusRaw) {
        const normalized = String(statusRaw).toLowerCase() === "inactive" ? "inactive" : "active";
        update.status = normalized;
      }
      if (revenueRaw !== null) {
        const revenuePerView = Number(revenueRaw);
        if (!Number.isFinite(revenuePerView) || revenuePerView < 0) {
          return fail("VALIDATION_ERROR", "Invalid revenue per view", 400);
        }
        update.revenuePerView = revenuePerView;
      }

      const ad = await Ad.findById(id).lean();
      if (!ad) return fail("AD_NOT_FOUND", "Ad not found", 404);

      if (videoFile && videoFile.name) {
        const adsDir = path.join(process.cwd(), "public", "ads");
        await fs.mkdir(adsDir, { recursive: true });
        const base = slugify(title || ad.title) || "ad";
        const videoName = await saveFile(videoFile, adsDir, base);
        update.videoUrl = `/ads/${videoName}`;
      }

      update.targetPlan = "free";

      const updated = await Ad.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
      if (!updated) return fail("AD_NOT_FOUND", "Ad not found", 404);

      if (update.videoUrl && ad.videoUrl && update.videoUrl !== ad.videoUrl) {
        await removeFile(ad.videoUrl);
      }

      return ok({ id: String(updated._id) });
    }

    const body = await request.json();
    const parsed = adSchema.partial().safeParse(body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid payload", 400, parsed.error.flatten());

    const ad = await Ad.findByIdAndUpdate(
      id,
      {
        $set: {
          ...parsed.data,
          targetPlan: "free",
        },
      },
      { new: true }
    );

    if (!ad) return fail("AD_NOT_FOUND", "Ad not found", 404);

    return ok({ id: String(ad._id) });
  } catch (error) {
    return fail("AD_UPDATE_FAILED", "Failed to update ad", 500, error?.message);
  }
}

export async function DELETE(request, { params }) {
  const gate = await requirePermission(Permissions.ADS_MANAGE);
  if (gate.error) return gate.error;

  const { id } = params;
  if (!Types.ObjectId.isValid(id)) return fail("INVALID_AD_ID", "Invalid ad id", 400);

  try {
    await connectDB();
    const ad = await Ad.findById(id).lean();
    if (!ad) return fail("AD_NOT_FOUND", "Ad not found", 404);

    await Ad.deleteOne({ _id: id });
    await removeFile(ad.videoUrl);

    return ok({ id: String(id) });
  } catch (error) {
    return fail("AD_DELETE_FAILED", "Failed to delete ad", 500, error?.message);
  }
}
