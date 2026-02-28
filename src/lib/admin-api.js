/**
 * Admin API Utilities
 * Shared helpers for admin routes
 */

import { NextResponse } from "next/server";
import { getAuthUser } from "@/middleware/auth";
import { ROLE_HIERARCHY, hasPermission, ROLES } from "@/lib/rbac";
import { connectDB } from "@/lib/mongodb";

// Check if user is authenticated and has required role
export async function checkAdminAuth(minRole = ROLES.ADMIN) {
  try {
    const authResult = await getAuthUser();
    if (!authResult?.user) {
      return {
        error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      };
    }

    const { user } = authResult;

    // Check role hierarchy
    const userRank = ROLE_HIERARCHY[user.role] || 0;
    const minRank = ROLE_HIERARCHY[minRole] || 0;

    if (userRank < minRank) {
      return {
        error: NextResponse.json(
          { message: "Forbidden - Insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch (error) {
    return {
      error: NextResponse.json({ message: "Auth error" }, { status: 500 }),
    };
  }
}

// Check specific permission
export async function checkPermission(permission) {
  try {
    const authResult = await getAuthUser();
    if (!authResult?.user) {
      return {
        error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      };
    }

    const { user } = authResult;

    if (!hasPermission(user.role, permission)) {
      return {
        error: NextResponse.json(
          { message: "Forbidden - Permission denied" },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch (error) {
    return {
      error: NextResponse.json({ message: "Auth error" }, { status: 500 }),
    };
  }
}

// Success response
export function apiOk(data, status = 200) {
  return NextResponse.json(data, { status });
}

// Error response
export function apiError(message, status = 400, details = null) {
  return NextResponse.json(
    { message, ...(details && { details }) },
    { status }
  );
}

// Parse search params
export function parseParams(searchParams) {
  return {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    limit: Math.min(100, Number(searchParams.get("limit")) || 10),
    search: searchParams.get("search") || "",
    filter: searchParams.get("filter") || "",
  };
}

// Build paginated result
export function buildPaginatedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

// Log admin action
export async function logAdminAction(userId, action, entity, entityId, details = {}) {
  try {
    await connectDB();
    const AuditLog = (await import("@/models/AuditLog")).default;

    await AuditLog.create({
      actorId: userId,
      actorRole: (await (await import("@/models/User")).default.findById(userId))?.role,
      action,
      entity,
      entityId: entityId?.toString() || "",
      metadata: details,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
