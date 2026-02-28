import { z } from "zod";

export const contentSchema = z.object({
  title: z.string().min(2).max(180),
  slug: z.string().min(2).max(190),
  description: z.string().min(10),
  category: z.string().min(2).max(80).default("General"),
  tags: z.array(z.string().min(1).max(30)).default([]),
  contentType: z.enum(["MOVIE", "SERIES", "POST"]).default("POST"),
  status: z.enum(["DRAFT", "APPROVED", "REJECTED"]).default("DRAFT"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
});

export const userStatusSchema = z.object({
  role: z.enum(["user", "moderator", "admin", "superadmin"]).optional(),
  isBanned: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const reportCreateSchema = z.object({
  targetType: z.enum(["CONTENT", "USER"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export const reportUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "REJECTED"]).optional(),
  assignedTo: z.string().optional().or(z.literal("")),
  resolutionNote: z.string().max(500).optional().or(z.literal("")),
});

export const notifySchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(3).max(120),
  message: z.string().min(5).max(300),
  type: z.enum(["info", "warning", "success", "danger"]).default("info"),
  actionUrl: z.string().optional().or(z.literal("")),
});

export const subscriptionPlanSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  priceMonthly: z.number().positive(),
  durationDays: z.number().int().positive(),
  maxDevices: z.number().int().positive(),
  resolution: z.string().min(2),
});

export const settingsSchema = z.object({
  platformName: z.string().min(2),
  logoUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().min(2).max(120).optional().or(z.literal("")),
  seoDescription: z.string().min(2).max(300).optional().or(z.literal("")),
  stripePublicKey: z.string().optional().or(z.literal("")),
  stripeSecretKey: z.string().optional().or(z.literal("")),
  supportEmail: z.string().email().optional().or(z.literal("")),
});
