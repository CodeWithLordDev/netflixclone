import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/guard";

export async function POST() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "streamflix/content";
  const params = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(params).digest("hex");

  return NextResponse.json({
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    signature
  });
}
