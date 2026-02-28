import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { banSchema } from "@/lib/validators/platform";

export async function PATCH(request, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.MODERATOR, Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const parsed = banSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { isBanned } = parsed.data;

  await connectDB();
  const target = await User.findById(params.id);
  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const targetRole = normalizeRole(target.role);
  if (role === Roles.MODERATOR && [Roles.ADMIN, Roles.SUPER_ADMIN].includes(targetRole)) {
    return NextResponse.json({ message: "Moderator cannot ban admin/superadmin" }, { status: 403 });
  }

  target.isBanned = isBanned;
  await target.save();

  await logAudit({
    actorId: session.user.id,
    actorRole: role,
    action: isBanned ? "BAN_USER" : "UNBAN_USER",
    entity: "User",
    entityId: String(target._id)
  });

  return NextResponse.json({ message: isBanned ? "User banned" : "User unbanned" });
}
