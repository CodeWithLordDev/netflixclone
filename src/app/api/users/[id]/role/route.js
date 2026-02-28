import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";

const ALLOWED_TARGET_ROLES = [Roles.USER, Roles.MODERATOR, Roles.ADMIN];

export async function PATCH(request, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (role !== Roles.SUPER_ADMIN) {
    return NextResponse.json({ message: "Only superadmin can update roles" }, { status: 403 });
  }

  const { role: nextRole } = await request.json();
  const normalized = normalizeRole(nextRole);
  if (!ALLOWED_TARGET_ROLES.includes(normalized)) {
    return NextResponse.json({ message: "Invalid target role" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(params.id);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.role = normalized;
  await user.save();

  await logAudit({
    actorId: session.user.id,
    actorRole: role,
    action: "UPDATE_ROLE",
    entity: "User",
    entityId: String(user._id),
    metadata: { toRole: normalized }
  });

  return NextResponse.json({ message: "Role updated", role: normalized });
}
