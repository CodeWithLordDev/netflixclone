import { connectDB } from "@/lib/mongodb";
import CustomVideo from "@/models/CustomVideo";

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return Response.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const result = await CustomVideo.findOneAndDelete({ videoId });

    if (!result) {
      return Response.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom video:", error);
    return Response.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
