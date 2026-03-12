import mongoose from "mongoose";

const AdImpressionSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ad", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AdImpressionSchema.index({ adId: 1, createdAt: -1 });
AdImpressionSchema.index({ userId: 1, createdAt: -1 });
AdImpressionSchema.index({ createdAt: -1 });

export default mongoose.models.AdImpression || mongoose.model("AdImpression", AdImpressionSchema);
