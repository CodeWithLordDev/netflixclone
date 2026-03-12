import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

export async function GET(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    await connectDB();
    const items = await Payment.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load payment history", error: error.message }, { status: 500 });
  }
}
