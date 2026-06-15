"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { auth, isAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listDevUsers,
  createDevUser,
  updateDevUserRole,
  deactivateDevUser,
  countDevActiveAdmins,
} from "@/lib/devUserStore";
import User from "@/models/User";
import { ROLES } from "@/config/constants";
import {
  parseCreateUserForm,
  parseUpdateUserRoleInput,
  formatZodErrors,
} from "@/lib/validations/users";

const SALT_ROUNDS = 12;
const USERS_PATH = "/settings/users";

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active !== false,
    createdAt: user.createdAt?.toISOString?.() ?? user.createdAt,
    updatedAt: user.updatedAt?.toISOString?.() ?? user.updatedAt,
  };
}

async function requireAdminAccess() {
  const session = await auth();

  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }

  if (!isAdmin(session.role)) {
    return { error: "Only administrators can manage users", session: null };
  }

  return { error: null, session };
}

async function countActiveAdmins(excludeUserId = null) {
  const query = { role: ROLES.ADMIN, active: true };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  return User.countDocuments(query);
}

export async function getUsers() {
  const { error: authError } = await requireAdminAccess();
  if (authError) {
    return { success: false, data: null, error: authError };
  }

  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: listDevUsers(),
        error: null,
      };
    }

    await connectDB();
    const users = await User.find().sort({ name: 1 }).lean();

    return {
      success: true,
      data: users.map(serializeUser),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load users",
    };
  }
}

export async function createUserAction(prevState, formData) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };

  const parsed = parseCreateUserForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, email, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (isAuthWithoutDb()) {
      const result = createDevUser({ name, email: normalizedEmail, role });
      if (result.error) {
        return { success: false, error: result.error };
      }

      revalidatePath(USERS_PATH);
      return { success: true, error: null };
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      active: true,
    });

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "User",
      entityId: user._id,
      changes: { email: user.email, role: user.role, createdByAdmin: true },
    });

    revalidatePath(USERS_PATH);
    return { success: true, error: null };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A user with this email already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to create user",
    };
  }
}

export async function updateUserRoleAction(userId, role) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };

  const parsed = parseUpdateUserRoleInput(userId, role);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  if (session.userId === userId) {
    return { success: false, error: "You cannot change your own role" };
  }

  try {
    if (isAuthWithoutDb()) {
      const target = listDevUsers().find((user) => user._id === userId);
      if (!target) {
        return { success: false, error: "User not found" };
      }

      if (!target.active) {
        return { success: false, error: "Cannot change role for a deactivated user" };
      }

      if (target.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
        if (countDevActiveAdmins(userId) === 0) {
          return {
            success: false,
            error: "Cannot remove the last active administrator",
          };
        }
      }

      const result = updateDevUserRole(userId, role);
      if (result.error) {
        return { success: false, error: result.error };
      }

      revalidatePath(USERS_PATH);
      return { success: true, error: null };
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.active) {
      return { success: false, error: "Cannot change role for a deactivated user" };
    }

    if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const otherAdmins = await countActiveAdmins(user._id);
      if (otherAdmins === 0) {
        return {
          success: false,
          error: "Cannot remove the last active administrator",
        };
      }
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "User",
      entityId: user._id,
      changes: { role: { from: previousRole, to: role } },
    });

    revalidatePath(USERS_PATH);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update role",
    };
  }
}

export async function deactivateUserAction(userId) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };

  if (!userId) {
    return { success: false, error: "User is required" };
  }

  if (session.userId === userId) {
    return { success: false, error: "You cannot deactivate your own account" };
  }

  try {
    if (isAuthWithoutDb()) {
      const target = listDevUsers().find((user) => user._id === userId);
      if (!target) {
        return { success: false, error: "User not found" };
      }

      if (!target.active) {
        return { success: false, error: "User is already deactivated" };
      }

      if (target.role === ROLES.ADMIN && countDevActiveAdmins(userId) === 0) {
        return {
          success: false,
          error: "Cannot deactivate the last active administrator",
        };
      }

      const result = deactivateDevUser(userId);
      if (result.error) {
        return { success: false, error: result.error };
      }

      revalidatePath(USERS_PATH);
      return { success: true, error: null };
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.active) {
      return { success: false, error: "User is already deactivated" };
    }

    if (user.role === ROLES.ADMIN) {
      const otherAdmins = await countActiveAdmins(user._id);
      if (otherAdmins === 0) {
        return {
          success: false,
          error: "Cannot deactivate the last active administrator",
        };
      }
    }

    user.active = false;
    await user.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "User",
      entityId: user._id,
      changes: { active: { from: true, to: false } },
    });

    revalidatePath(USERS_PATH);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to deactivate user",
    };
  }
}
