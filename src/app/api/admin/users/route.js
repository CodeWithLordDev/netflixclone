import { Types } from "mongoose";
import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { buildPagedResult, parsePagination } from "@/lib/api";
import { userStatusSchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";
import { fail, ok } from "@/lib/api/response";

export async function GET(request) {
  const gate = await requirePermission(Permissions.USERS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const role = (searchParams.get("role") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const { page, limit, skip } = parsePagination(searchParams);

    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (status === "active") {
      query.isActive = true;
      query.isBanned = false;
    }
    if (status === "inactive") query.isActive = false;
    if (status === "banned") query.isBanned = true;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select("_id name email role isActive isBanned plan lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return ok(
      buildPagedResult(
        users.map((user) => ({
          id: String(user._id),
          name: user.name || "",
          email: user.email,
          role: user.role,
          status: user.isBanned ? "banned" : user.isActive ? "active" : "inactive",
          plan: user.plan || "free",
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        })),
        total,
        page,
        limit
      )
    );
  } catch (error) {
    return fail("USERS_FETCH_FAILED", "Failed to fetch users", 500, error?.message);
  }
}

export async function PATCH(request) {
  const gate = await requirePermission(Permissions.USERS_MANAGE);
  if (gate.error) return gate.error;

  try {
    const payload = await request.json();
    const id = payload.id;

    if (!id || !Types.ObjectId.isValid(id)) {
      return fail("INVALID_USER_ID", "Invalid user id", 400);
    }

    const parsed = userStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid payload", 400, parsed.error.flatten());
    }

    await connectDB();

    const actorRole = gate.session.user.role;
    const target = await User.findById(id).select("_id role").lean();
    if (!target) {
      return fail("USER_NOT_FOUND", "User not found", 404);
    }

    const targetRole = target.role;
    const touchingPrivilegedUser = ["admin", "superadmin"].includes(targetRole);
    if (actorRole !== "superadmin" && touchingPrivilegedUser) {
      return fail("FORBIDDEN", "You cannot update admin/superadmin users", 403);
    }

    if (parsed.data.role && actorRole === "admin" && !["user", "moderator"].includes(parsed.data.role)) {
      return fail("FORBIDDEN_ROLE_ASSIGNMENT", "Admin can assign only user or moderator roles", 403);
    }

    const user = await User.findByIdAndUpdate(id, { $set: parsed.data }, { new: true })
      .select("_id name email role isActive isBanned")
      .lean();

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "USER_UPDATED",
      entity: "User",
      entityId: id,
      metadata: parsed.data,
    });

    return ok({
      id: String(user._id),
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.isBanned ? "banned" : user.isActive ? "active" : "inactive",
    });
  } catch (error) {
    return fail("USER_UPDATE_FAILED", "Failed to update user", 500, error?.message);
  }
}
