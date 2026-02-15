import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { removeDeviceSession } from "@/middleware/deviceLimit";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;

    if (decoded?.id && decoded?.deviceId) {
      await connectDB();
      const user = await User.findById(decoded.id);
      if (user) {
        removeDeviceSession(user, decoded.deviceId);
        await user.save();
      }
    }

    const res = NextResponse.json({ message: "Logout successful" });
    
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
