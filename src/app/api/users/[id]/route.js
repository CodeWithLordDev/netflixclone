import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";

export async function DELETE(_, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (role !== Roles.SUPER_ADMIN) {
    return NextResponse.json({ message: "Only superadmin can delete users" }, { status: 403 });
  }

  await connectDB();

  const target = await User.findById(params.id);
  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (String(target._id) === String(session.user.id)) {
    return NextResponse.json({ message: "Cannot delete self" }, { status: 400 });
  }

  await User.findByIdAndDelete(params.id);

  await logAudit({
    actorId: session.user.id,
    actorRole: role,
    action: "DELETE_USER",
    entity: "User",
    entityId: String(target._id)
  });

  return NextResponse.json({ message: "User deleted" });
}
