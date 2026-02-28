import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { apiError, apiOk } from "@/lib/api";

export async function PATCH(request) {
  const gate = await requirePermission(Permissions.NOTIFICATIONS_VIEW);
  if (gate.error) return gate.error;

  try {
    const payload = await request.json();

    await connectDB();

    if (payload.all) {
      await Notification.updateMany({ userId: gate.session.user.id, readAt: null }, { $set: { readAt: new Date() } });
      return apiOk({ ok: true });
    }

    if (!payload.id) return apiError("Notification id required", 400);

    await Notification.updateOne({ _id: payload.id, userId: gate.session.user.id }, { $set: { readAt: new Date() } });
    return apiOk({ ok: true });
  } catch (error) {
    return apiError("Failed to update notification", 500, error.message);
  }
}
