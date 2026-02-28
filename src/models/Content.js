import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },
    tags: [{ type: String }],
    contentType: { type: String, enum: ["MOVIE", "SERIES", "POST"], default: "POST" },
    status: { type: String, enum: ["DRAFT", "APPROVED", "REJECTED"], default: "DRAFT" },
    thumbnailUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

ContentSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
