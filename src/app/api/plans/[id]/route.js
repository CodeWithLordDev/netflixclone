import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { planSchema } from "@/lib/validators/platform";

export async function PUT(request, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Only admin/superadmin can update plans" }, { status: 403 });
  }

  const parsed = planSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid plan payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const plan = await Plan.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

  await logAudit({ actorId: session.user.id, actorRole: role, action: "UPDATE_PLAN", entity: "Plan", entityId: String(plan._id) });

  return NextResponse.json(plan);
}

export async function DELETE(_, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (role !== Roles.SUPER_ADMIN) {
    return NextResponse.json({ message: "Only superadmin can delete plans" }, { status: 403 });
  }

  await connectDB();
  const deleted = await Plan.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

  await logAudit({ actorId: session.user.id, actorRole: role, action: "DELETE_PLAN", entity: "Plan", entityId: String(deleted._id) });

  return NextResponse.json({ message: "Plan deleted" });
}
