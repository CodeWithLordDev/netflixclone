import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import {
  downgradeExpiredPremium,
  enforceDeviceLimit,
  normalizeDeviceContext,
  upsertDeviceSession,
  validateDeviceId,
} from "@/middleware/deviceLimit";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const isLengthValid = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return isLengthValid && hasSpecialChar;
};

export async function POST(req) {
  try {
    const { email, password, deviceId } = await req.json();
    const deviceContext = normalizeDeviceContext({
      deviceId,
      userAgent: req.headers.get("user-agent"),
    });

    if (!email || !password || !deviceContext.deviceId) {
      return NextResponse.json(
        { message: "Email, password and deviceId are required" },
        { status: 400 }
      );
    }

    if (!validateDeviceId(deviceContext.deviceId)) {
      return NextResponse.json(
        { message: "Invalid device identifier" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long and contain at least one special character" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    downgradeExpiredPremium(user);

    const limitCheck = enforceDeviceLimit(user, deviceContext.deviceId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          message: limitCheck.error,
          code: "DEVICE_LIMIT_EXCEEDED",
          plan: user.plan,
          allowedDevices: limitCheck.deviceLimit,
          activeDevices: limitCheck.activeDevices,
        },
        { status: 403 }
      );
    }

    upsertDeviceSession(user, deviceContext);
    await user.save();

    const token = signToken(user, { deviceId: deviceContext.deviceId });

    const res = NextResponse.json({ message: "Signin success" });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("❌ Signin error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
