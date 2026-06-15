"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { auth, isAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listAllDevCustomFields,
  createDevCustomField,
  updateDevCustomField,
  deleteDevCustomField,
} from "@/lib/devPaymentStore";
import CustomField from "@/models/CustomField";
import {
  parseCustomFieldForm,
  formatZodErrors,
} from "@/lib/validations/customFields";

function serializeField(field) {
  return {
    _id: field._id.toString(),
    label: field.label,
    key: field.key,
    type: field.type,
    required: Boolean(field.required),
    placeholder: field.placeholder || "",
    options: field.options || [],
    showInTable: Boolean(field.showInTable),
    active: field.active !== false,
    sortOrder: field.sortOrder ?? 0,
    createdAt: field.createdAt?.toISOString?.() ?? field.createdAt,
    updatedAt: field.updatedAt?.toISOString?.() ?? field.updatedAt,
  };
}

async function requireAdminAccess() {
  const session = await auth();

  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }

  if (!isAdmin(session.role)) {
    return {
      error: "Only administrators can manage custom fields",
      session: null,
    };
  }

  return { error: null, session };
}

export async function getCustomFields() {
  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: listAllDevCustomFields(),
        error: null,
      };
    }

    await connectDB();
    const fields = await CustomField.find().sort({ sortOrder: 1, label: 1 }).lean();

    return {
      success: true,
      data: fields.map(serializeField),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load custom fields",
    };
  }
}

export async function createCustomFieldAction(prevState, formData) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };

  const parsed = parseCustomFieldForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  try {
    if (isAuthWithoutDb()) {
      const duplicate = listAllDevCustomFields().find(
        (field) => field.key === parsed.data.key
      );

      if (duplicate) {
        return { success: false, error: "A field with this key already exists" };
      }

      const field = createDevCustomField(parsed.data);

      revalidateCustomFieldPaths();

      return { success: true, data: field, error: null };
    }

    await connectDB();

    const field = await CustomField.create(parsed.data);

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "CustomField",
      entityId: field._id,
      changes: { label: field.label, key: field.key, type: field.type },
    });

    revalidateCustomFieldPaths();

    return { success: true, data: serializeField(field.toObject()), error: null };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A field with this key already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to create custom field",
    };
  }
}

export async function updateCustomFieldAction(prevState, formData) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };

  const fieldId = formData.get("fieldId");
  if (!fieldId) return { success: false, error: "Field ID is required" };

  const parsed = parseCustomFieldForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  try {
    if (isAuthWithoutDb()) {
      const field = updateDevCustomField(fieldId, parsed.data);

      if (!field) {
        return { success: false, error: "Custom field not found" };
      }

      revalidateCustomFieldPaths();

      return { success: true, data: field, error: null };
    }

    await connectDB();

    const existing = await CustomField.findById(fieldId);
    if (!existing) {
      return { success: false, error: "Custom field not found" };
    }

    existing.label = parsed.data.label;
    existing.type = parsed.data.type;
    existing.required = parsed.data.required;
    existing.placeholder = parsed.data.placeholder;
    existing.options = parsed.data.options;
    existing.showInTable = parsed.data.showInTable;
    existing.active = parsed.data.active;
    existing.sortOrder = parsed.data.sortOrder;

    await existing.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "CustomField",
      entityId: existing._id,
      changes: { label: existing.label, type: existing.type },
    });

    revalidateCustomFieldPaths();

    return {
      success: true,
      data: serializeField(existing.toObject()),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update custom field",
    };
  }
}

export async function deleteCustomFieldAction(fieldId) {
  const { session, error: authError } = await requireAdminAccess();
  if (authError) return { success: false, error: authError };
  if (!fieldId) return { success: false, error: "Field ID is required" };

  try {
    if (isAuthWithoutDb()) {
      const result = deleteDevCustomField(fieldId);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      revalidateCustomFieldPaths();

      return { success: true, data: null, error: null };
    }

    await connectDB();

    const field = await CustomField.findByIdAndDelete(fieldId);
    if (!field) {
      return { success: false, error: "Custom field not found" };
    }

    await writeAuditLog({
      userId: session.userId,
      action: "delete",
      entity: "CustomField",
      entityId: fieldId,
      changes: { label: field.label, key: field.key },
    });

    revalidateCustomFieldPaths();

    return { success: true, data: null, error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to delete custom field",
    };
  }
}

function revalidateCustomFieldPaths() {
  revalidatePath("/settings/custom-fields");
  revalidatePath("/payments");
  revalidatePath("/payments/new");
  revalidatePath("/dashboard");
}
