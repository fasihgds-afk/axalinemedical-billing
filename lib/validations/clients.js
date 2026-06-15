import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name is too long"),
  email: z
    .string()
    .refine(
      (value) =>
        !value ||
        value.trim() === "" ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      { message: "Please enter a valid email" }
    )
    .optional()
    .or(z.literal("")),
  phone: z.string().max(50, "Phone is too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address is too long").optional().or(z.literal("")),
  notes: z.string().max(2000, "Notes are too long").optional().or(z.literal("")),
});

export function parseClientForm(formData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
    notes: formData.get("notes") || "",
  });
}

export function formatZodErrors(error) {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);
  return messages[0] || "Validation failed";
}
