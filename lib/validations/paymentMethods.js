import { z } from "zod";

export const paymentMethodSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  description: z.string().max(500).optional().or(z.literal("")),
  active: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
});

export function parsePaymentMethodForm(formData) {
  return paymentMethodSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
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
