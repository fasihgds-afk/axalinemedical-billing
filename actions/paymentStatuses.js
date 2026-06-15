"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { auth, canUserWrite } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listAllDevPaymentStatuses,
  createDevPaymentStatus,
  updateDevPaymentStatus,
  deleteDevPaymentStatus,
} from "@/lib/devPaymentStore";
import PaymentStatus from "@/models/PaymentStatus";
import Payment from "@/models/Payment";
import {
  parsePaymentStatusForm,
  formatZodErrors,
} from "@/lib/validations/paymentStatuses";

function serializeStatus(status) {
  return {
    _id: status._id.toString(),
    name: status.name,
    color: status.color,
    active: status.active,
    isDefault: Boolean(status.isDefault),
    sortOrder: status.sortOrder ?? 0,
    createdAt: status.createdAt?.toISOString?.() ?? status.createdAt,
    updatedAt: status.updatedAt?.toISOString?.() ?? status.updatedAt,
  };
}

async function requireWriteAccess() {
  const session = await auth();

  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }

  if (!canUserWrite(session.role)) {
    return {
      error: "You do not have permission to manage payment statuses",
      session: null,
    };
  }

  return { error: null, session };
}

export async function getPaymentStatuses() {
  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: listAllDevPaymentStatuses(),
        error: null,
      };
    }

    await connectDB();
    const statuses = await PaymentStatus.find().sort({ sortOrder: 1, name: 1 }).lean();

    return {
      success: true,
      data: statuses.map(serializeStatus),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load payment statuses",
    };
  }
}

export async function createPaymentStatusAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const parsed = parsePaymentStatusForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, color, sortOrder, active } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const duplicate = listAllDevPaymentStatuses().find(
        (status) => status.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (duplicate) {
        return { success: false, error: "A status with this name already exists" };
      }

      const status = createDevPaymentStatus({
        name: name.trim(),
        color: color.toUpperCase(),
        sortOrder,
        active,
      });

      revalidatePath("/settings/payment-statuses");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: status, error: null };
    }

    await connectDB();

    const status = await PaymentStatus.create({
      name: name.trim(),
      color: color.toUpperCase(),
      sortOrder: sortOrder ?? 0,
      active,
    });

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "PaymentStatus",
      entityId: status._id,
      changes: { name: status.name, color: status.color },
    });

    revalidatePath("/settings/payment-statuses");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return { success: true, data: serializeStatus(status.toObject()), error: null };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A status with this name already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to create payment status",
    };
  }
}

export async function updatePaymentStatusAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const statusId = formData.get("statusId");
  if (!statusId) return { success: false, error: "Payment status ID is required" };

  const parsed = parsePaymentStatusForm(formData);
  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, color, sortOrder, active } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const duplicate = listAllDevPaymentStatuses().find(
        (status) =>
          status._id !== statusId &&
          status.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (duplicate) {
        return { success: false, error: "A status with this name already exists" };
      }

      const status = updateDevPaymentStatus(statusId, {
        name: name.trim(),
        color: color.toUpperCase(),
        sortOrder,
        active,
      });

      if (!status) {
        return { success: false, error: "Payment status not found" };
      }

      revalidatePath("/settings/payment-statuses");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: status, error: null };
    }

    await connectDB();

    const existing = await PaymentStatus.findById(statusId);
    if (!existing) {
      return { success: false, error: "Payment status not found" };
    }

    existing.name = name.trim();
    existing.color = color.toUpperCase();
    existing.sortOrder = sortOrder ?? existing.sortOrder;
    existing.active = active;

    await existing.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "PaymentStatus",
      entityId: existing._id,
      changes: { name: existing.name, color: existing.color },
    });

    revalidatePath("/settings/payment-statuses");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeStatus(existing.toObject()),
      error: null,
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: "A status with this name already exists" };
    }

    return {
      success: false,
      error: error.message || "Failed to update payment status",
    };
  }
}

export async function deletePaymentStatusAction(statusId) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };
  if (!statusId) return { success: false, error: "Payment status ID is required" };

  try {
    if (isAuthWithoutDb()) {
      const result = deleteDevPaymentStatus(statusId);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      revalidatePath("/settings/payment-statuses");
      revalidatePath("/payments");
      revalidatePath("/dashboard");

      return { success: true, data: null, error: null };
    }

    await connectDB();

    const status = await PaymentStatus.findById(statusId);
    if (!status) {
      return { success: false, error: "Payment status not found" };
    }

    if (status.isDefault) {
      return { success: false, error: "Cannot delete a default payment status" };
    }

    const paymentCount = await Payment.countDocuments({ paymentStatusId: statusId });
    if (paymentCount > 0) {
      return {
        success: false,
        error: `Cannot delete status used by ${paymentCount} payment(s)`,
      };
    }

    await PaymentStatus.findByIdAndDelete(statusId);

    await writeAuditLog({
      userId: session.userId,
      action: "delete",
      entity: "PaymentStatus",
      entityId: statusId,
      changes: { name: status.name },
    });

    revalidatePath("/settings/payment-statuses");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return { success: true, data: null, error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to delete payment status",
    };
  }
}
