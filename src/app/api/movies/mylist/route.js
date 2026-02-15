import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
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

    return NextResponse.json({
      myList: user.myList || [],
    });
  } catch (error) {
    console.error("❌ Get My List error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { movie } = await req.json();
    const movieIdentifier = movie?.id ?? movie?.videoId;
    if (!movie || movieIdentifier === undefined || movieIdentifier === null) {
      return NextResponse.json(
        { message: "Movie data is required" },
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

    // Check if movie already exists in list
    const exists = user.myList.some(
      (m) => String(m.id ?? m.videoId) === String(movieIdentifier)
    );
    if (exists) {
      return NextResponse.json(
        { message: "Movie already in list" },
        { status: 409 }
      );
    }

    const normalizedMovie = {
      ...movie,
      id: movie.id ?? movieIdentifier,
      videoId:
        movie.videoId ??
        (typeof movieIdentifier === "string" ? movieIdentifier : undefined),
      isCustom: Boolean(movie.isCustom || movie.videoId || movie.videoUrl),
    };

    // Add movie to list
    user.myList.push(normalizedMovie);
    await user.save();

    return NextResponse.json({
      message: "Movie added to list",
      myList: user.myList,
    });
  } catch (error) {
    console.error("❌ Add to My List error:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
