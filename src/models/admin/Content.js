import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    contentType: { type: String, enum: ["MOVIE", "SERIES"], required: true },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    ageRating: { type: String, enum: ["G", "PG", "PG13", "R", "NC17"], required: true },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    releaseDate: Date,
    durationMinutes: Number,
    seasonsCount: Number,
    thumbnailUrl: String,
    bannerUrl: String,
    trailerUrl: String,
    videoUrl: String,
    cloudinaryPublicId: String,
    categoryNames: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.AdminContent || mongoose.model("AdminContent", ContentSchema);
