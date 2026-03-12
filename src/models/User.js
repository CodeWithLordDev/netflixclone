import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
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
    subscriptionPlan: {
      type: String,
      default: "",
    },
    subscriptionStatus: {
      type: String,
      default: "",
    },
    subscriptionStartDate: {
      type: Date,
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    billingCycle: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
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
    profiles: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ["kids", "personal", "family"], default: "personal" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    paymentMethods: [
      {
        brand: { type: String, default: "" },
        last4: { type: String, default: "" },
        expMonth: { type: Number, default: 0 },
        expYear: { type: Number, default: 0 },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
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
