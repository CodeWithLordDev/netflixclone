import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { verifyJwt, signAccessToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectDB();

    // 🔐 AUTH
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwt(token);
    if (!userData) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // 📦 READ BODY ONCE
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = await req.json();

    // 🔐 VERIFY RAZORPAY SIGNATURE
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 💾 SAVE PAYMENT
    await Payment.create({
      userId: userData.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount,
      currency: "INR",
      status: "success",
    });

    // 📆 1 MONTH EXPIRY
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // ⭐ UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      {
        plan: "premium",
        subscriptionExpiresAt: expiryDate,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🔐 CREATE NEW JWT - Pass entire user object
    const newToken = signAccessToken(updatedUser, { deviceId: userData.deviceId });

    const res = NextResponse.json({
      message: "Payment verified & subscription activated",
      expiresAt: expiryDate,
    });

    // 🍪 UPDATE COOKIE
    res.cookies.set("token", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR 👉", error);
    return NextResponse.json(
      { message: "Payment verification failed", error: error.message },
      { status: 500 }
    );
  }
}

