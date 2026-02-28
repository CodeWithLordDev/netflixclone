import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin", "superadmin"],
      default: "user",
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    activeSessions: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        userAgent: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastSeenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    myList: [
      {
        id: mongoose.Schema.Types.Mixed,
        videoId: String,
        isCustom: {
          type: Boolean,
          default: false,
        },
        title: String,
        backdrop_path: String,
        poster_path: String,
        overview: String,
        release_date: String,
        vote_average: Number,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
