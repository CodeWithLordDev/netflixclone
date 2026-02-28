import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RefreshToken from "@/models/RefreshToken";
import User from "@/models/User";
import { ACCESS_COOKIE, REFRESH_COOKIE, getCookieOptions, hashToken, signAccessToken, signRefreshToken, verifyJwt } from "@/lib/jwt";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token missing" }, { status: 401 });
    }

    const decoded = verifyJwt(refreshToken);
    if (!decoded?.id || decoded?.type !== "refresh") {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    await connectDB();

    const tokenHash = hashToken(refreshToken);
    const existing = await RefreshToken.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } });
    if (!existing) {
      return NextResponse.json({ message: "Refresh token expired" }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned || user.isActive === false) {
      return NextResponse.json({ message: "User invalid" }, { status: 401 });
    }

    existing.revokedAt = new Date();
    await existing.save();

    const nextAccess = signAccessToken(user);
    const nextRefresh = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(nextRefresh),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers.get("user-agent") || "",
      ip: req.headers.get("x-forwarded-for") || ""
    });

    const res = NextResponse.json({ message: "Token refreshed" });
    res.cookies.set(ACCESS_COOKIE, nextAccess, getCookieOptions(15 * 60));
    res.cookies.set("token", nextAccess, getCookieOptions(15 * 60));
    res.cookies.set(REFRESH_COOKIE, nextRefresh, getCookieOptions(7 * 24 * 60 * 60));

    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
