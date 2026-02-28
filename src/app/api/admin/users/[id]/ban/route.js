import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { logAudit } from "@/lib/audit";
import { fail, ok } from "@/lib/api/response";

export async function PATCH(request, { params }) {
  const gate = await requirePermission(Permissions.USERS_BAN);
  if (gate.error) return gate.error;

  try {
    const { id: rawId } = await params;
    const id = String(rawId || "").trim();
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_USER_ID", "Invalid user ID", 400);

    const body = await request.json();
    const action = body.action;
    if (!["ban", "unban"].includes(action)) return fail("INVALID_ACTION", "Action must be ban or unban", 400);

    await connectDB();

    const actorRole = gate.session.user.role;
    const user = await User.findById(id);
    if (!user) return fail("USER_NOT_FOUND", "User not found", 404);

    if (actorRole !== "superadmin" && ["admin", "superadmin"].includes(user.role)) {
      return fail("FORBIDDEN", "Admin cannot ban or unban admin/superadmin users", 403);
    }

    if (action === "ban") {
      user.isBanned = true;
      user.banReason = body.reason || "Policy violation";
      user.bannedBy = gate.session.user.id;
    } else {
      user.isBanned = false;
      user.banReason = null;
      user.bannedBy = null;
    }

    await user.save();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole,
      action: action === "ban" ? "USER_BANNED" : "USER_UNBANNED",
      entity: "User",
      entityId: id,
      metadata: { reason: user.banReason || "" },
    });

    return ok({
      id: String(user._id),
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.isBanned ? "banned" : user.isActive ? "active" : "inactive",
    });
  } catch (error) {
    return fail("USER_BAN_UPDATE_FAILED", "Failed to update ban status", 500, error?.message);
  }
}

