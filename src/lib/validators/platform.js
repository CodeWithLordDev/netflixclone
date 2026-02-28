import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const planSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  duration: z.number().int().positive(),
  videoQuality: z.enum(["SD", "HD", "FHD", "4K"]),
  maxDevices: z.number().int().positive(),
  hasAds: z.boolean(),
  isRecommended: z.boolean().optional(),
  billingCycle: z.enum(["monthly", "yearly"]).optional()
});

export const subscriptionSchema = z.object({
  planId: z.string().min(8),
  userId: z.string().optional(),
  transactionRef: z.string().optional()
});

export const videoSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(8),
  category: z.string().min(2),
  thumbnail: z.string().url(),
  videoUrl: z.string().url(),
  ageRating: z.enum(["U", "UA7+", "UA13+", "UA16+", "A"]).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional()
});

export const videoReportSchema = z.object({
  videoId: z.string().min(8),
  reason: z.string().min(3).max(500)
});

export const roleUpdateSchema = z.object({
  role: z.enum(["user", "moderator", "admin"]).or(z.enum(["USER", "MODERATOR", "ADMIN"]))
});

export const banSchema = z.object({
  isBanned: z.boolean()
});
