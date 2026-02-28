import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyJwt } from "@/lib/jwt";

export async function GET(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    const decoded = verifyJwt(access);
    if (!decoded?.id) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.id)
      .select("name email role plan subscriptionExpiresAt isActive isBanned createdAt");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
