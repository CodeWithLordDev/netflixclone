import mongoose from "mongoose";

const RevenueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    transactionRef: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    paymentMethod: { type: String, default: "card" },
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: "" },
  },
  { timestamps: true }
);

RevenueSchema.index({ userId: 1, createdAt: -1 });
RevenueSchema.index({ status: 1 });
RevenueSchema.index({ createdAt: -1 });

export default mongoose.models.Revenue || mongoose.model("Revenue", RevenueSchema);
