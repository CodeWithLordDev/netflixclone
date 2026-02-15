import { connectDB } from "@/lib/mongodb";
import CustomVideo from "@/models/CustomVideo";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const videoId = searchParams.get("id");

    // Get specific video by ID
    if (videoId) {
      const video = await CustomVideo.findOne({ videoId });
      if (!video) {
        return Response.json(
          { error: "Video not found" },
          { status: 404 }
        );
      }
      // Increment views
      video.views += 1;
      await video.save();
      return Response.json(video);
    }

    // Search videos
    if (search) {
      const videos = await CustomVideo.find({
        isPublic: true,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
        ],
      }).sort({ createdAt: -1 });
      // console.log("🔍 Search query:", search, "Results:", videos.length);
      return Response.json(videos);
    }

    // Get all public videos - NO FILTER FIRST TO DEBUG
    // console.log("📺 Fetching all videos...");
    const allVideos = await CustomVideo.find({}).sort({ createdAt: -1 });
    // console.log("📺 All videos in DB:", allVideos.length);
    // console.log("📺 Videos data:", allVideos.map(v => ({ id: v._id, videoId: v.videoId, title: v.title, isPublic: v.isPublic })));
    
    const videos = await CustomVideo.find({ isPublic: true }).sort({ createdAt: -1 });
    // console.log("📺 Public videos (isPublic: true):", videos.length);
    return Response.json(videos);
  } catch (error) {
    console.error("Error fetching custom videos:", error);
    return Response.json(
      { error: "Failed to fetch videos", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { videoId, title, description, genre, thumbnail, videoUrl, duration, releaseDate, rating } = body;

    if (!videoId || !title || !videoUrl) {
      return Response.json(
        { error: "Missing required fields: videoId, title, videoUrl" },
        { status: 400 }
      );
    }

    // Check if videoId already exists
    const existing = await CustomVideo.findOne({ videoId });
    if (existing) {
      return Response.json(
        { error: "Video ID already exists" },
        { status: 409 }
      );
    }

    const newVideo = new CustomVideo({
      videoId,
      title,
      description,
      genre,
      thumbnail,
      videoUrl,
      duration,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      rating: rating || 0,
    });

    await newVideo.save();
    return Response.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating custom video:", error);
    return Response.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
