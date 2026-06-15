import { z } from "zod";

export const paymentSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0.01, "Amount must be greater than zero"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  paymentStatusId: z.string().min(1, "Payment status is required"),
  referenceNumber: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  screenshotUrl: z.string().optional().or(z.literal("")),
  screenshotKey: z.string().optional().or(z.literal("")),
});

export function parsePaymentForm(formData, customFields = []) {
  const base = {
    clientId: formData.get("clientId"),
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    paymentMethodId: formData.get("paymentMethodId"),
    paymentStatusId: formData.get("paymentStatusId"),
    referenceNumber: formData.get("referenceNumber") || "",
    notes: formData.get("notes") || "",
    screenshotUrl: formData.get("screenshotUrl") || "",
    screenshotKey: formData.get("screenshotKey") || "",
  };

  const parsed = paymentSchema.safeParse(base);

  if (!parsed.success) {
    return parsed;
  }

  const customFieldValues = {};

  for (const field of customFields) {
    const value = formData.get(`custom_${field.key}`);

    if (field.required && (value === null || value === "")) {
      return {
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              [`custom_${field.key}`]: [`${field.label} is required`],
            },
          }),
        },
      };
    }

    if (value !== null && value !== "") {
      if (field.type === "Number") {
        customFieldValues[field.key] = Number(value);
      } else if (field.type === "Boolean") {
        customFieldValues[field.key] = value === "true" || value === "on";
      } else {
        customFieldValues[field.key] = value;
      }
    }
  }

  const screenshot =
    parsed.data.screenshotUrl && parsed.data.screenshotKey
      ? { url: parsed.data.screenshotUrl, key: parsed.data.screenshotKey }
      : null;

  return {
    success: true,
    data: {
      clientId: parsed.data.clientId,
      amount: parsed.data.amount,
      paymentDate: new Date(parsed.data.paymentDate).toISOString(),
      paymentMethodId: parsed.data.paymentMethodId,
      paymentStatusId: parsed.data.paymentStatusId,
      referenceNumber: parsed.data.referenceNumber?.trim() || "",
      notes: parsed.data.notes?.trim() || "",
      screenshot,
      customFields: customFieldValues,
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

export function parsePaymentFilters(searchParams = {}) {
  return {
    search: searchParams.q || "",
    clientId: searchParams.clientId || "",
    paymentMethodId: searchParams.methodId || "",
    paymentStatusId: searchParams.statusId || "",
    dateFrom: searchParams.from || "",
    dateTo: searchParams.to || "",
    page: Math.max(1, parseInt(searchParams.page || "1", 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.limit || "20", 10) || 20)),
    sortBy: searchParams.sort || "paymentDate",
    sortOrder: searchParams.order === "asc" ? "asc" : "desc",
  };
}
