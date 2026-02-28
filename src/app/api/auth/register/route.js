import { NextResponse } from "next/server";
import { registerUser, issueAuthCookies } from "@/lib/auth-service";
import { registerSchema } from "@/lib/validators/platform";

export async function POST(req) {
  try {
    const payload = registerSchema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json({ message: "Invalid input", errors: payload.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = payload.data;

    const created = await registerUser({ name, email, password });
    if (created.error) {
      return NextResponse.json({ message: created.error.message }, { status: created.error.status });
    }

    const res = NextResponse.json({
      message: "Register success",
      role: "user",
      redirectTo: "/subscription"
    });

    await issueAuthCookies(res, created.user, {
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || ""
    });

    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
