import { NextResponse } from "next/server";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { getRolePermissions } from "@/lib/auth/permissions";

export async function GET() {
  const session = await getSessionFromJwt();
  return NextResponse.json({
    user: session?.user || null,
    permissions: session?.user ? getRolePermissions(session.user.role) : [],
  });
}
