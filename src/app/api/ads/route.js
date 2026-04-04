import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionFromJwt } from "@/lib/auth/guard";
import Subscription from "@/models/Subscription";
import Ad from "@/models/Ad";
import { getAdPolicy } from "@/lib/ad-policy";
import { resolveViewerPlan } from "@/lib/subscription-plan";

export async function GET() {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ showAds: false, ads: [] });

  await connectDB();

  const [subscription, ads] = await Promise.all([
    Subscription.findOne({ userId: session.user.id, isActive: true, expiryDate: { $gt: new Date() } })
      .populate("planId")
      .sort({ createdAt: -1 })
      .lean(),
    Ad.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const viewerPlan = resolveViewerPlan({
    subscription,
    user: {
      plan: session.user.plan,
      subscriptionPlan: subscription?.planId?.name || session.user.plan,
    },
  });
  const policy = getAdPolicy(viewerPlan);
  const showAds = policy.enabled;

  if (!showAds) return NextResponse.json({ showAds: false, ads: [] });

  const eligibleTargets = viewerPlan === "basic" ? ["basic", "all"] : ["free", "all"];
  const targetedAds = ads.filter((ad) => eligibleTargets.includes(ad.targetPlan || "free"));
  const eligibleAds = targetedAds.length > 0
    ? targetedAds
    : ads.filter((ad) => Boolean(ad.videoUrl || ad.imageUrl));

  return NextResponse.json({
    showAds: eligibleAds.length > 0,
    viewerPlan,
    policy,
    ads: eligibleAds.map((ad) => ({
      id: String(ad._id),
      title: ad.title,
      videoUrl: ad.videoUrl,
      imageUrl: ad.imageUrl || "",
      duration: ad.duration,
      targetPlan: ad.targetPlan,
      revenuePerView: ad.revenuePerView,
    })),
  });
}
