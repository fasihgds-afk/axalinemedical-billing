"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { auth, canUserWrite } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listDevPayments,
  getDevPaymentById,
  createDevPayment,
  updateDevPayment,
  deleteDevPayment,
  listDevPaymentMethods,
  listDevPaymentStatuses,
  listDevCustomFields,
  listAllDevCustomFields,
  listDevCustomFieldsForTable,
  listAllDevPaymentsForExport,
} from "@/lib/devPaymentStore";
import { listDevClients } from "@/lib/devStore";
import Payment from "@/models/Payment";
import PaymentMethod from "@/models/PaymentMethod";
import PaymentStatus from "@/models/PaymentStatus";
import CustomField from "@/models/CustomField";
import Client from "@/models/Client";
import {
  parsePaymentForm,
  parsePaymentFilters,
  formatZodErrors,
} from "@/lib/validations/payments";
import { buildCsv } from "@/lib/csv";
import { isUploadthingConfigured } from "@/lib/uploadthingEnv";

function serializePayment(payment) {
  const customFields =
    payment.customFields instanceof Map
      ? Object.fromEntries(payment.customFields)
      : payment.customFields || {};

  return {
    _id: payment._id.toString(),
    clientId: payment.clientId?._id?.toString?.() ?? payment.clientId?.toString?.() ?? payment.clientId,
    amount: payment.amount,
    paymentDate: payment.paymentDate?.toISOString?.() ?? payment.paymentDate,
    paymentMethodId:
      payment.paymentMethodId?._id?.toString?.() ??
      payment.paymentMethodId?.toString?.() ??
      payment.paymentMethodId,
    paymentStatusId:
      payment.paymentStatusId?._id?.toString?.() ??
      payment.paymentStatusId?.toString?.() ??
      payment.paymentStatusId,
    referenceNumber: payment.referenceNumber || "",
    notes: payment.notes || "",
    screenshot: payment.screenshot || null,
    customFields,
    createdAt: payment.createdAt?.toISOString?.() ?? payment.createdAt,
    updatedAt: payment.updatedAt?.toISOString?.() ?? payment.updatedAt,
    client: payment.clientId?.name
      ? { _id: payment.clientId._id?.toString?.() ?? payment.clientId, name: payment.clientId.name }
      : payment.client || null,
    method: payment.paymentMethodId?.name
      ? {
          _id: payment.paymentMethodId._id?.toString?.() ?? payment.paymentMethodId,
          name: payment.paymentMethodId.name,
        }
      : payment.method || null,
    status: payment.paymentStatusId?.name
      ? {
          _id: payment.paymentStatusId._id?.toString?.() ?? payment.paymentStatusId,
          name: payment.paymentStatusId.name,
          color: payment.paymentStatusId.color,
        }
      : payment.status || null,
  };
}

async function requireSession() {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }
  return { error: null, session };
}

async function requireWriteAccess() {
  const { session, error } = await requireSession();
  if (error) return { error, session: null };
  if (!canUserWrite(session.role)) {
    return { error: "You do not have permission to perform this action", session: null };
  }
  return { error: null, session };
}

async function getActiveCustomFields() {
  if (isAuthWithoutDb()) {
    return listDevCustomFields();
  }
  await connectDB();
  const fields = await CustomField.find({ active: true }).sort({ sortOrder: 1 }).lean();
  return fields.map((field) => ({ ...field, _id: field._id.toString() }));
}

async function deleteUploadThingFile(key) {
  if (!key || !isUploadthingConfigured()) return;

  try {
    const { UTApi } = await import("uploadthing/server");
    const utapi = new UTApi();
    await utapi.deleteFiles(key);
  } catch {
    // File deletion should not block payment operations
  }
}

