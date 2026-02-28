import mongoose from "mongoose";

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "CANCELED", "EXPIRED", "TRIAL"], default: "ACTIVE" },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.UserSubscription || mongoose.model("UserSubscription", UserSubscriptionSchema);
