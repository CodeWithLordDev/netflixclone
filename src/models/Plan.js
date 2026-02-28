import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    duration: { type: Number, required: true, min: 1 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    videoQuality: { type: String, enum: ["SD", "HD", "FHD", "4K"], default: "HD" },
    maxDevices: { type: Number, required: true, min: 1, default: 1 },
    hasAds: { type: Boolean, default: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