export async function getPaymentFormOptions() {
  try {
    if (isAuthWithoutDb()) {
      return {
        success: true,
        data: {
          clients: listDevClients(),
          methods: listDevPaymentMethods(),
          statuses: listDevPaymentStatuses(),
          customFields: listDevCustomFields(),
          uploadEnabled: isUploadthingConfigured(),
        },
        error: null,
      };
    }

    await connectDB();

    const [clients, methods, statuses, customFields] = await Promise.all([
      Client.find().sort({ name: 1 }).lean(),
      PaymentMethod.find({ active: true }).sort({ name: 1 }).lean(),
      PaymentStatus.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      CustomField.find({ active: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    return {
      success: true,
      data: {
        clients: clients.map((c) => ({ _id: c._id.toString(), name: c.name })),
        methods: methods.map((m) => ({ _id: m._id.toString(), name: m.name })),
        statuses: statuses.map((s) => ({
          _id: s._id.toString(),
          name: s.name,
          color: s.color,
        })),
        customFields: customFields.map((f) => ({
          ...f,
          _id: f._id.toString(),
        })),
        uploadEnabled: isUploadthingConfigured(),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load form options",
    };
  }
}

export async function getPayments(filtersInput = {}) {
  const filters = typeof filtersInput === "object" ? filtersInput : {};

  try {
    if (isAuthWithoutDb()) {
      const { payments, total, page, limit } = listDevPayments(filters);
      const tableCustomFields = listDevCustomFieldsForTable();

      return {
        success: true,
        data: { payments, total, page, limit, tableCustomFields },
        error: null,
      };
    }

    await connectDB();

    const query = {};

    if (filters.clientId) query.clientId = filters.clientId;
    if (filters.paymentMethodId) query.paymentMethodId = filters.paymentMethodId;
    if (filters.paymentStatusId) query.paymentStatusId = filters.paymentStatusId;

    if (filters.dateFrom || filters.dateTo) {
      query.paymentDate = {};
      if (filters.dateFrom) query.paymentDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = to;
      }
    }

    if (filters.search?.trim()) {
      const searchRegex = { $regex: filters.search.trim(), $options: "i" };
      query.$or = [{ referenceNumber: searchRegex }, { notes: searchRegex }];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sortField = filters.sortBy || "paymentDate";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

    const [payments, total, tableCustomFields] = await Promise.all([
      Payment.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("clientId", "name")
        .populate("paymentMethodId", "name")
        .populate("paymentStatusId", "name color")
        .lean(),
      Payment.countDocuments(query),
      CustomField.find({ active: true, showInTable: true })
        .sort({ sortOrder: 1 })
        .lean(),
    ]);

    return {
      success: true,
      data: {
        payments: payments.map(serializePayment),
        total,
        page,
        limit,
        tableCustomFields: tableCustomFields.map((f) => ({
          ...f,
          _id: f._id.toString(),
        })),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load payments",
    };
  }
}

export async function getPaymentById(paymentId) {
  if (!paymentId) {
    return { success: false, data: null, error: "Payment ID is required" };
  }

  try {
    if (isAuthWithoutDb()) {
      const payment = getDevPaymentById(paymentId);
      if (!payment) {
        return { success: false, data: null, error: "Payment not found" };
      }
      return {
        success: true,
        data: { payment, customFields: listDevCustomFields() },
        error: null,
      };
    }

    await connectDB();

    const [payment, customFields] = await Promise.all([
      Payment.findById(paymentId)
        .populate("clientId", "name")
        .populate("paymentMethodId", "name")
        .populate("paymentStatusId", "name color")
        .lean(),
      CustomField.find({ active: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    if (!payment) {
      return { success: false, data: null, error: "Payment not found" };
    }

    return {
      success: true,
      data: {
        payment: serializePayment(payment),
        customFields: customFields.map((f) => ({ ...f, _id: f._id.toString() })),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load payment",
    };
  }
}

export async function createPaymentAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const customFields = await getActiveCustomFields();
  const parsed = parsePaymentForm(formData, customFields);

  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  try {
    if (isAuthWithoutDb()) {
      const payment = createDevPayment(parsed.data);
      revalidatePath("/payments");
      revalidatePath("/dashboard");
      revalidatePath(`/clients/${payment.clientId}`);
      redirect(`/payments/${payment._id}`);
    }

    await connectDB();

    const payment = await Payment.create({
      ...parsed.data,
      customFields: parsed.data.customFields,
      createdBy: session.userId,
    });

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "Payment",
      entityId: payment._id,
      changes: { amount: payment.amount, clientId: payment.clientId.toString() },
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${payment.clientId}`);
    redirect(`/payments/${payment._id.toString()}`);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to create payment" };
  }
}

export async function updatePaymentAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };

  const paymentId = formData.get("paymentId");
  if (!paymentId) return { success: false, error: "Payment ID is required" };

  const customFields = await getActiveCustomFields();
  const parsed = parsePaymentForm(formData, customFields);

  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  try {
    if (isAuthWithoutDb()) {
      const payment = updateDevPayment(paymentId, parsed.data);
      if (!payment) return { success: false, error: "Payment not found" };

      revalidatePath("/payments");
      revalidatePath(`/payments/${paymentId}`);
      revalidatePath("/dashboard");
      revalidatePath(`/clients/${payment.clientId}`);

      return { success: true, data: payment, error: null };
    }

    await connectDB();

    const existing = await Payment.findById(paymentId);
    if (!existing) return { success: false, error: "Payment not found" };

    const oldScreenshotKey = existing.screenshot?.key;

    existing.clientId = parsed.data.clientId;
    existing.amount = parsed.data.amount;
    existing.paymentDate = new Date(parsed.data.paymentDate);
    existing.paymentMethodId = parsed.data.paymentMethodId;
    existing.paymentStatusId = parsed.data.paymentStatusId;
    existing.referenceNumber = parsed.data.referenceNumber;
    existing.notes = parsed.data.notes;
    existing.customFields = parsed.data.customFields;

    if (parsed.data.screenshot) {
      if (oldScreenshotKey && oldScreenshotKey !== parsed.data.screenshot.key) {
        await deleteUploadThingFile(oldScreenshotKey);
      }
      existing.screenshot = parsed.data.screenshot;
    }

    await existing.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "Payment",
      entityId: existing._id,
      changes: { amount: existing.amount },
    });

    revalidatePath("/payments");
    revalidatePath(`/payments/${paymentId}`);
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${existing.clientId}`);

    return { success: true, data: serializePayment(existing.toObject()), error: null };
  } catch (error) {
    return { success: false, error: error.message || "Failed to update payment" };
  }
}

export async function deletePaymentAction(paymentId) {
  const { session, error: authError } = await requireWriteAccess();
  if (authError) return { success: false, error: authError };
  if (!paymentId) return { success: false, error: "Payment ID is required" };

  try {
    if (isAuthWithoutDb()) {
      const deleted = deleteDevPayment(paymentId);
      if (!deleted) return { success: false, error: "Payment not found" };

      revalidatePath("/payments");
      revalidatePath("/dashboard");
      revalidatePath(`/clients/${deleted.clientId}`);
      redirect("/payments");
    }

    await connectDB();

    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) return { success: false, error: "Payment not found" };

    if (payment.screenshot?.key) {
      await deleteUploadThingFile(payment.screenshot.key);
    }

    await writeAuditLog({
      userId: session.userId,
      action: "delete",
      entity: "Payment",
      entityId: paymentId,
      changes: { amount: payment.amount },
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${payment.clientId}`);
    redirect("/payments");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to delete payment" };
  }
}

export async function exportPaymentsCsv(filtersInput = {}) {
  const { error: authError } = await requireSession();
  if (authError) return { success: false, error: authError, data: null };

  try {
    let payments = [];
    let tableCustomFields = [];

    if (isAuthWithoutDb()) {
      payments = listAllDevPaymentsForExport(filtersInput);
      tableCustomFields = listDevCustomFieldsForTable();
    } else {
      await connectDB();
      const result = await getPayments({ ...filtersInput, page: 1, limit: 10000 });
      if (!result.success) {
        return { success: false, error: result.error, data: null };
      }
      payments = result.data.payments;
      tableCustomFields = result.data.tableCustomFields;
    }

    const headers = [
      "Date",
      "Client",
      "Amount",
      "Method",
      "Status",
      "Reference",
      "Notes",
      ...tableCustomFields.map((field) => field.label),
    ];

    const rows = payments.map((payment) => [
      payment.paymentDate?.slice?.(0, 10) ?? payment.paymentDate,
      payment.client?.name ?? "",
      payment.amount,
      payment.method?.name ?? "",
      payment.status?.name ?? "",
      payment.referenceNumber ?? "",
      payment.notes ?? "",
      ...tableCustomFields.map((field) => {
        const value = payment.customFields?.[field.key];
        if (value === true) return "Yes";
        if (value === false) return "No";
        return value ?? "";
      }),
    ]);

    const csv = buildCsv(headers, rows);

    return {
      success: true,
      data: csv,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to export payments",
    };
  }
}
