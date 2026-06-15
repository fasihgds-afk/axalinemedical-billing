/**
 * Reset admin password to match SEED_ADMIN_* in .env.local
 * Usage: node scripts/reset-admin-password.mjs
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SALT_ROUNDS = 12;

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const email = (process.env.SEED_ADMIN_EMAIL || "admin@axalinemedicalbilling.com")
  .toLowerCase()
  .trim();
const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: String,
  active: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Run: npm run seed");
    process.exit(1);
  }

  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  user.active = true;
  await user.save();

  console.log(`Password updated for: ${email}`);
  console.log("You can now sign in with SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD from .env.local");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
