/**
 * Seed database with default admin, payment methods, statuses, and business profile.
 *
 * Usage: npm run seed
 * Requires MONGODB_URI and seed vars in .env.local
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SALT_ROUNDS = 12;

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");

    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const ROLES = { ADMIN: "Admin", MANAGER: "Manager", VIEWER: "Viewer" };

const DEFAULT_PAYMENT_METHODS = [
  { name: "Zelle", description: "Zelle payment transfer", isDefault: true },
  { name: "Bank Transfer", description: "Direct bank transfer", isDefault: true },
];

const DEFAULT_PAYMENT_STATUSES = [
  { name: "Pending", color: "#808080", isDefault: true, sortOrder: 1 },
  { name: "Paid", color: "#1E67B5", isDefault: true, sortOrder: 2 },
  { name: "Partial", color: "#F59E0B", isDefault: true, sortOrder: 3 },
  { name: "Failed", color: "#FF3131", isDefault: true, sortOrder: 4 },
  { name: "Refunded", color: "#6366F1", isDefault: true, sortOrder: 5 },
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.VIEWER },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PaymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PaymentStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    color: { type: String, required: true, default: "#808080" },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BusinessProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Axaline Medical Billing" },
    logo: {
      url: { type: String, default: "" },
      key: { type: String, default: "" },
    },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const PaymentMethod =
  mongoose.models.PaymentMethod ||
  mongoose.model("PaymentMethod", PaymentMethodSchema);
const PaymentStatus =
  mongoose.models.PaymentStatus ||
  mongoose.model("PaymentStatus", PaymentStatusSchema);
const BusinessProfile =
  mongoose.models.BusinessProfile ||
  mongoose.model("BusinessProfile", BusinessProfileSchema);

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@axalinemedicalbilling.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME || "Axaline Admin";

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: ROLES.ADMIN,
    active: true,
  });

  console.log(`Created admin user: ${email}`);
  return admin;
}

async function seedPaymentMethods() {
  for (const method of DEFAULT_PAYMENT_METHODS) {
    const exists = await PaymentMethod.findOne({ name: method.name });

    if (!exists) {
      await PaymentMethod.create(method);
      console.log(`Created payment method: ${method.name}`);
    }
  }
}

async function seedPaymentStatuses() {
  for (const status of DEFAULT_PAYMENT_STATUSES) {
    const exists = await PaymentStatus.findOne({ name: status.name });

    if (!exists) {
      await PaymentStatus.create(status);
      console.log(`Created payment status: ${status.name}`);
    }
  }
}

async function seedBusinessProfile() {
  const count = await BusinessProfile.countDocuments();

  if (count > 0) {
    console.log("Business profile already exists");
    return;
  }

  await BusinessProfile.create({
    businessName: "Axaline Medical Billing",
    email: process.env.SEED_ADMIN_EMAIL || "",
  });

  console.log("Created business profile");
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected.\n");

  await seedAdmin();
  await seedPaymentMethods();
  await seedPaymentStatuses();
  await seedBusinessProfile();

  console.log("\nSeed completed successfully.");
  console.log(
    "Default admin login:",
    process.env.SEED_ADMIN_EMAIL || "admin@axalinemedicalbilling.com"
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
