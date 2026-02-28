import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export const runtime = "nodejs";

const keyId = process.env.RAZORPAY_KEY_ID?.trim();
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

const razorpay = keyId && keySecret
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

    const { amount } = await req.json();
    const normalizedAmount = Number(amount);

    if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount. Send amount in paise as a positive integer." },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: normalizedAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      key_id: keyId,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    const razorpayAuthFailed =
      error?.statusCode === 401 ||
      error?.error?.description?.toLowerCase().includes("authentication failed");

    return NextResponse.json(
      {
        message: razorpayAuthFailed
          ? "Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are a valid pair from the same mode (test/live)."
          : "Order creation failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

