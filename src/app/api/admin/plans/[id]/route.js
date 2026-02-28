import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import { logAudit } from "@/lib/audit";
import { fail, ok } from "@/lib/api/response";

export async function GET(_, { params }) {
  const gate = await requirePermission(Permissions.PLANS_VIEW);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_PLAN_ID", "Invalid plan ID", 400);

    await connectDB();

    const [plan, subscriberCount] = await Promise.all([
      Plan.findById(id).lean(),
      Subscription.countDocuments({ planId: id, isActive: true, expiryDate: { $gt: new Date() } }),
    ]);

    if (!plan) return fail("PLAN_NOT_FOUND", "Plan not found", 404);

    return ok({
      id: String(plan._id),
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      billingCycle: plan.billingCycle,
      features: plan.features || [],
      videoQuality: plan.videoQuality,
      maxDevices: plan.maxDevices,
      hasAds: plan.hasAds,
      isActive: plan.isActive,
      subscriberCount,
    });
  } catch (error) {
    return fail("PLAN_FETCH_FAILED", "Failed to fetch plan", 500, error?.message);
  }
}

export async function PATCH(request, { params }) {
  const gate = await requirePermission(Permissions.PLANS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_PLAN_ID", "Invalid plan ID", 400);

    const body = await request.json();
    await connectDB();

    const plan = await Plan.findById(id);
    if (!plan) return fail("PLAN_NOT_FOUND", "Plan not found", 404);

    const updates = {};
    if (body.name && body.name !== plan.name) {
      const existing = await Plan.findOne({ name: body.name });
      if (existing) return fail("PLAN_EXISTS", "Plan name already exists", 409);
      updates.name = body.name;
    }

    if (body.description !== undefined) updates.description = body.description;
    if (typeof body.price === "number") updates.price = Math.max(0, body.price);
    if (body.duration) updates.duration = Number(body.duration);
    if (body.billingCycle) updates.billingCycle = body.billingCycle;
    if (body.videoQuality) updates.videoQuality = body.videoQuality;
    if (body.maxDevices) updates.maxDevices = Number(body.maxDevices);
    if (body.hasAds !== undefined) updates.hasAds = body.hasAds;
    if (Array.isArray(body.features)) updates.features = body.features;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.isRecommended !== undefined) updates.isRecommended = body.isRecommended;
    if (typeof body.displayOrder === "number") updates.displayOrder = body.displayOrder;

    const updated = await Plan.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "PLAN_UPDATED",
      entity: "Plan",
      entityId: id,
      metadata: updates,
    });

    return ok(updated);
  } catch (error) {
    return fail("PLAN_UPDATE_FAILED", "Failed to update plan", 500, error?.message);
  }
}

export async function DELETE(_, { params }) {
  const gate = await requirePermission(Permissions.PLANS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_PLAN_ID", "Invalid plan ID", 400);

    await connectDB();

    const plan = await Plan.findById(id);
    if (!plan) return fail("PLAN_NOT_FOUND", "Plan not found", 404);

    const activeCount = await Subscription.countDocuments({
      planId: id,
      isActive: true,
      expiryDate: { $gt: new Date() },
    });
    if (activeCount > 0) {
      return fail("PLAN_HAS_ACTIVE_SUBSCRIPTIONS", "Cannot delete plan with active subscriptions", 409);
    }

    await Plan.findByIdAndDelete(id);

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "PLAN_DELETED",
      entity: "Plan",
      entityId: id,
      metadata: { name: plan.name },
    });

    return ok({ deleted: true });
  } catch (error) {
    return fail("PLAN_DELETE_FAILED", "Failed to delete plan", 500, error?.message);
  }
}

