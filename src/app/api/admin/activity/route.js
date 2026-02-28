import { requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { fail, ok, paged } from "@/lib/api/response";
import { paginationSchema } from "@/lib/api/validation";

export async function GET(request) {
  const gate = await requirePermission(Permissions.ACTIVITY_VIEW);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid pagination query", 400, parsed.error.flatten());
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id action entity createdAt actorRole metadata")
        .lean(),
    ]);

    return ok(
      paged(
        items.map((item) => ({
          id: String(item._id),
          type: item.action,
          actor: item.actorRole,
          target: item.entity,
          createdAt: item.createdAt,
          metadata: item.metadata || {},
        })),
        total,
        page,
        limit
      )
    );
  } catch (error) {
    return fail("ACTIVITY_FETCH_FAILED", "Failed to load activity", 500, error?.message);
  }
}
