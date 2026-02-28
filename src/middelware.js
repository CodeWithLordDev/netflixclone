import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
// In your server.js or routes file
import { checkUserPlan } from './middleware/CheckUserPlan.js';

// Apply to protected routes
export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // 🔒 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const user = verifyJwt(token);

    // 🧾 PREMIUM CONTENT PROTECTION
    if (pathname.startsWith("/browse/premium")) {
      if (user.plan !== "premium") {
        return NextResponse.redirect(new URL("/plans", req.url));
      }

      // ⏰ Subscription expired
      if (
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt) < new Date()
      ) {
        return NextResponse.redirect(new URL("/plans", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

export const config = {
  matcher: [
    "/browse/:path*",
    "/profile/:path*",
    "/browse/premium/:path*",
  ],
};

