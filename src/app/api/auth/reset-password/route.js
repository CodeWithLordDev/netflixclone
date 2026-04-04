import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validators/platform";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export async function POST(req) {
  try {
    const payload = resetPasswordSchema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json(
        { message: "Invalid reset payload", errors: payload.error.flatten() },
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

    user.password = await bcrypt.hash(payload.data.password, 10);
    user.resetOtp = null;
    user.otpExpiry = null;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to reset password", error: error.message },
      { status: 500 }
    );
  }
}
