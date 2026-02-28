import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/api/admin",
  "/api/users",
  "/api/plans",
  "/api/subscription",
  "/api/videos",
];

export function middleware(req) {
  const { nextUrl, cookies } = req;
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtectedRoute) return NextResponse.next();

  const token = cookies.get("accessToken")?.value || cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  try {
    const role = decodeRole(token);
    if (role) {
      const denied = isRoleDenied(nextUrl.pathname, role);
      if (denied) {
        if (nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }
  } catch {
    // keep middleware non-blocking for malformed tokens; API/page guards remain authoritative
  }

  return NextResponse.next();
}

function decodeRole(token) {
  const chunks = token.split(".");
  if (chunks.length < 2) return null;
  const payload = JSON.parse(atob(chunks[1].replace(/-/g, "+").replace(/_/g, "/")));
  return String(payload?.role || "").toLowerCase();
}

function isRoleDenied(pathname, role) {
  if (pathname.startsWith("/admin/logs") || pathname.startsWith("/admin/settings")) {
    return role !== "superadmin";
  }
  if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/subscriptions")) {
    return !["admin", "superadmin"].includes(role);
  }
  if (pathname.startsWith("/api/admin/plans") && !pathname.endsWith("/plans")) {
    return role !== "superadmin";
  }
  if (pathname.startsWith("/api/admin/users") || pathname.startsWith("/api/admin/subscriptions")) {
    return !["admin", "superadmin"].includes(role);
  }
  if (
    pathname.startsWith("/admin/content") ||
    pathname.startsWith("/admin/reports") ||
    pathname.startsWith("/admin/analytics")
  ) {
    return !["moderator", "admin", "superadmin"].includes(role);
  }
  return false;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/users/:path*",
    "/api/plans/:path*",
    "/api/subscription/:path*",
    "/api/videos/:path*",
  ]
};
