import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getSessionFromJwt } from "@/lib/auth/guard";
import Ad from "@/models/Ad";
import AdImpression from "@/models/AdImpression";

export async function POST(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { adId } = body || {};
  if (!Types.ObjectId.isValid(adId)) {
    return NextResponse.json({ message: "Invalid ad id" }, { status: 400 });
  }

  await connectDB();

  const ad = await Ad.findOneAndUpdate(
    { _id: adId, status: "active" },
    { $inc: { totalViews: 1 } },
    { new: true }
  );
  if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });

  await AdImpression.create({
    adId,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
