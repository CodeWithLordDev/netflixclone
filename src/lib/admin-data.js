import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Content from "@/models/admin/Content";
import WatchHistory from "@/models/admin/WatchHistory";
import SubscriptionPlan from "@/models/admin/SubscriptionPlan";
import UserSubscription from "@/models/admin/UserSubscription";
import PlatformSetting from "@/models/admin/PlatformSetting";

function toPlain(data) {
  return JSON.parse(JSON.stringify(data));
}

function lastMonthLabels(count = 6) {
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

export async function getDashboardStats() {
  await connectDB();

  const [totalUsers, totalMovies, totalSeries, revenueAgg, distRaw, recentUsers, monthlyRevenue, userGrowth] = await Promise.all([
    User.countDocuments(),
    Content.countDocuments({ contentType: "MOVIE" }),
    Content.countDocuments({ contentType: "SERIES" }),
    Payment.aggregate([{ $match: { status: { $in: ["success", "paid"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    UserSubscription.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt").lean(),
    Payment.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
      { $project: { _id: 0, month: "$_id", revenue: 1 } }
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: { _id: { $dateToString: { format: "%b", date: "$createdAt" } }, users: { $sum: 1 } } },
      { $project: { _id: 0, month: "$_id", users: 1 } }
    ])
  ]);

  const labels = lastMonthLabels(6);

  return {
    metrics: {
      totalUsers,
      totalMovies,
      totalSeries,
      totalRevenue: revenueAgg?.[0]?.total || 0
    },
    subscriptionDist: distRaw.length
      ? distRaw.map((p) => ({ plan: p._id || "UNKNOWN", value: p.count }))
      : [{ plan: "BASIC", value: 0 }, { plan: "STANDARD", value: 0 }, { plan: "PREMIUM", value: 0 }],
    recentActivity: recentUsers.map((u) => ({ id: String(u._id), actor: u.name || u.email, action: "SIGNED_UP", entity: "User", time: new Date(u.createdAt).toLocaleDateString() })),
    monthlyRevenue: mergeSeries(labels, monthlyRevenue, "revenue"),
    userGrowth: mergeSeries(labels, userGrowth, "users")
  };
}

export async function getContentList() {
  await connectDB();
  return toPlain(await Content.find().sort({ updatedAt: -1 }).lean());
}

export async function getUsersList() {
  await connectDB();

  const users = await User.find().sort({ createdAt: -1 }).lean();
  const ids = users.map((u) => u._id);

  const [subs, history] = await Promise.all([
    UserSubscription.find({ userId: { $in: ids } }).populate("planId").sort({ startDate: -1 }).lean(),
    WatchHistory.find({ userId: { $in: ids } }).sort({ watchedAt: -1 }).limit(200).lean()
  ]);

  return toPlain(
    users.map((u) => {
      const userSubs = subs.filter((s) => String(s.userId) === String(u._id));
      const userHistory = history.filter((h) => String(h.userId) === String(u._id)).slice(0, 5);
      return { ...u, subscriptions: userSubs, watchHistory: userHistory };
    })
  );
}

export async function getPlans() {
  await connectDB();
  return toPlain(await SubscriptionPlan.find().sort({ priceMonthly: 1 }).lean());
}

export async function getSettings() {
  await connectDB();
  return toPlain(await PlatformSetting.findOne({ key: "platform" }).lean());
}

export async function getAnalyticsRows() {
  await connectDB();

  const [watchTime, watched] = await Promise.all([
    WatchHistory.aggregate([{ $group: { _id: "$userId", watchSeconds: { $sum: "$watchSeconds" } } }]),
    Content.aggregate([
      {
        $lookup: {
          from: "watchhistories",
          localField: "_id",
          foreignField: "contentId",
          as: "history"
        }
      },
      { $project: { title: 1, views: { $size: "$history" } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    watchTime: watchTime.map((r) => ({ userId: String(r._id), _sum: { watchSeconds: r.watchSeconds } })),
    watched: watched.map((w) => ({ id: String(w._id), title: w.title, _count: { watchHistory: w.views } }))
  };
}
