import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

export const ACCESS_EXPIRES_IN = "15m";
export const REFRESH_EXPIRES_IN = "7d";

export function normalizeRole(role) {
  const value = String(role || "user").trim().toLowerCase();
  if (value === "super_admin") return "superadmin";
  return value;
}

export function signAccessToken(user, extra = {}) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: normalizeRole(user.role),
      ...extra,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      type: "refresh",
      nonce: crypto.randomBytes(16).toString("hex"),
    },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Backward compatibility for existing routes still importing legacy names.
export function signToken(user, options = {}) {
  return signAccessToken(user, options);
}

export function verifyToken(token) {
  return verifyJwt(token);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
