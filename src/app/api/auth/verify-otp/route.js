import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyOtpSchema } from "@/lib/validators/platform";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export async function POST(req) {
  try {
    const payload = verifyOtpSchema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json(
        { message: "Invalid OTP data", errors: payload.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const email = payload.data.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+resetOtp +otpExpiry");

    if (!user || !user.resetOtp || !user.otpExpiry) {
      return NextResponse.json({ message: "OTP not found" }, { status: 404 });
    }

    if (new Date(user.otpExpiry) < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    if (user.resetOtp !== hashOtp(payload.data.otp)) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to verify OTP", error: error.message },
      { status: 500 }
    );
  }
}
