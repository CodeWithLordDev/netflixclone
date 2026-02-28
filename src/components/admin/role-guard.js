"use client";

import { hasPermission } from "@/lib/auth/permissions";

export default function RoleGuard({ role, permission, children, fallback = null }) {
  if (!permission) return children;
  return hasPermission(role, permission) ? children : fallback;
}
