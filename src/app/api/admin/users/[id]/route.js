import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { logAudit } from "@/lib/audit";
import { fail, ok } from "@/lib/api/response";

export async function GET(_, { params }) {
  const gate = await requirePermission(Permissions.USERS_VIEW);
  if (gate.error) return gate.error;

  try {
    const { id: rawId } = await params;
    const id = String(rawId || "").trim();
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_USER_ID", "Invalid user ID", 400);

    await connectDB();

    const user = await User.findById(id).select("-password").lean();
    if (!user) return fail("USER_NOT_FOUND", "User not found", 404);

    const subscription = await Subscription.findOne({
      userId: id,
      isActive: true,
      expiryDate: { $gt: new Date() },
    })
      .populate("planId", "name price billingCycle")
      .lean();

    return ok({
      id: String(user._id),
      name: user.name || "",
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isBanned: user.isBanned,
      plan: user.plan || "free",
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      subscription: subscription || null,
    });
  } catch (error) {
    return fail("USER_FETCH_FAILED", "Failed to fetch user", 500, error?.message);
  }
}

export async function PATCH(request, { params }) {
  const gate = await requirePermission(Permissions.USERS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id: rawId } = await params;
    const id = String(rawId || "").trim();
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_USER_ID", "Invalid user ID", 400);

    const body = await request.json();
    const updates = {};
    if (body.name) updates.name = body.name;
    if (body.email) updates.email = body.email;

    await connectDB();

    const target = await User.findById(id).select("role email");
    if (!target) return fail("USER_NOT_FOUND", "User not found", 404);

    if (gate.session.user.role !== "superadmin" && ["admin", "superadmin"].includes(target.role)) {
      return fail("FORBIDDEN", "You cannot update admin/superadmin users", 403);
    }

    if (updates.email && updates.email !== target.email) {
      const exists = await User.findOne({ email: updates.email });
      if (exists) return fail("EMAIL_CONFLICT", "Email already in use", 409);
    }

    const updated = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password").lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "USER_UPDATED",
      entity: "User",
      entityId: id,
      metadata: updates,
    });

    return ok({
      id: String(updated._id),
      name: updated.name || "",
      email: updated.email,
      role: updated.role,
      status: updated.isBanned ? "banned" : updated.isActive ? "active" : "inactive",
    });
  } catch (error) {
    return fail("USER_UPDATE_FAILED", "Failed to update user", 500, error?.message);
  }
}

export async function DELETE(_, { params }) {
  const gate = await requirePermission(Permissions.ROLES_MANAGE);
  if (gate.error) return gate.error;

  try {
    const { id: rawId } = await params;
    const id = String(rawId || "").trim();
    if (!Types.ObjectId.isValid(id)) return fail("INVALID_USER_ID", "Invalid user ID", 400);

    await connectDB();
    const target = await User.findById(id);
    if (!target) return fail("USER_NOT_FOUND", "User not found", 404);

    if (target.role === "superadmin" && gate.session.user.role !== "superadmin") {
      return fail("FORBIDDEN", "Only superadmin can delete superadmin users", 403);
    }

    await User.findByIdAndDelete(id);

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "USER_DELETED",
      entity: "User",
      entityId: id,
      metadata: { email: target.email },
    });

    return ok({ deleted: true });
  } catch (error) {
    return fail("USER_DELETE_FAILED", "Failed to delete user", 500, error?.message);
  }
}

