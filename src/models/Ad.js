import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    duration: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    targetPlan: { type: String, enum: ["free", "basic", "all"], default: "free" },
    revenuePerView: { type: Number, default: 0, min: 0 },
    totalViews: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

AdSchema.index({ status: 1 });
AdSchema.index({ createdAt: -1 });

export default mongoose.models.Ad || mongoose.model("Ad", AdSchema);
