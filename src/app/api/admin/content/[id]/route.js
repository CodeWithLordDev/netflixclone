import { Types } from "mongoose";
import { requireAnyPermission, requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/Content";
import { apiError, apiOk } from "@/lib/api";
import { contentSchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";

export async function PUT(request, { params }) {
  const gate = await requirePermission(Permissions.CONTENT_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return apiError("Invalid content id", 400);

    const payload = await request.json();
    const parsed = contentSchema.safeParse(payload);
    if (!parsed.success) return apiError("Invalid payload", 400, parsed.error.flatten());

    await connectDB();

    const updated = await Content.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "CONTENT_UPDATED",
      entity: "Content",
      entityId: id,
      metadata: { title: updated?.title, status: updated?.status },
    });

    return apiOk(updated);
  } catch (error) {
    return apiError("Failed to update content", 500, error.message);
  }
}

export async function PATCH(request, { params }) {
  const gate = await requireAnyPermission([Permissions.CONTENT_APPROVE, Permissions.CONTENT_MANAGE]);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return apiError("Invalid content id", 400);

    const payload = await request.json();
    const status = payload.status;

    if (!["DRAFT", "APPROVED", "REJECTED"].includes(status)) {
      return apiError("Invalid status", 400);
    }

    const update = { status };
    if (status === "APPROVED") {
      update.approvedBy = gate.session.user.id;
      update.approvedAt = new Date();
      update.rejectedAt = null;
      update.rejectionReason = "";
    }
    if (status === "REJECTED") {
      update.rejectedAt = new Date();
      update.rejectionReason = payload.rejectionReason || "Rejected by moderator";
    }

    await connectDB();
    const item = await Content.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "CONTENT_STATUS_UPDATED",
      entity: "Content",
      entityId: id,
      metadata: update,
    });

    return apiOk(item);
  } catch (error) {
    return apiError("Failed to update content status", 500, error.message);
  }
}

export async function DELETE(_, { params }) {
  const gate = await requirePermission(Permissions.CONTENT_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return apiError("Invalid content id", 400);

    await connectDB();
    await Content.findByIdAndDelete(id);

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "CONTENT_DELETED",
      entity: "Content",
      entityId: id,
    });

    return apiOk({ ok: true });
  } catch (error) {
    return apiError("Failed to delete content", 500, error.message);
  }
}
