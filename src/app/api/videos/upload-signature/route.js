import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";

export async function POST() {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Only admin/superadmin can upload" }, { status: 403 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "streamflix/videos";
  const sigBase = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET || ""}`;
  const signature = crypto.createHash("sha1").update(sigBase).digest("hex");

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
