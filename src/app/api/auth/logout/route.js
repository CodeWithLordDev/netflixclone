import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const res = NextResponse.json({ message: "Logout successful" });
    
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
