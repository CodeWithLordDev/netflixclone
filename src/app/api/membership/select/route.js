import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken, signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectDB();
    
    console.log("📌 Membership select API called");

    // ✅ 1. GET TOKEN
    const token = req.cookies.get("token")?.value;
    if (!token) {
      console.log("❌ No token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    // ✅ 2. VERIFY TOKEN
    const userData = verifyToken(token);
    if (!userData) {
      console.log("❌ Invalid token");
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    console.log("✅ Token verified. User ID:", userData.id);

    // ✅ 3. READ BODY
    const body = await req.json();
    const { plan } = body;

    console.log("📋 Selected plan:", plan);

    // Validate plan
    if (!plan || !["free", "premium"].includes(plan)) {
      console.log("❌ Invalid plan:", plan);
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }

    // ✅ 4. FIND AND UPDATE USER
    console.log("🔍 Finding user with ID:", userData.id);
    
    const user = await User.findByIdAndUpdate(
      userData.id,
      {
        plan,
        subscriptionExpiresAt: plan === "free" ? null : undefined,
      },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found for ID:", userData.id);
      
      // Try to find user to debug
      const allUsers = await User.find({});
      console.log("📊 Total users in DB:", allUsers.length);
      console.log("📊 First user ID type:", typeof allUsers[0]?._id);
      console.log("📊 Searching for ID type:", typeof userData.id);
      
      return NextResponse.json({ 
        message: "User not found",
        debug: {
          searchedId: userData.id,
          totalUsers: allUsers.length
        }
      }, { status: 404 });
    }

    console.log("✅ User updated:", user.email, "Plan:", user.plan);

    // ✅ 5. SIGN NEW JWT
    const newToken = signToken(user);

    // ✅ 6. SEND RESPONSE WITH COOKIE
    const res = NextResponse.json({
      message: "Membership updated successfully",
      plan: user.plan,
    });

    res.cookies.set("token", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("❌ Membership error:", error);
    return NextResponse.json(
      { 
        message: "Membership update failed", 
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}