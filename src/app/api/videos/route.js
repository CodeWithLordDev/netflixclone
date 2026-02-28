import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { videoSchema } from "@/lib/validators/platform";

export async function GET() {
  await connectDB();
  const videos = await Video.find({ isRemovedByModerator: false }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(videos);
}

export async function POST(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Only admin/superadmin can upload videos" }, { status: 403 });
  }

  const parsed = videoSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid video payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const video = await Video.create({
    ...parsed.data,
    uploadedBy: session.user.id,
  });

  return NextResponse.json(video, { status: 201 });
}
