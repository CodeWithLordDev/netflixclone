import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { Roles, normalizeRole } from "@/lib/auth/rbac";

export async function GET(request) {
  const session = await getSessionFromJwt();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (![Roles.MODERATOR, Roles.ADMIN, Roles.SUPER_ADMIN].includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const users = await User.find(
    q
      ? {
          $or: [
            { email: { $regex: q, $options: "i" } },
            { name: { $regex: q, $options: "i" } }
          ]
        }
      : {}
  )
    .select("name email role isBanned createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(users);
}
