import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/mongodb";
import PlatformSetting from "@/models/admin/PlatformSetting";
import { settingsSchema } from "@/lib/validators/admin";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  await connectDB();
  const settings = await PlatformSetting.findOne({ key: "platform" }).lean();
  return NextResponse.json(settings);
}

export async function PUT(request) {
  const gate = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (gate.error) return gate.error;

  const payload = await request.json();
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectDB();
  const settings = await PlatformSetting.findOneAndUpdate(
    { key: "platform" },
    { $set: parsed.data },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json(settings);
}
