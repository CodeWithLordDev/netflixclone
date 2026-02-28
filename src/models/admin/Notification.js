import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["PUSH", "EMAIL"], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.AdminNotification || mongoose.model("AdminNotification", NotificationSchema);
