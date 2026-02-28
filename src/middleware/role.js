import { NextResponse } from "next/server";

export const ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
};

export function roleRank(role) {
  const value = String(role || "user").toLowerCase();
  if (value === ROLES.SUPERADMIN) return 4;
  if (value === ROLES.ADMIN) return 3;
  if (value === ROLES.MODERATOR) return 2;
  return 1;
}

export function requireRole(auth, minRole = ROLES.USER) {
  if (!auth?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const has = roleRank(auth.user.role);
  const needs = roleRank(minRole);

  if (has < needs) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}
