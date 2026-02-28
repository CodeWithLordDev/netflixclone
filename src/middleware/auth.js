import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ACCESS_COOKIE, REFRESH_COOKIE, hashToken, signAccessToken, signRefreshToken, verifyJwt } from "@/lib/jwt";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || cookieStore.get("token")?.value;

  if (accessToken) {
    const decoded = verifyJwt(accessToken);
    if (decoded?.id) {
      await connectDB();
      const user = await User.findById(decoded.id).select("_id name email role isBanned isActive").lean();
      if (user && user.isBanned !== true && user.isActive !== false) {
        return { user };
      }
    }
  }

  return null;
}

export async function rotateFromRefreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const decoded = verifyJwt(refreshToken);
  if (!decoded?.id || decoded?.type !== "refresh") return null;

  await connectDB();
  const hashed = hashToken(refreshToken);

  const existing = await RefreshToken.findOne({
    tokenHash: hashed,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!existing) return null;

  const user = await User.findById(decoded.id).select("_id email role isBanned isActive name");
  if (!user || user.isBanned || user.isActive === false) return null;

  existing.revokedAt = new Date();
  await existing.save();

  const nextAccess = signAccessToken(user);
  const nextRefresh = signRefreshToken(user);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(nextRefresh),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return {
    user,
    accessToken: nextAccess,
    refreshToken: nextRefresh,
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}
