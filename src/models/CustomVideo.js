import mongoose from "mongoose";

const CustomVideoSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    genre: String,
    thumbnail: String, // URL to thumbnail image
    videoUrl: {
      type: String,
      required: true, // URL or embedded video URL
    },
    duration: Number, // Duration in seconds
    releaseDate: Date,
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.CustomVideo || mongoose.model("CustomVideo", CustomVideoSchema);
