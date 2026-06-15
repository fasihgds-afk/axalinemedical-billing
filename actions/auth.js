"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  auth,
  buildSessionPayload,
  getSessionCookieConfig,
  signToken,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import {
  parseLoginForm,
  parseRegisterForm,
  formatZodErrors,
} from "@/lib/validations/auth";
import { ROLES, SESSION_COOKIE } from "@/config/constants";
import {
  isAuthWithoutDb,
  validateDevCredentials,
  buildDevSessionUser,
} from "@/lib/devAuth";

const SALT_ROUNDS = 12;

async function setSessionCookie(user) {
  const token = await signToken(buildSessionPayload(user));
  const cookieStore = await cookies();
  const cookieConfig = getSessionCookieConfig(token);

  cookieStore.set(cookieConfig.name, cookieConfig.value, {
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    path: cookieConfig.path,
    maxAge: cookieConfig.maxAge,
  });
}

function getSafeCallbackUrl(callbackUrl) {
  if (!callbackUrl || typeof callbackUrl !== "string") {
    return "/dashboard";
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  if (callbackUrl === "/login" || callbackUrl === "/register") {
    return "/dashboard";
  }

  return callbackUrl;
}

function getAuthErrorMessage(error) {
  const parts = [
    error?.message,
    error?.cause?.message,
    error?.name,
  ]
    .filter(Boolean)
    .join(" ");

  if (parts.includes("MONGODB_URI")) {
    return "Database is not configured. Check MONGODB_URI in .env.local.";
  }

  if (parts.includes("JWT_SECRET")) {
    return "JWT_SECRET is missing in .env.local. Add a long random secret and restart the dev server.";
  }

  if (
    parts.includes("ECONNREFUSED") ||
    parts.includes("querySrv") ||
    parts.includes("ETIMEOUT") ||
    parts.includes("ENOTFOUND") ||
    parts.includes("MongoServerSelectionError") ||
    parts.includes("Server selection timed out")
  ) {
    return (
      "Cannot reach MongoDB. Check your internet connection, Atlas IP allowlist (0.0.0.0/0 for testing), and MONGODB_URI in .env.local. Run: npm run check-auth"
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[loginAction]", error);
  }

  return "Something went wrong. Please try again.";
}

export async function loginAction(prevState, formData) {
  const parsed = parseLoginForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: formatZodErrors(parsed.error),
    };
  }

  const { email, password } = parsed.data;
  const callbackUrl = getSafeCallbackUrl(formData.get("callbackUrl"));

  if (isAuthWithoutDb()) {
    if (!validateDevCredentials(email, password)) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    try {
      await setSessionCookie(buildDevSessionUser());
      return { success: true, error: null, redirectTo: callbackUrl };
    } catch (error) {
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      };
    }
  }

  try {
    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    if (!user.active) {
      return {
        success: false,
        error: "Your account has been deactivated. Contact an administrator.",
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    await setSessionCookie(user);
    return { success: true, error: null, redirectTo: callbackUrl };
  } catch (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error),
    };
  }
}

export async function registerAction(prevState, formData) {
  const parsed = parseRegisterForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: formatZodErrors(parsed.error),
    };
  }

  const { name, email, password } = parsed.data;

  if (isAuthWithoutDb()) {
    if (!validateDevCredentials(email, password)) {
      return {
        success: false,
        error:
          "In demo mode, use the demo email and password shown on the login page.",
      };
    }

    try {
      await setSessionCookie(
        buildDevSessionUser({
          name: name.trim(),
          email: email.toLowerCase().trim(),
        })
      );
      return { success: true, error: null, redirectTo: "/dashboard" };
    } catch (error) {
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      };
    }
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? ROLES.ADMIN : ROLES.VIEWER;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      active: true,
    });

    await writeAuditLog({
      userId: user._id,
      action: "create",
      entity: "User",
      entityId: user._id,
      changes: {
        email: user.email,
        role: user.role,
        selfRegistration: true,
      },
    });

    await setSessionCookie(user);
    return { success: true, error: null, redirectTo: "/dashboard" };
  } catch (error) {
    if (error?.code === 11000) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    return {
      success: false,
      error: getAuthErrorMessage(error),
    };
  }
}

export async function logoutAction() {
  const session = await auth();
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);

  if (session?.userId && !isAuthWithoutDb()) {
    try {
      await writeAuditLog({
        userId: session.userId,
        action: "update",
        entity: "Session",
        entityId: session.userId,
        changes: { action: "logout" },
      });
    } catch {
      // Logout should succeed even if audit log fails
    }
  }

  return { success: true, redirectTo: "/login" };
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.userId) {
    return { success: false, data: null, error: "Not authenticated" };
  }

  if (isAuthWithoutDb()) {
    return {
      success: true,
      data: {
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      error: null,
    };
  }

  try {
    await connectDB();

    const user = await User.findById(session.userId).lean();

    if (!user || !user.active) {
      return { success: false, data: null, error: "User not found" };
    }

    return {
      success: true,
      data: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch user",
    };
  }
}
