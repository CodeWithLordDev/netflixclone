import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { apiError, apiOk, parsePagination, buildPagedResult } from "@/lib/api";

export async function GET(request) {
  const gate = await requirePermission(Permissions.LOGS_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return apiOk(buildPagedResult(logs, total, page, limit));
  } catch (error) {
    return apiError("Failed to fetch audit logs", 500, error.message);
  }
}
