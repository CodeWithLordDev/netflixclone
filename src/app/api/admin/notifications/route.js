import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { apiError, apiOk } from "@/lib/api";
import { notifySchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";

export async function GET(request) {
  const gate = await requirePermission(Permissions.NOTIFICATIONS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "mine";

    const query = mode === "all" ? {} : { userId: gate.session.user.id };
    const list = await Notification.find(query).sort({ createdAt: -1 }).limit(30).lean();
    const unread = await Notification.countDocuments({ ...query, readAt: null });

    return apiOk({ items: list, unread });
  } catch (error) {
    return apiError("Failed to fetch notifications", 500, error.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.NOTIFICATIONS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const payload = await request.json();
    const parsed = notifySchema.safeParse(payload);
    if (!parsed.success) return apiError("Invalid payload", 400, parsed.error.flatten());

    await connectDB();
    const { audience, userId, title, message, type, actionUrl } = parsed.data;

    if (audience === "all" || !userId) {
      const users = await User.find({}).select("_id").lean();
      const payload = users.map((u) => ({
        userId: u._id,
        title,
        message,
        type,
        actionUrl,
        meta: { audience: "all" },
      }));

      if (payload.length) {
        await Notification.insertMany(payload, { ordered: false });
      }

      await logAudit({
        actorId: gate.session.user.id,
        actorRole: gate.session.user.role,
        action: "NOTIFICATION_CREATED",
        entity: "Notification",
        entityId: "ALL_USERS",
        metadata: { audience: "all", type },
      });

      return apiOk({ sent: payload.length }, 201);
    }

    if (!Types.ObjectId.isValid(userId)) {
      return apiError("Invalid user id", 400);
    }

    const item = await Notification.create({
      userId,
      title,
      message,
      type,
      actionUrl,
      meta: { audience: "user" },
    });

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "NOTIFICATION_CREATED",
      entity: "Notification",
      entityId: String(item._id),
      metadata: { userId, type },
    });

    return apiOk(item, 201);
  } catch (error) {
    return apiError("Failed to create notification", 500, error.message);
  }
}
