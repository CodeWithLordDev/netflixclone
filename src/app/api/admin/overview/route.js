import { requirePermission } from "@/lib/auth/guard";
import { Permissions, hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import AuditLog from "@/models/AuditLog";
import { fail, ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

function monthLabels(count = 6) {
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (count - 1 - idx));
    return d.toLocaleString("en-US", { month: "short" });
  });
}

function mergeSeries(labels, rows, key) {
  const map = new Map((rows || []).map((row) => [row.month, Number(row[key] || 0)]));
  return labels.map((month) => ({ month, [key]: map.get(month) || 0 }));
}

export async function GET() {
  const gate = await requirePermission(Permissions.DASHBOARD_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const role = gate.session.user.role;
    const canViewRevenue = hasPermission(role, Permissions.REVENUE_VIEW) || hasPermission(role, Permissions.ANALYTICS_FULL);
    const labels = monthLabels(6);
    const since = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      activeUsersList,
      activeSubscriptions,
      totalRevenue,
      revenueRows,
      userGrowthRows,
      subscriptionDistribution,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      User.countDocuments({ isBanned: true }),
      User.find({ isActive: true, isBanned: false })
        .select("_id name email lastLoginAt")
        .sort({ lastLoginAt: -1, createdAt: -1 })
        .limit(8)
        .lean(),
      Subscription.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } }),
      canViewRevenue
        ? Payment.aggregate([
            { $match: { status: { $in: ["success", "paid"] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
        : Promise.resolve([{ total: 0 }]),
      canViewRevenue
        ? Payment.aggregate([
            { $match: { status: { $in: ["success", "paid"] }, createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
            { $project: { _id: 0, month: "$_id", revenue: 1 } },
          ])
        : Promise.resolve([]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, users: { $sum: 1 } } },
        { $project: { _id: 0, month: "$_id", users: 1 } },
      ]),
      Subscription.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$planId", count: { $sum: 1 } } },
        { $lookup: { from: "plans", localField: "_id", foreignField: "_id", as: "plan" } },
        { $project: { _id: 0, name: { $ifNull: [{ $arrayElemAt: ["$plan.name", 0] }, "Unknown"] }, value: "$count" } },
        { $sort: { value: -1 } },
        { $limit: 5 },
      ]),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id action entity createdAt actorRole metadata")
        .lean(),
    ]);

    return ok({
      cards: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalRevenue: Number(totalRevenue?.[0]?.total || 0),
        activeSubscriptions,
      },
      activeUsersList: activeUsersList.map((user) => ({
        id: String(user._id),
        name: user.name || user.email || "Unknown",
        email: user.email,
        lastLoginAt: user.lastLoginAt || null,
      })),
      charts: {
        monthlyRevenue: mergeSeries(labels, revenueRows, "revenue"),
        userGrowth: mergeSeries(labels, userGrowthRows, "users"),
        subscriptionDistribution,
      },
      recentActivity: recentActivity.map((item) => ({
        id: String(item._id),
        type: item.action,
        actor: item.actorRole,
        target: item.entity,
        createdAt: item.createdAt,
      })),
      capabilities: {
        canViewRevenue,
        canManagePlans: hasPermission(role, Permissions.PLANS_MANAGE),
        canManageUsers: hasPermission(role, Permissions.USERS_MANAGE),
        canModerateContent: hasPermission(role, Permissions.CONTENT_APPROVE),
      },
    });
  } catch (error) {
    return fail("OVERVIEW_FETCH_FAILED", "Failed to load dashboard overview", 500, error?.message);
  }
}
