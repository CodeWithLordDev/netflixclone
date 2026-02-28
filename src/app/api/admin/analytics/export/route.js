import { NextResponse } from "next/server";
import Papa from "papaparse";
import { requireAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { Roles } from "@/lib/auth/rbac";

export async function GET() {
  const gate = await requireAdmin([Roles.ADMIN, Roles.SUPER_ADMIN]);
  if (gate.error) return gate.error;

  await connectDB();

  const rows = await Payment.find().sort({ createdAt: -1 }).lean();

  const csv = Papa.unparse(
    rows.map((r) => ({
      id: String(r._id),
      amount: Number(r.amount || 0),
      currency: r.currency || "INR",
      status: r.status || "success",
      provider: "razorpay",
      paidAt: r.createdAt ? new Date(r.createdAt).toISOString() : ""
    }))
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=analytics.csv"
    }
  });
}
