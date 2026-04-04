import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validators/platform";
import { sendPasswordResetOtp } from "@/lib/mailer";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export async function POST(req) {
  try {
    const payload = forgotPasswordSchema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json(
        { message: "Invalid email", errors: payload.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const email = payload.data.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+resetOtp +otpExpiry");

    if (!user) {
      return NextResponse.json({ message: "Email is not registered" }, { status: 404 });
    }

    const otp = generateOtp();
    user.resetOtp = hashOtp(otp);
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendPasswordResetOtp({ email: user.email, otp });

    return NextResponse.json({
      message: "An OTP has been sent to your email",
      email: user.email,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send OTP", error: error.message },
      { status: 500 }
    );
  }
}
