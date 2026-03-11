import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    source: { type: String, default: "Custom" },
    type: { type: String, default: "CUSTOM" },
    status: { type: String, enum: ["PUBLIC", "PRIVATE"], default: "PUBLIC" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
