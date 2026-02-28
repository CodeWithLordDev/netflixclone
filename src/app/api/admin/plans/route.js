import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import { logAudit } from "@/lib/audit";
import { fail, ok, paged } from "@/lib/api/response";
import { parsePagination } from "@/lib/api";

export async function GET(request) {
  const gate = await requirePermission(Permissions.PLANS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const search = String(searchParams.get("search") || "").trim();
    const status = String(searchParams.get("status") || "all");

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const [total, plans] = await Promise.all([
      Plan.countDocuments(query),
      Plan.find(query)
        .sort({ displayOrder: 1, price: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const planIds = plans.map((item) => item._id);
    const counts = await Subscription.aggregate([
      { $match: { planId: { $in: planIds }, isActive: true, expiryDate: { $gt: new Date() } } },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
    ]);
    const byId = new Map(counts.map((item) => [String(item._id), item.count]));

    return ok(
      paged(
        plans.map((plan) => ({
          id: String(plan._id),
          name: plan.name,
          description: plan.description || "",
          price: plan.price,
          duration: plan.duration,
          billingCycle: plan.billingCycle,
          videoQuality: plan.videoQuality,
          maxDevices: plan.maxDevices,
          hasAds: plan.hasAds,
          features: plan.features || [],
          subscriberCount: byId.get(String(plan._id)) || 0,
          isActive: plan.isActive,
        })),
        total,
        page,
        limit
      )
    );
  } catch (error) {
    return fail("PLANS_FETCH_FAILED", "Failed to fetch plans", 500, error?.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.PLANS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const billingCycle = String(body.billingCycle || "monthly");

    if (!name || typeof body.price !== "number" || !body.duration) {
      return fail("INVALID_PLAN_INPUT", "Missing or invalid required fields", 400);
    }

    if (body.price < 0) return fail("INVALID_PLAN_PRICE", "Price cannot be negative", 400);
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return fail("INVALID_BILLING_CYCLE", "Invalid billing cycle", 400);
    }

    await connectDB();

    const exists = await Plan.findOne({ name });
    if (exists) return fail("PLAN_EXISTS", "Plan name already exists", 409);

    const plan = await Plan.create({
      name,
      description: body.description || "",
      price: body.price,
      currency: "USD",
      duration: Number(body.duration),
      billingCycle,
      videoQuality: body.videoQuality || "HD",
      maxDevices: Number(body.maxDevices || 1),
      hasAds: body.hasAds !== false,
      features: Array.isArray(body.features) ? body.features : [],
      isActive: body.isActive !== false,
      isRecommended: body.isRecommended === true,
      createdBy: gate.session.user.id,
      displayOrder: Number(body.displayOrder || 0),
    });

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "PLAN_CREATED",
      entity: "Plan",
      entityId: String(plan._id),
      metadata: { name: plan.name, price: plan.price, billingCycle: plan.billingCycle },
    });

    return ok({ id: String(plan._id) }, 201);
  } catch (error) {
    return fail("PLAN_CREATE_FAILED", "Failed to create plan", 500, error?.message);
  }
}

