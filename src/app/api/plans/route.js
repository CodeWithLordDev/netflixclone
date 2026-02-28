import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { planSchema } from "@/lib/validators/platform";

export async function GET() {
  await connectDB();
  const plans = await Plan.find().sort({ price: 1 }).lean();
  return NextResponse.json(plans);
}

export async function POST(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Only admin/superadmin can create plans" }, { status: 403 });
  }

  const parsed = planSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid plan payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const plan = await Plan.create({ ...parsed.data, createdBy: session.user.id });

  await logAudit({ actorId: session.user.id, actorRole: role, action: "CREATE_PLAN", entity: "Plan", entityId: String(plan._id) });

  return NextResponse.json(plan, { status: 201 });
}
