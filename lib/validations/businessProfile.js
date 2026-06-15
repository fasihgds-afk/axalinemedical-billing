import { z } from "zod";

export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  website: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value) || /^[\w.-]+\.[a-z]{2,}/i.test(value),
      "Enter a valid website URL"
    ),
  logoUrl: z.string().optional().or(z.literal("")),
  logoKey: z.string().optional().or(z.literal("")),
});

export function parseBusinessProfileForm(formData) {
  return businessProfileSchema.safeParse({
    businessName: formData.get("businessName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
    website: formData.get("website") || "",
    logoUrl: formData.get("logoUrl") || "",
    logoKey: formData.get("logoKey") || "",
  });
}

export function formatZodErrors(error) {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);
  return messages[0] || "Validation failed";
}
