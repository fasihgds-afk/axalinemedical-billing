import { z } from "zod";
import { ROLES } from "@/config/constants";

const roleValues = Object.values(ROLES);

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  role: z.enum(roleValues, { message: "Please select a valid role" }),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.enum(roleValues, { message: "Please select a valid role" }),
});

export function parseCreateUserForm(formData) {
  return createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
}

export function parseUpdateUserRoleInput(userId, role) {
  return updateUserRoleSchema.safeParse({ userId, role });
}

export function formatZodErrors(error) {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);
  return messages[0] || "Validation failed";
}
