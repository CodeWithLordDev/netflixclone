import { NextResponse } from "next/server";

export const Roles = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user"
};

export function normalizeRole(role) {
  const value = String(role || Roles.USER).trim().toLowerCase();
  if (value === "super_admin") return Roles.SUPER_ADMIN;
  if (value === "superadmin") return Roles.SUPER_ADMIN;
  if (value === "admin") return Roles.ADMIN;
  if (value === "moderator") return Roles.MODERATOR;
  return Roles.USER;
}

export function authorize(session, allowedRoles = []) {
  if (!session?.user) return false;
  if (!allowedRoles.length) return true;
  const role = normalizeRole(session.user.role);
  return allowedRoles.map(normalizeRole).includes(role);
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
