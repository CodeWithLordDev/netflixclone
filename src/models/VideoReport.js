import mongoose from "mongoose";

const VideoReportSchema = new mongoose.Schema(
  {
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open" }
  },
  { timestamps: true }
);

export default mongoose.models.VideoReport || mongoose.model("VideoReport", VideoReportSchema);
