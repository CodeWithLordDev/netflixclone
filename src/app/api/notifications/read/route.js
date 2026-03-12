import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

export async function POST(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { id, all } = await req.json().catch(() => ({}));
    await connectDB();

    if (all) {
      await Notification.updateMany({ userId: decoded.id, readAt: null }, { $set: { readAt: new Date() } });
    } else if (id) {
      await Notification.updateOne({ _id: id, userId: decoded.id }, { $set: { readAt: new Date() } });
    }

    const unread = await Notification.countDocuments({ userId: decoded.id, readAt: null });
    return NextResponse.json({ unread });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update notifications", error: error.message }, { status: 500 });
  }
}
