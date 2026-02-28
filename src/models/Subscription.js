import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    startDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    transactionRef: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    cancelledAt: { type: Date, default: null },
    cancelledReason: { type: String, default: "" },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, isActive: 1 });
SubscriptionSchema.index({ planId: 1 });
SubscriptionSchema.index({ expiryDate: 1 });

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
