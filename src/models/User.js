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
    myList: [
      {
        id: Number,
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
