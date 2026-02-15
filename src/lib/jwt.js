import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (user, options = {}) => {
  const deviceId =
    typeof options.deviceId === "string" ? options.deviceId.trim() : undefined;

  return jwt.sign(
    {
      id: user._id.toString(), // ✅ Convert ObjectId to string
      email: user.email,
      plan: user.plan || "free",
      subscriptionExpiresAt: user.subscriptionExpiresAt || null,
      ...(deviceId ? { deviceId } : {}),
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
