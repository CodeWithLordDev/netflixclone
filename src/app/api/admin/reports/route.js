import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import { apiError, apiOk, buildPagedResult, parsePagination } from "@/lib/api";
import { reportCreateSchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";

export async function GET(request) {
  const gate = await requirePermission(Permissions.REPORTS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "").trim();
    const q = (searchParams.get("q") || "").trim();
    const { page, limit, skip } = parsePagination(searchParams);

    const query = {};
    if (status) query.status = status;
    if (q) query.reason = { $regex: q, $options: "i" };

    const [total, items] = await Promise.all([
      Report.countDocuments(query),
      Report.find(query)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return apiOk(buildPagedResult(items, total, page, limit));
  } catch (error) {
    return apiError("Failed to fetch reports", 500, error.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.REPORTS_HANDLE);
  if (gate.error) return gate.error;

  try {
    const payload = await request.json();
    const parsed = reportCreateSchema.safeParse(payload);
    if (!parsed.success) return apiError("Invalid payload", 400, parsed.error.flatten());

    await connectDB();

    const item = await Report.create({
      ...parsed.data,
      createdBy: gate.session.user.id,
      status: "OPEN",
    });

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "REPORT_CREATED",
      entity: "Report",
      entityId: String(item._id),
      metadata: parsed.data,
    });

    return apiOk(item, 201);
  } catch (error) {
    return apiError("Failed to create report", 500, error.message);
  }
}
