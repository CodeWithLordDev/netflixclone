import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: true },
    videoUrl: { type: String, required: true },
    ageRating: { type: String, enum: ["U", "UA7+", "UA13+", "UA16+", "A"], default: "UA13+" },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isRemovedByModerator: { type: Boolean, default: false },
    moderationReason: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
