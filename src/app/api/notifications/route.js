import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

export async function GET(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    await connectDB();
    const items = await Notification.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(30).lean();
    const unread = await Notification.countDocuments({ userId: decoded.id, readAt: null });
    return NextResponse.json({ items, unread });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load notifications", error: error.message }, { status: 500 });
  }
}
