import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["CONTENT", "USER"], required: true },
    targetId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "REJECTED"], default: "OPEN" },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    resolutionNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
