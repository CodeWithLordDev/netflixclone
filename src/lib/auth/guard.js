import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { Roles, authorize, forbidden, normalizeRole, unauthorized } from "@/lib/auth/rbac";
import { hasAnyPermission, hasPermission } from "@/lib/auth/permissions";

export async function getSessionFromJwt() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;
  if (!token) return null;

  const decoded = verifyJwt(token);
  if (!decoded?.id) return null;

  await connectDB();
  const user = await User.findById(decoded.id)
    .select("_id name email role plan isActive isBanned")
    .lean();

  if (!user || user.isActive === false || user.isBanned === true) return null;

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      plan: user.plan || "free",
    },
  };
}

export async function requireAdmin(roles = [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.MODERATOR]) {
  const session = await getSessionFromJwt();
  if (!session?.user) return { error: unauthorized() };
  if (!authorize(session, roles)) return { error: forbidden() };
  return { session };
}

export async function requirePermission(permission) {
  const session = await getSessionFromJwt();
  if (!session?.user) return { error: unauthorized() };
  if (!hasPermission(session.user.role, permission)) return { error: forbidden() };
  return { session };
}

export async function requireAnyPermission(permissions = []) {
  const session = await getSessionFromJwt();
  if (!session?.user) return { error: unauthorized() };
  if (!hasAnyPermission(session.user.role, permissions)) return { error: forbidden() };
  return { session };
}
