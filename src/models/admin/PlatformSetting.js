import mongoose from "mongoose";

const PlatformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "platform", unique: true },
    platformName: { type: String, default: "StreamFlix" },
    logoUrl: String,
    seoTitle: String,
    seoDescription: String,
    stripePublicKey: String,
    stripeSecretKey: String,
    supportEmail: String,
  },
  { timestamps: true }
);

export default mongoose.models.PlatformSetting || mongoose.model("PlatformSetting", PlatformSettingSchema);
