import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJwt } from "@/lib/jwt";

export async function DELETE(req, context) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { movieId } = await context.params;
    const normalizedMovieId =
      typeof movieId === "string" ? decodeURIComponent(movieId) : "";

    if (!normalizedMovieId) {
      return NextResponse.json(
        { message: "Movie ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize myList if it doesn't exist
    if (!user.myList) {
      user.myList = [];
    }

    // Remove movie from list (supports TMDB numeric IDs and custom string IDs)
    const targetId = String(normalizedMovieId);
    user.myList = user.myList.filter(
      (m) => String(m.id ?? m.videoId) !== targetId
    );
    await user.save();

    return NextResponse.json({
      message: "Movie removed from list",
      myList: user.myList,
    });
  } catch (error) {
    console.error("❌ Remove from My List error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

