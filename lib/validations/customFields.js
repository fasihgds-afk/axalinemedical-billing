import { z } from "zod";
import { CUSTOM_FIELD_TYPES } from "@/config/constants";

const keyRegex = /^[a-z][a-z0-9_]*$/;

export const customFieldSchema = z.object({
  label: z
    .string()
    .min(2, "Label must be at least 2 characters")
    .max(100, "Label is too long"),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(50, "Key is too long")
    .regex(keyRegex, "Key must be lowercase letters, numbers, and underscores"),
  type: z.enum(CUSTOM_FIELD_TYPES, { message: "Invalid field type" }),
  required: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
  placeholder: z.string().max(200).optional().or(z.literal("")),
  options: z.string().optional().or(z.literal("")),
  showInTable: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
  active: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export function slugifyFieldKey(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[0-9]/, (match) => `field_${match}`);
}

export function parseOptionsInput(optionsText) {
  if (!optionsText?.trim()) return [];

  return optionsText
    .split(/[\n,]/)
    .map((option) => option.trim())
    .filter(Boolean);
}

export function parseCustomFieldForm(formData) {
  const parsed = customFieldSchema.safeParse({
    label: formData.get("label"),
    key: formData.get("key"),
    type: formData.get("type"),
    required: formData.get("required"),
    placeholder: formData.get("placeholder") || "",
    options: formData.get("options") || "",
    showInTable: formData.get("showInTable"),
    active: formData.get("active"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return parsed;
  }

  const options = parseOptionsInput(parsed.data.options);

  if (parsed.data.type === "Dropdown" && options.length === 0) {
    return {
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: {
            options: ["Dropdown fields need at least one option"],
          },
        }),
      },
    };
  }

  return {
    success: true,
    data: {
      label: parsed.data.label.trim(),
      key: parsed.data.key.trim().toLowerCase(),
      type: parsed.data.type,
      required: parsed.data.required,
      placeholder: parsed.data.placeholder?.trim() || "",
      options,
      showInTable: parsed.data.showInTable,
      active: parsed.data.active,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  };
}

export function formatZodErrors(error) {
  const fieldErrors = error.flatten().fieldErrors;
  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);
  return messages[0] || "Validation failed";
}
