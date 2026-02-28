/**
 * Seed script for Admin System
 * Populates database with test data for all roles
 * Usage: node scripts/seed-admin-system.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

// Import models
const UserModel = require("./../src/models/User").default || mongoose.model("User");
const PlanModel = require("./../src/models/Plan").default || mongoose.model("Plan");
const SubscriptionModel = require("./../src/models/Subscription").default || mongoose.model("Subscription");
const RevenueModel = require("./../src/models/Revenue").default || mongoose.model("Revenue");
const ReportModel = require("./../src/models/Report").default || mongoose.model("Report");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "authdb",
    });
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ Failed to connect:", error.message);
    process.exit(1);
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function seedUsers() {
  console.log("\n📝 Seeding users...");

  const users = [
    {
      name: "Super Admin User",
      email: "superadmin@example.com",
      password: await hashPassword("SuperAdmin@123"),
      role: "superadmin",
      isActive: true,
      isBanned: false,
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: await hashPassword("Admin@123"),
      role: "admin",
      isActive: true,
      isBanned: false,
    },
    {
      name: "Moderator User",
      email: "moderator@example.com",
      password: await hashPassword("Moderator@123"),
      role: "moderator",
      isActive: true,
      isBanned: false,
    },
  ];

  // Add regular users
  for (let i = 1; i <= 10; i++) {
    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: await hashPassword("User@123"),
      role: "user",
      isActive: i % 2 === 0, // Some inactive
      isBanned: i % 10 === 0, // One banned
    });
  }

  await UserModel.deleteMany({});
  const createdUsers = await UserModel.insertMany(users);
  console.log(`✓ Created ${createdUsers.length} users`);

  return createdUsers;
}

async function seedPlans(superAdmin) {
  console.log("\n📝 Seeding subscription plans...");

  const plans = [
    {
      name: "Free Plan",
      description: "Free tier with ads",
      price: 0,
      currency: "USD",
      duration: 30,
      billingCycle: "monthly",
      videoQuality: "SD",
      maxDevices: 1,
      hasAds: true,
      features: ["Watch on one device", "Standard definition", "Ad-supported"],
      isActive: true,
      isRecommended: false,
      displayOrder: 1,
      createdBy: superAdmin._id,
    },
    {
      name: "Basic Plan",
      description: "Affordable premium without ads",
      price: 9.99,
      currency: "USD",
      duration: 30,
      billingCycle: "monthly",
      videoQuality: "HD",
      maxDevices: 2,
      hasAds: false,
      features: ["HD streaming", "2 devices", "No ads", "Offline downloads"],
      isActive: true,
      isRecommended: false,
      displayOrder: 2,
      createdBy: superAdmin._id,
    },
    {
      name: "Standard Plan",
      description: "Most popular plan",
      price: 15.99,
      currency: "USD",
      duration: 30,
      billingCycle: "monthly",
      videoQuality: "FHD",
      maxDevices: 4,
      hasAds: false,
      features: ["Full HD streaming", "4 devices", "No ads", "Offline downloads", "HD profile"],
      isActive: true,
      isRecommended: true,
      displayOrder: 3,
      createdBy: superAdmin._id,
    },
    {
      name: "Premium Plan",
      description: "Ultimate experience",
      price: 22.99,
      currency: "USD",
      duration: 30,
      billingCycle: "monthly",
      videoQuality: "4K",
      maxDevices: 6,
      hasAds: false,
      features: ["4K streaming", "6 devices", "No ads", "Offline downloads", "Spatial audio"],
      isActive: true,
      isRecommended: false,
      displayOrder: 4,
      createdBy: superAdmin._id,
    },
  ];

  await PlanModel.deleteMany({});
  const createdPlans = await PlanModel.insertMany(plans);
  console.log(`✓ Created ${createdPlans.length} plans`);

  return createdPlans;
}

async function seedSubscriptions(users, plans) {
  console.log("\n📝 Seeding subscriptions...");

  const subscriptions = [];
  const now = new Date();

  // Create subscriptions for users
  for (let i = 3; i < users.length; i++) {
    const user = users[i];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const startDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    subscriptions.push({
      userId: user._id,
      planId: plan._id,
      startDate,
      expiryDate,
      isActive: expiryDate > now,
      autoRenew: Math.random() > 0.3,
      paymentStatus: "paid",
      transactionRef: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: plan.price,
      currency: "USD",
    });
  }

  await SubscriptionModel.deleteMany({});
  const createdSubs = await SubscriptionModel.insertMany(subscriptions);
  console.log(`✓ Created ${createdSubs.length} subscriptions`);

  return createdSubs;
}

async function seedRevenue(subscriptions, plans) {
  console.log("\n📝 Seeding revenue data...");

  const revenues = [];
  const now = new Date();

  for (const sub of subscriptions) {
    if (sub.paymentStatus === "paid") {
      const months = Math.floor(Math.random() * 3) + 1;
      
      for (let m = 0; m < months; m++) {
        const billingStart = new Date(sub.startDate);
        billingStart.setMonth(billingStart.getMonth() + m);

        revenues.push({
          userId: sub.userId,
          subscriptionId: sub._id,
          planId: sub.planId,
          amount: sub.amount,
          currency: "USD",
          transactionRef: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
          paymentMethod: "card",
          billingPeriod: {
            startDate: billingStart,
            endDate: new Date(billingStart.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  await RevenueModel.deleteMany({});
  const createdRevenue = await RevenueModel.insertMany(revenues);
  console.log(`✓ Created ${createdRevenue.length} revenue records`);

  return createdRevenue;
}

async function seedReports(users) {
  console.log("\n📝 Seeding reports...");

  const statuses = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
  const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const reasons = [
    "Inappropriate content",
    "Spam",
    "Copyright violation",
    "Harassment",
    "Misleading information",
  ];

  const reports = [];

  for (let i = 0; i < 15; i++) {
    const createdBy = users[Math.floor(Math.random() * users.length)];
    const assignedTo = users[Math.floor(Math.random() * Math.min(3, users.length))];

    reports.push({
      targetType: Math.random() > 0.5 ? "CONTENT" : "USER",
      targetId: new mongoose.Types.ObjectId().toString(),
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      description: `Sample report description ${i}`,
      createdBy: createdBy._id,
      assignedTo: assignedTo._id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      resolutionNote: Math.random() > 0.5 ? "Report resolved" : "",
    });
  }

  await ReportModel.deleteMany({});
  const createdReports = await ReportModel.insertMany(reports);
  console.log(`✓ Created ${createdReports.length} reports`);

  return createdReports;
}

async function main() {
  try {
    await connectDB();

    console.log("\n🌱 Starting Admin System Seed...\n");
    console.log("This will create:");
    console.log("  - 3 admin users (Super Admin, Admin, Moderator)");
    console.log("  - 10 regular users");
    console.log("  - 4 subscription plans");
    console.log("  - Subscriptions for all users");
    console.log("  - Revenue records");
    console.log("  - Sample reports");

    const users = await seedUsers();
    const superAdmin = users[0];
    const plans = await seedPlans(superAdmin);
    const subscriptions = await seedSubscriptions(users, plans);
    await seedRevenue(subscriptions, plans);
    await seedReports(users);

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📧 Test Login Credentials:");
    console.log("  Super Admin: superadmin@example.com / SuperAdmin@123");
    console.log("  Admin: admin@example.com / Admin@123");
    console.log("  Moderator: moderator@example.com / Moderator@123");
    console.log("  Regular User: user1@example.com / User@123");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Seed failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
