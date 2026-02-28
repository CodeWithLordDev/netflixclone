import { requireAnyPermission, requirePermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/Content";
import { apiError, apiOk, buildPagedResult, parsePagination } from "@/lib/api";
import { contentSchema } from "@/lib/validators/admin";
import { logAudit } from "@/lib/audit";

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  const gate = await requireAnyPermission([Permissions.CONTENT_VIEW, Permissions.CONTENT_MANAGE]);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const { page, limit, skip } = parsePagination(searchParams);

    const query = {};
    if (q) {
      const safe = escapeRegex(q);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } },
      ];
    }
    if (status) query.status = status;

    const [total, items] = await Promise.all([
      Content.countDocuments(query),
      Content.find(query)
        .populate("createdBy", "name email role")
        .populate("approvedBy", "name email role")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return apiOk(buildPagedResult(items, total, page, limit));
  } catch (error) {
    return apiError("Failed to fetch content", 500, error.message);
  }
}

export async function POST(request) {
  const gate = await requirePermission(Permissions.CONTENT_MANAGE);
  if (gate.error) return gate.error;

  try {
    const payload = await request.json();
    const parsed = contentSchema.safeParse(payload);
    if (!parsed.success) {
      return apiError("Invalid payload", 400, parsed.error.flatten());
    }

    await connectDB();

    const content = await Content.create({
      ...parsed.data,
      createdBy: gate.session.user.id,
    });

    await logAudit({
      actorId: gate.session.user.id,
      actorRole: gate.session.user.role,
      action: "CONTENT_CREATED",
      entity: "Content",
      entityId: String(content._id),
      metadata: { title: content.title, status: content.status },
    });

    return apiOk(content, 201);
  } catch (error) {
    if (String(error.message || "").includes("duplicate key")) {
      return apiError("Slug already exists", 409);
    }
    return apiError("Failed to create content", 500, error.message);
  }
}
