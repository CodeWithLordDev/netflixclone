import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VideoReport from "@/models/VideoReport";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";
import { videoReportSchema } from "@/lib/validators/platform";

export async function GET() {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.MODERATOR, Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const reports = await VideoReport.find({ status: "open" }).populate("videoId", "title").sort({ createdAt: -1 }).lean();
  return NextResponse.json(reports);
}

export async function POST(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = videoReportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const report = await VideoReport.create({
    videoId: parsed.data.videoId,
    reportedBy: session.user.id,
    reason: parsed.data.reason,
  });

  return NextResponse.json(report, { status: 201 });
}
