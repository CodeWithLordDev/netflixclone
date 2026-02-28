import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { videoSchema } from "@/lib/validators/platform";

export async function PUT(request, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Only admin/superadmin can edit videos" }, { status: 403 });
  }

  const parsed = videoSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid video payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const updated = await Video.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!updated) return NextResponse.json({ message: "Video not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  await connectDB();

  if (role === Roles.MODERATOR) {
    const payload = await request.json().catch(() => ({}));
    const reason = payload?.reason || "Removed by moderator";

    const moderated = await Video.findByIdAndUpdate(
      params.id,
      { $set: { isRemovedByModerator: true, moderationReason: reason } },
      { new: true }
    );

    if (!moderated) return NextResponse.json({ message: "Video not found" }, { status: 404 });
    return NextResponse.json({ message: "Video removed by moderator", video: moderated });
  }

  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const deleted = await Video.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ message: "Video not found" }, { status: 404 });

  return NextResponse.json({ message: "Video deleted" });
}
