import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { ACCESS_COOKIE, REFRESH_COOKIE, getCookieOptions, hashToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import RefreshToken from "@/models/RefreshToken";
import User from "@/models/User";

export async function registerUser({ name, email, password }) {
  await connectDB();

  const exists = await User.findOne({ email });
  if (exists) {
    return { error: { status: 409, message: "User already exists" } };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name || email.split("@")[0],
    email,
    password: hashed,
    role: "user",
    isBanned: false,
    isActive: true,
  });

  return { user };
}

export async function loginUser({ email, password }) {
  await connectDB();
  const user = await User.findOne({ email });

  if (!user || !user.password) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  if (user.isBanned === true) {
    return { error: { status: 403, message: "Your account is banned" } };
  }

  if (user.isActive === false) {
    return { error: { status: 403, message: "Account is inactive" } };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: { status: 401, message: "Invalid credentials" } };
  }

  // Migrate legacy plaintext passwords to bcrypt hash on successful login.
  if (!String(user.password || "").startsWith("$2")) {
    user.password = await bcrypt.hash(password, 10);
  }

  // Normalize legacy uppercase role values (e.g., ADMIN -> admin) before save.
  const normalizedRole = normalizeLegacyRole(user.role);
  if (normalizedRole !== user.role) {
    user.role = normalizedRole;
  }

  user.lastLoginAt = new Date();
  await user.save();

  return { user };
}

export async function issueAuthCookies(res, user, requestMeta = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  try {
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: requestMeta.userAgent || "",
      ip: requestMeta.ip || "",
    });
  } catch (error) {
    // Do not block login on refresh-token persistence issues.
    console.error("Refresh token write failed:", error?.message || error);
  }

  res.cookies.set(ACCESS_COOKIE, accessToken, getCookieOptions(15 * 60));
  res.cookies.set("token", accessToken, getCookieOptions(15 * 60));
  res.cookies.set(REFRESH_COOKIE, refreshToken, getCookieOptions(7 * 24 * 60 * 60));

  return { accessToken, refreshToken };
}

async function verifyPassword(inputPassword, storedPassword) {
  const stored = String(storedPassword || "");
  if (!stored) return false;

  // Legacy accounts may still have plaintext passwords.
  if (!stored.startsWith("$2")) {
    return inputPassword === stored;
  }

  try {
    return await bcrypt.compare(inputPassword, stored);
  } catch {
    return false;
  }
}

function normalizeLegacyRole(role) {
  const value = String(role || "user").trim().toLowerCase();
  if (value === "super_admin") return "superadmin";
  if (["user", "moderator", "admin", "superadmin"].includes(value)) return value;
  return "user";
}

export async function revokeRefreshToken(token) {
  if (!token) return;
  await connectDB();
  await RefreshToken.updateOne(
    { tokenHash: hashToken(token), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
