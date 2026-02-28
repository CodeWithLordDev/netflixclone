import { Types } from "mongoose";
import { requireAnyPermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import { apiError, apiOk } from "@/lib/api";
import { reportUpdateSchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";

export async function PATCH(request, { params }) {
  const gate = await requireAnyPermission([Permissions.REPORTS_HANDLE, Permissions.REPORTS_ESCALATE]);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return apiError("Invalid report id", 400);

    const payload = await request.json();
    const parsed = reportUpdateSchema.safeParse(payload);
    if (!parsed.success) return apiError("Invalid payload", 400, parsed.error.flatten());

    const update = { ...parsed.data };
    if (update.status === "RESOLVED" && gate.session.user.role === "moderator") {
      return apiError("Only admin or superadmin can resolve reports", 403);
    }
    if (update.assignedTo && !Types.ObjectId.isValid(update.assignedTo)) {
      return apiError("Invalid assignee id", 400);
    }
    if (update.status === "RESOLVED") update.resolvedAt = new Date();

    await connectDB();

    const item = await Report.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "REPORT_UPDATED",
      entity: "Report",
      entityId: id,
      metadata: update,
    });

    return apiOk(item);
  } catch (error) {
    return apiError("Failed to update report", 500, error.message);
  }
}
