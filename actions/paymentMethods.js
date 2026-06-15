"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { auth, canUserWrite } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listAllDevPaymentMethods,
  getDevPaymentMethodById,
  createDevPaymentMethod,
  updateDevPaymentMethod,
  deleteDevPaymentMethod,
  countDevPaymentsUsingMethod,
} from "@/lib/devPaymentStore";
import PaymentMethod from "@/models/PaymentMethod";
import Payment from "@/models/Payment";
import {
  parsePaymentMethodForm,
  formatZodErrors,
} from "@/lib/validations/paymentMethods";

function serializeMethod(method) {
  return {
    _id: method._id.toString(),
    name: method.name,
    description: method.description || "",
    active: method.active,
    isDefault: Boolean(method.isDefault),
    createdAt: method.createdAt?.toISOString?.() ?? method.createdAt,
    updatedAt: method.updatedAt?.toISOString?.() ?? method.updatedAt,
  };
}

async function requireWriteAccess() {
  const session = await auth();

  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }

  if (!canUserWrite(session.role)) {
    return {
      error: "You do not have permission to manage payment methods",
      session: null,
    };
  }

  return { error: null, session };
}

export async function getPaymentMethods() {
  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: listAllDevPaymentMethods(),
        error: null,
      };
    }

    await connectDB();
    const methods = await PaymentMethod.find().sort({ name: 1 }).lean();

    return {
      success: true,
      data: methods.map(serializeMethod),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load payment methods",
    };
  }
}

export async function createPaymentMethodAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const parsed = parsePaymentMethodForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, description, active } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const existing = listAllDevPaymentMethods().find(
        (method) => method.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (existing) {
        return { success: false, error: "A payment method with this name already exists" };
      }

      const method = createDevPaymentMethod({
        name: name.trim(),
        description: description?.trim() || "",
        active,
      });

      revalidatePath("/settings/payment-methods");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: method, error: null };
    }

    await connectDB();

    const method = await PaymentMethod.create({
      name: name.trim(),
      description: description?.trim() || "",
      active,
    });

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "PaymentMethod",
      entityId: method._id,
      changes: { name: method.name },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return { success: true, data: serializeMethod(method.toObject()), error: null };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A payment method with this name already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to create payment method",
    };
  }
}

export async function updatePaymentMethodAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const methodId = formData.get("methodId");
  if (!methodId) return { success: false, error: "Payment method ID is required" };

  const parsed = parsePaymentMethodForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, description, active } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const duplicate = listAllDevPaymentMethods().find(
        (method) =>
          method._id !== methodId &&
          method.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (duplicate) {
        return { success: false, error: "A payment method with this name already exists" };
      }

      const method = updateDevPaymentMethod(methodId, {
        name: name.trim(),
        description: description?.trim() || "",
        active,
      });

      if (!method) {
        return { success: false, error: "Payment method not found" };
      }

      revalidatePath("/settings/payment-methods");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: method, error: null };
    }

    await connectDB();

    const existing = await PaymentMethod.findById(methodId);
    if (!existing) {
      return { success: false, error: "Payment method not found" };
    }

    existing.name = name.trim();
    existing.description = description?.trim() || "";
    existing.active = active;

    await existing.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "PaymentMethod",
      entityId: existing._id,
      changes: { name: existing.name, active: existing.active },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeMethod(existing.toObject()),
      error: null,
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A payment method with this name already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to update payment method",
    };
  }
}

export async function deletePaymentMethodAction(methodId) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };
  if (!methodId) return { success: false, error: "Payment method ID is required" };

  try {
    if (isAuthWithoutDb()) {
      const result = deleteDevPaymentMethod(methodId);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      revalidatePath("/settings/payment-methods");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: null, error: null };
    }

    await connectDB();

    const method = await PaymentMethod.findById(methodId);
    if (!method) {
      return { success: false, error: "Payment method not found" };
    }

    if (method.isDefault) {
      return { success: false, error: "Cannot delete a default payment method" };
    }

    const paymentCount = await Payment.countDocuments({ paymentMethodId: methodId });
    if (paymentCount > 0) {
      return {
        success: false,
        error: `Cannot delete method used by ${paymentCount} payment(s)`,
      };
    }

    await PaymentMethod.findByIdAndDelete(methodId);

    await writeAuditLog({
      userId: session.userId,
      action: "delete",
      entity: "PaymentMethod",
      entityId: methodId,
      changes: { name: method.name },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return { success: true, data: null, error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to delete payment method",
    };
  }
}
