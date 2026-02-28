/**
 * GET /api/admin/users
 * List all users with pagination, filtering, and search
 * Requires: admin role
 */

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { checkAdminAuth, apiOk, apiError, parseParams, buildPaginatedResult } from "@/lib/admin-api";
import { ROLES } from "@/lib/rbac";

export async function GET(request) {
  // Check auth
  const auth = await checkAdminAuth(ROLES.ADMIN);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parseParams(searchParams);
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && Object.values(ROLES).includes(role)) {
      query.role = role;
    }

    if (status === "active") {
      query.isActive = true;
      query.isBanned = false;
    } else if (status === "banned") {
      query.isBanned = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("_id name email role isActive isBanned plan subscriptionExpiresAt lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return apiOk(buildPaginatedResult(users, total, page, limit));
  } catch (error) {
    console.error("Error fetching users:", error);
    return apiError("Failed to fetch users", 500, error.message);
  }
}

/**
 * POST /api/admin/users
 * Create a new admin or moderator user
 * Requires: superadmin role
 */
export async function POST(request) {
  const auth = await checkAdminAuth(ROLES.SUPERADMIN);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password) {
      return apiError("Missing required fields", 400);
    }

    if (!["admin", "moderator"].includes(role)) {
      return apiError("Invalid role. Must be admin or moderator", 400);
    }

    await connectDB();

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return apiError("User already exists", 409);
    }

    // Hash password
    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      isBanned: false,
    });

    // Log action
    const { logAdminAction } = await import("@/lib/admin-api");
    await logAdminAction(auth.user._id, "CREATE_USER", "User", newUser._id, {
      name,
      email,
      role,
    });

    return apiOk(
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      201
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return apiError("Failed to create user", 500, error.message);
  }
}
