import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import User from "@/models/User";
import { parsePagination } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { fail, ok, paged } from "@/lib/api/response";

export async function GET(request) {
  const gate = await requirePermission(Permissions.SUBSCRIPTIONS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status") || "all";
    const planFilter = searchParams.get("plan") || "";

    const query = {};
    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === "expired") {
      query.expiryDate = { $lte: new Date() };
    }
    if (planFilter && Types.ObjectId.isValid(planFilter)) {
      query.planId = new Types.ObjectId(planFilter);
    }

    const [total, subscriptions] = await Promise.all([
      Subscription.countDocuments(query),
      Subscription.find(query)
        .populate("userId", "name email role")
        .populate("planId", "name price billingCycle")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return ok(
      paged(
        subscriptions.map((sub) => ({
          id: String(sub._id),
          userId: String(sub.userId?._id || ""),
          userName: sub.userId?.name || "-",
          userEmail: sub.userId?.email || "-",
          planId: String(sub.planId?._id || ""),
          planName: sub.planId?.name || "-",
          amount: sub.amount,
          isActive: sub.isActive,
          paymentStatus: sub.paymentStatus,
          expiryDate: sub.expiryDate,
        })),
        total,
        page,
        limit
      )
    );
  } catch (error) {
    return fail("SUBSCRIPTIONS_FETCH_FAILED", "Failed to fetch subscriptions", 500, error?.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.SUBSCRIPTIONS_ASSIGN);
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const { userId, planId, amount, billingPeriodMonths = 1 } = body;

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(planId)) {
      return fail("INVALID_IDS", "Invalid user or plan ID", 400);
    }

    await connectDB();

    const [user, plan] = await Promise.all([User.findById(userId), Plan.findById(planId)]);
    if (!user) return fail("USER_NOT_FOUND", "User not found", 404);
    if (!plan) return fail("PLAN_NOT_FOUND", "Plan not found", 404);

    await Subscription.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, cancelledAt: new Date(), cancelledReason: "Replaced by admin" } }
    );

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Number(billingPeriodMonths || 1));

    const subscription = await Subscription.create({
      userId,
      planId,
      startDate,
      expiryDate,
      isActive: true,
      amount: amount || plan.price,
      currency: "USD",
      paymentStatus: "paid",
      autoRenew: true,
    });

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "SUBSCRIPTION_ASSIGNED",
      entity: "Subscription",
      entityId: String(subscription._id),
      metadata: { userId, planId, amount: amount || plan.price },
    });

    return ok({ id: String(subscription._id) }, 201);
  } catch (error) {
    return fail("SUBSCRIPTION_CREATE_FAILED", "Failed to create subscription", 500, error?.message);
  }
}

