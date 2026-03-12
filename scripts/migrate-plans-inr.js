/**
 * One-time migration to update plan pricing to INR.
 * Usage: node scripts/migrate-plans-inr.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const PlanModel = require("./../src/models/Plan").default || mongoose.model("Plan");

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

async function migrate() {
  const updates = [
    { namePattern: /^free\b/i, billingCycle: "monthly", price: 0 },
    { namePattern: /^standard\b/i, billingCycle: "monthly", price: 299 },
    { namePattern: /^standard\b/i, billingCycle: "yearly", price: 999 },
  ];

  for (const item of updates) {
    const result = await PlanModel.updateMany(
      { name: { $regex: item.namePattern }, billingCycle: item.billingCycle },
      { $set: { price: item.price, currency: "INR" } }
    );
    const matched = result.matchedCount ?? result.n ?? 0;
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    console.log(
      `Updated ${modified}/${matched} plan(s) for ${item.namePattern} (${item.billingCycle})`
    );
  }
}

async function main() {
  try {
    await connectDB();
    await migrate();
    console.log("✓ Migration complete");
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
