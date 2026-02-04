import User from "../models/user.model.js";

export const checkUserPlan = async (req, res, next) => {
  try {
    const userId = req.user.id; // assuming auth middleware already ran
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Check premium expiry
    if (
      user.plan === "premium" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) < new Date()
    ) {
      user.plan = "free";
      user.subscriptionExpiresAt = null;
      await user.save();
    }

    req.userPlan = user.plan;
    next();
  } catch (error) {
    res.status(500).json({ message: "Plan verification failed" });
  }
};
