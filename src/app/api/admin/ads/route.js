import path from "path";
import { promises as fs } from "fs";
import { connectDB } from "@/lib/mongodb";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { adSchema } from "@/lib/validators/admin";
import { fail, ok } from "@/lib/api/response";
import Ad from "@/models/Ad";
import AdImpression from "@/models/AdImpression";

function formatDay(date) {
  return date.toISOString().slice(0, 10);
}

function lastSevenDays() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

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

export async function GET() {
  const gate = await requirePermission(Permissions.ADS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const [ads, statsAgg, revenueAgg] = await Promise.all([
      Ad.find().sort({ createdAt: -1 }).lean(),
      Ad.aggregate([
        {
          $group: {
            _id: null,
            totalAds: { $sum: 1 },
            activeAds: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          },
        },
      ]),
      Ad.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ["$totalViews", "$revenuePerView"] } },
          },
        },
      ]),
    ]);

    const now = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const chartAgg = await AdImpression.aggregate([
      { $match: { createdAt: { $gte: start, $lte: now } } },
      {
        $lookup: {
          from: "ads",
          localField: "adId",
          foreignField: "_id",
          as: "ad",
        },
      },
      { $unwind: "$ad" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$ad.revenuePerView" },
        },
      },
    ]);

    const byDay = new Map(chartAgg.map((row) => [row._id, row.revenue]));
    const chart = lastSevenDays().map((day) => ({
      day: formatDay(day),
      revenue: Number(byDay.get(formatDay(day)) || 0),
    }));

    const stats = statsAgg?.[0] || { totalAds: 0, activeAds: 0 };
    const revenueRow = revenueAgg?.[0] || { revenue: 0 };

    return ok({
      items: ads.map((ad) => ({
        id: String(ad._id),
        title: ad.title,
        videoUrl: ad.videoUrl,
        duration: ad.duration,
        status: ad.status,
        targetPlan: ad.targetPlan,
        revenuePerView: ad.revenuePerView,
        totalViews: ad.totalViews,
        createdAt: ad.createdAt,
      })),
      stats: {
        totalAds: stats.totalAds || 0,
        activeAds: stats.activeAds || 0,
        totalRevenue: revenueRow.revenue || 0,
      },
      chart,
    });
  } catch (error) {
    return fail("ADS_FETCH_FAILED", "Failed to fetch ads", 500, error?.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.ADS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const title = formData.get("title");
      const duration = Number(formData.get("duration"));
      const statusRaw = String(formData.get("status") || "active").toLowerCase();
      const targetPlanRaw = String(formData.get("targetPlan") || "free").toLowerCase();
      const revenuePerView = Number(formData.get("revenuePerView") || 0);
      const videoFile = formData.get("video");
      const imageUrl = String(formData.get("imageUrl") || "");

      if (!title || (!videoFile && !imageUrl)) {
        return fail("VALIDATION_ERROR", "Missing required fields", 400);
      }
      if (!Number.isFinite(duration) || duration <= 0) {
        return fail("VALIDATION_ERROR", "Invalid duration", 400);
      }
      if (!Number.isFinite(revenuePerView) || revenuePerView < 0) {
        return fail("VALIDATION_ERROR", "Invalid revenue per view", 400);
      }

      const status = statusRaw === "inactive" ? "inactive" : "active";
      const targetPlan = ["free", "basic", "all"].includes(targetPlanRaw)
        ? targetPlanRaw
        : "free";

      let videoUrl = "";
      if (videoFile) {
        const adsDir = path.join(process.cwd(), "public", "ads");
        await fs.mkdir(adsDir, { recursive: true });
        const base = slugify(title) || "ad";
        const videoName = await saveFile(videoFile, adsDir, base);
        videoUrl = `/ads/${videoName}`;
      }

      await connectDB();
      const ad = await Ad.create({
        title: String(title),
        videoUrl,
        imageUrl,
        duration,
        status,
        targetPlan,
        revenuePerView,
        totalViews: 0,
      });

      return ok({ id: String(ad._id) }, 201);
    }

    const body = await request.json();
    const parsed = adSchema.safeParse(body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid payload", 400, parsed.error.flatten());

    await connectDB();

    const ad = await Ad.create({
      ...parsed.data,
      status: parsed.data.status || "active",
      targetPlan: parsed.data.targetPlan || "free",
      totalViews: 0,
    });

    return ok({ id: String(ad._id) }, 201);
  } catch (error) {
    return fail("ADS_CREATE_FAILED", "Failed to create ad", 500, error?.message);
  }
}
