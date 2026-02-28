import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" }
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ userId: 1, expiresAt: 1 });

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
