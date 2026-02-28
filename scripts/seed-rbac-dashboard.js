/* eslint-disable no-console */
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
  isBanned: Boolean,
}, { timestamps: true });

const ContentSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  description: String,
  category: String,
  contentType: String,
  status: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
  targetType: String,
  targetId: String,
  reason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: String,
  priority: String,
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  message: String,
  type: String,
  readAt: Date,
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorRole: String,
  action: String,
  entity: String,
  entityId: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

async function run() {
  await mongoose.connect(mongoUri);

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Content = mongoose.models.Content || mongoose.model("Content", ContentSchema);
  const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
  const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
  const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

  await Promise.all([
    User.deleteMany({ email: { $in: ["superadmin@saas.local", "admin@saas.local", "moderator@saas.local"] } }),
    Content.deleteMany({ slug: { $in: ["platform-roadmap-q1", "moderation-policy"] } }),
  ]);

  const password = await bcrypt.hash("Admin@12345", 10);

  const [superAdmin, admin, moderator] = await User.create([
    { name: "Super Admin", email: "superadmin@saas.local", password, role: "superadmin", isActive: true, isBanned: false },
    { name: "Admin User", email: "admin@saas.local", password, role: "admin", isActive: true, isBanned: false },
    { name: "Moderator User", email: "moderator@saas.local", password, role: "moderator", isActive: true, isBanned: false },
  ]);

  const [contentOne, contentTwo] = await Content.create([
    {
      title: "Platform Roadmap Q1",
      slug: "platform-roadmap-q1",
      description: "Quarterly roadmap summary and release milestones.",
      category: "Roadmap",
      contentType: "POST",
      status: "DRAFT",
      createdBy: admin._id,
    },
    {
      title: "Moderation Policy",
      slug: "moderation-policy",
      description: "Internal playbook for trust and safety operations.",
      category: "Policy",
      contentType: "POST",
      status: "APPROVED",
      createdBy: superAdmin._id,
    },
  ]);

  await Report.create([
    {
      targetType: "CONTENT",
      targetId: String(contentOne._id),
      reason: "Potential misinformation",
      createdBy: moderator._id,
      status: "OPEN",
      priority: "HIGH",
    },
  ]);

  await Notification.create([
    {
      userId: admin._id,
      title: "Welcome",
      message: "Dashboard seed data is ready.",
      type: "success",
      readAt: null,
    },
  ]);

  await AuditLog.create([
    {
      actorId: superAdmin._id,
      actorRole: "superadmin",
      action: "SEED_DATA_CREATED",
      entity: "System",
      entityId: "seed",
      metadata: { contentIds: [String(contentOne._id), String(contentTwo._id)] },
    },
  ]);

  console.log("Seed completed.");
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
