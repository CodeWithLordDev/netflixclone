import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { logAudit } from "@/lib/audit";
import { fail, ok } from "@/lib/api/response";

export async function PATCH(request, { params }) {
  const gate = await requirePermission(Permissions.ROLES_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id: rawId } = await params;
    const id = String(rawId || "").trim();
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_USER_ID", "Invalid user ID", 400);

    const body = await request.json();
    const role = String(body.role || "").toLowerCase();
    if (!["user", "moderator", "admin", "superadmin"].includes(role)) {
      return fail("INVALID_ROLE", "Invalid role", 400);
    }

    await connectDB();

    const actorRole = gate.session.user.role;
    const target = await User.findById(id).select("_id role name email");
    if (!target) return fail("USER_NOT_FOUND", "User not found", 404);

    if (actorRole === "admin") {
      if (!["user", "moderator"].includes(role)) {
        return fail("FORBIDDEN_ROLE_ASSIGNMENT", "Admin can assign only user or moderator roles", 403);
      }
      if (["admin", "superadmin"].includes(target.role)) {
        return fail("FORBIDDEN", "Admin cannot modify admin/superadmin users", 403);
      }
    }

    const oldRole = target.role;
    target.role = role;
    await target.save();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole,
      action: "USER_ROLE_UPDATED",
      entity: "User",
      entityId: id,
      metadata: { oldRole, newRole: role },
    });

    return ok({
      id: String(target._id),
      name: target.name || "",
      email: target.email,
      role: target.role,
    });
  } catch (error) {
    return fail("USER_ROLE_UPDATE_FAILED", "Failed to update user role", 500, error?.message);
  }
}

