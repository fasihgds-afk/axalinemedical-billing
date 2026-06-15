import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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

const email = (
  process.env.SEED_ADMIN_EMAIL || "admin@axalinemedicalbilling.com"
).toLowerCase();

async function main() {
  console.log("AUTH_WITHOUT_DB:", process.env.AUTH_WITHOUT_DB ?? "(not set)");
  console.log("MONGODB_URI set:", Boolean(process.env.MONGODB_URI));
  console.log("JWT_SECRET set:", Boolean(process.env.JWT_SECRET));

  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  console.log("Connecting...");
  const start = Date.now();

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected in ${Date.now() - start}ms`);

    const UserSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: false },
      active: Boolean,
    });
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error(`No admin user for ${email}. Run: npm run seed`);
      process.exit(1);
    }

    console.log("Admin user found:", email, "active:", user.active);
    const testPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const ok = await bcrypt.compare(testPassword, user.password);
    console.log("Password matches SEED_ADMIN_PASSWORD:", ok);
  } catch (err) {
    console.error("Error:", err.name, err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
