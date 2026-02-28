import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ["BASIC", "STANDARD", "PREMIUM"], required: true },
    priceMonthly: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    maxDevices: { type: Number, required: true },
    resolution: { type: String, required: true },
    featureLimits: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan || mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
