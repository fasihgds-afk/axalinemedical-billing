import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const paymentStatusSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  color: z
    .string()
    .refine((value) => hexColorRegex.test(value), {
      message: "Please enter a valid hex color (e.g. #1E67B5)",
    }),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  active: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
});

export function parsePaymentStatusForm(formData) {
  return paymentStatusSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    sortOrder: formData.get("sortOrder") || 0,
    active: formData.get("active"),
  });
}

export function formatZodErrors(error) {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);
  return messages[0] || "Validation failed";
}
