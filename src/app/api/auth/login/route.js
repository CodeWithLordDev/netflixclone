import { NextResponse } from "next/server";
import { loginUser, issueAuthCookies } from "@/lib/auth-service";
import { normalizeRole } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators/platform";

export async function POST(req) {
  try {
    const payload = loginSchema.safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json({ message: "Invalid input", errors: payload.error.flatten() }, { status: 400 });
    }

    const { email, password } = payload.data;

    const loggedIn = await loginUser({ email, password });
    if (loggedIn.error) {
      return NextResponse.json({ message: loggedIn.error.message }, { status: loggedIn.error.status });
    }

    const role = normalizeRole(loggedIn.user.role);
    const redirectTo = role === "user" ? "/browse" : "/admin";

    const res = NextResponse.json({ message: "Login success", role, redirectTo });

    await issueAuthCookies(res, loggedIn.user, {
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || ""
    });

    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
