import mongoose from "mongoose";

const WatchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminContent", required: true },
    watchedAt: { type: Date, default: Date.now },
    watchSeconds: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.WatchHistory || mongoose.model("WatchHistory", WatchHistorySchema);
