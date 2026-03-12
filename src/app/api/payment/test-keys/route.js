import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export const runtime = "nodejs";

const keyId = process.env.RAZORPAY_KEY_ID?.trim();
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

export async function POST(req) {
  try {
    if (!razorpay) {
      return NextResponse.json(
        { message: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwt(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const order = await razorpay.orders.create({
      amount: 100, // ₹1.00 (paise)
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: { purpose: "keys_test" },
    });

    return NextResponse.json({
      ok: true,
      message: "Razorpay keys are valid",
      order_id: order.id,
      amount: order.amount,
      key_id: keyId,
    });
  } catch (error) {
    console.error("RAZORPAY KEY TEST ERROR:", error);
    const razorpayAuthFailed =
      error?.statusCode === 401 ||
      error?.error?.description?.toLowerCase().includes("authentication failed");

    return NextResponse.json(
      {
        ok: false,
        message: razorpayAuthFailed
          ? "Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are a valid pair from the same mode (test/live)."
          : "Key test failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
