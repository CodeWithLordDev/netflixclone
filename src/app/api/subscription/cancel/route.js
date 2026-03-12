import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

export async function POST(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    await connectDB();
    const subscription = await Subscription.findOne({ userId: decoded.id, isActive: true }).sort({ createdAt: -1 });
    if (!subscription) return NextResponse.json({ message: "No active subscription" }, { status: 404 });

    subscription.isActive = false;
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    subscription.cancelledReason = "User requested cancellation";
    await subscription.save();

    await User.findByIdAndUpdate(decoded.id, {
      $set: {
        plan: "free",
        subscriptionPlan: "Free",
        subscriptionStatus: "inactive",
        subscriptionEndDate: subscription.expiryDate || new Date(),
        subscriptionExpiresAt: subscription.expiryDate || new Date(),
      },
    });

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to cancel subscription", error: error.message }, { status: 500 });
  }
}
