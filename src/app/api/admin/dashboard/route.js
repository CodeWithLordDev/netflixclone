import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Report from "@/models/Report";
import Content from "@/models/Content";
import AuditLog from "@/models/AuditLog";
import { apiError, apiOk } from "@/lib/api";

function monthLabels(count = 6) {
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (count - 1 - idx));
    return d.toLocaleString("en-US", { month: "short" });
  });
}

function mergeSeries(labels, rows, key) {
  const byMonth = new Map((rows || []).map((r) => [r.month, Number(r[key] || 0)]));
  return labels.map((m) => ({ month: m, [key]: byMonth.get(m) || 0 }));
}

export async function GET() {
  const gate = await requirePermission(Permissions.DASHBOARD_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const labels = monthLabels(6);
    const lastYear = new Date(new Date().setMonth(new Date().getMonth() - 11));

    const [
      totalUsers,
      activeUsers,
      totalContent,
      openReports,
      totalRevenue,
      growthRows,
      revenueRows,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      Content.countDocuments(),
      Report.countDocuments({ status: { $in: ["OPEN", "IN_REVIEW", "ESCALATED"] } }),
      Payment.aggregate([{ $match: { status: { $in: ["success", "paid"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, users: { $sum: 1 } } },
        { $project: { _id: 0, month: "$_id", users: 1 } },
      ]),
      Payment.aggregate([
        { $match: { createdAt: { $gte: lastYear }, status: { $in: ["success", "paid"] } } },
        { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
        { $project: { _id: 0, month: "$_id", revenue: 1 } },
      ]),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return apiOk({
      cards: {
        totalUsers,
        activeUsers,
        totalContent,
        openReports,
        totalRevenue: totalRevenue?.[0]?.total || 0,
      },
      growth: mergeSeries(labels, growthRows, "users"),
      revenue: mergeSeries(labels, revenueRows, "revenue"),
      recentActivity,
      role: gate.session.user.role,
    });
  } catch (error) {
    return apiError("Failed to fetch dashboard data", 500, error.message);
  }
}
