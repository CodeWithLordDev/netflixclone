import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import Payment from "@/models/Payment";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { subscriptionSchema } from "@/lib/validators/platform";

function calculateExpiry(durationDays) {
  const ms = durationDays * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

export async function GET() {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const subscription = await Subscription.findOne({ userId: session.user.id, isActive: true })
    .populate("planId")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(subscription || null);
}

export async function POST(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const { planId, userId } = payload;

  await connectDB();

  const actorRole = normalizeRole(session.user.role);
  const targetUserId = userId && [Roles.ADMIN, Roles.SUPER_ADMIN].includes(actorRole) ? userId : session.user.id;

  const plan = await Plan.findById(planId);
  if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

  await Subscription.updateMany({ userId: targetUserId, isActive: true }, { $set: { isActive: false } });

  const subscription = await Subscription.create({
    userId: targetUserId,
    planId: plan._id,
    startDate: new Date(),
    expiryDate: calculateExpiry(plan.duration),
    isActive: true,
    paymentStatus: "paid",
    transactionRef: payload.transactionRef || `manual_${Date.now()}`,
  });

  await Payment.create({
    userId: targetUserId,
    amount: plan.price,
    currency: "USD",
    status: "success",
    paymentId: payload.transactionRef || `subscription_${Date.now()}`,
  });

  return NextResponse.json(subscription, { status: 201 });
}
