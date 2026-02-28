/**
 * /api/admin/analytics
 * Dashboard analytics and stats
 * Different views based on role (moderator, admin, superadmin)
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";
import Revenue from "@/models/Revenue";
import Report from "@/models/Report";
import { checkAdminAuth, apiOk, apiError } from "@/lib/admin-api";
import { ROLES } from "@/lib/rbac";

function getLastNMonthLabels(count = 6) {
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (count - 1 - idx));
    return d.toLocaleString("en-US", { month: "short" });
  });
}

function aggregateByMonth(data, key) {
  const labels = getLastNMonthLabels(6);
  const map = new Map(data.map((item) => [item.month, item[key] || 0]));
  return labels.map((month) => ({
    month,
    [key]: map.get(month) || 0,
  }));
}

export async function GET(request) {
  const auth = await checkAdminAuth(ROLES.MODERATOR);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const now = new Date();
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Core metrics available to all roles
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      newUsersThisMonth,
      totalPlans,
      totalSubscriptions,
      activeSubscriptions,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }),
      Plan.countDocuments({ isActive: true }),
      Subscription.countDocuments(),
      Subscription.countDocuments({ isActive: true }),
      Report.countDocuments({ status: { $in: ["OPEN", "IN_REVIEW"] } }),
    ]);

    const basicMetrics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        newThisMonth: newUsersThisMonth,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
      },
      reports: {
        open: openReports,
      },
    };

    // User growth data (all roles can see)
    const userGrowthData = await User.aggregate([
      {
        $match: { createdAt: { $gte: last6Months } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: "$_id", users: 1 } },
    ]);

    const userGrowth = aggregateByMonth(userGrowthData, "users");

    // For Admin and Super Admin, include advanced metrics
    let advancedMetrics = null;
    let revenueData = null;

    if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(auth.user.role)) {
      const [totalRevenue, revenueRows, planDistribution, churnRate] = await Promise.all([
        Revenue.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Revenue.aggregate([
          {
            $match: { createdAt: { $gte: last6Months }, status: "completed" },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%b", date: "$createdAt" } },
              revenue: { $sum: "$amount" },
            },
          },
          { $project: { _id: 0, month: "$_id", revenue: 1 } },
        ]),
        Subscription.aggregate([
          { $group: { _id: "$planId", count: { $sum: 1 } } },
          { $lookup: { from: "plans", localField: "_id", foreignField: "_id", as: "plan" } },
          {
            $project: {
              plan: { $arrayElemAt: ["$plan.name", 0] },
              value: "$count",
            },
          },
        ]),
        Subscription.countDocuments({ cancelledAt: { $ne: null } }),
      ]);

      revenueData = aggregateByMonth(revenueRows, "revenue");

      const totalRev = totalRevenue[0]?.total || 0;
      const avgMonthlyRevenue = totalRev / 6;
      const monthlyChurn = (churnRate / totalSubscriptions) * 100;

      advancedMetrics = {
        revenue: {
          total: totalRev,
          avgMonthly: Math.round(avgMonthlyRevenue),
        },
        planDistribution: planDistribution || [],
        churnRate: Math.round(monthlyChurn * 10) / 10,
      };
    }

    // Recent activity (logs) for moderators and above
    const recentActivity = await User.find()
      .select("_id name email role createdAt lastLoginAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const response = {
      metrics: basicMetrics,
      charts: {
        userGrowth,
        revenueData,
      },
      recentActivity: recentActivity.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        action: "New registration",
        time: u.createdAt,
      })),
    };

    if (advancedMetrics) {
      response.advancedMetrics = advancedMetrics;
    }

    return apiOk(response);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return apiError("Failed to fetch analytics", 500, error.message);
  }
}
