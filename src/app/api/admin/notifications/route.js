import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
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

    if (!Types.ObjectId.isValid(parsed.data.userId)) {
      return apiError("Invalid user id", 400);
    }

    await connectDB();

    const item = await Notification.create(parsed.data);

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "NOTIFICATION_CREATED",
      entity: "Notification",
      entityId: String(item._id),
      metadata: { userId: parsed.data.userId, type: parsed.data.type },
    });

    return apiOk(item, 201);
  } catch (error) {
    return apiError("Failed to create notification", 500, error.message);
  }
}
