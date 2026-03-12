import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionFromJwt } from "@/lib/auth/guard";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import Ad from "@/models/Ad";

export async function GET() {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ showAds: false, ads: [] });

  await connectDB();

  const showAds = session.user.plan === "free";
  if (!showAds) return NextResponse.json({ showAds: false, ads: [] });

  const ads = await Ad.find({ status: "active", targetPlan: "free" })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    showAds: true,
    ads: ads.map((ad) => ({
      id: String(ad._id),
      title: ad.title,
      videoUrl: ad.videoUrl,
      duration: ad.duration,
      revenuePerView: ad.revenuePerView,
    })),
  });
}
