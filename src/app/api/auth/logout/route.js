import { NextResponse } from "next/server";
import { revokeRefreshToken } from "@/lib/auth-service";
import { ACCESS_COOKIE, REFRESH_COOKIE, getCookieOptions } from "@/lib/jwt";

export async function POST(req) {
  try {
    const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
    await revokeRefreshToken(refresh);

    const res = NextResponse.json({ message: "Logout successful" });
    res.cookies.set(ACCESS_COOKIE, "", getCookieOptions(0));
    res.cookies.set("token", "", getCookieOptions(0));
    res.cookies.set(REFRESH_COOKIE, "", getCookieOptions(0));
    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
