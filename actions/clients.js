"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { auth, canUserWrite } from "@/lib/auth";
import { writeAuditLog } from "@/lib/auditLog";
import { isAuthWithoutDb } from "@/lib/devAuth";
import {
  listDevClients,
  getDevClientById,
  createDevClient,
  updateDevClient,
  deleteDevClient,
  getDevClientPayments,
} from "@/lib/devStore";
import Client from "@/models/Client";
import Payment from "@/models/Payment";
import { parseClientForm, formatZodErrors } from "@/lib/validations/clients";

function serializeClient(client) {
  return {
    _id: client._id.toString(),
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
    createdAt: client.createdAt?.toISOString?.() ?? client.createdAt,
    updatedAt: client.updatedAt?.toISOString?.() ?? client.updatedAt,
  };
}

function serializePayment(payment) {
  return {
    _id: payment._id.toString(),
    amount: payment.amount,
    paymentDate: payment.paymentDate?.toISOString?.() ?? payment.paymentDate,
    referenceNumber: payment.referenceNumber || "",
    status: payment.paymentStatusId
      ? {
          name: payment.paymentStatusId.name,
          color: payment.paymentStatusId.color,
        }
      : null,
    method: payment.paymentMethodId
      ? { name: payment.paymentMethodId.name }
      : null,
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

  if (error) {
    return { error, session: null };
  }

  if (!canUserWrite(session.role)) {
    return { error: "You do not have permission to perform this action", session: null };
  }

  return { error: null, session };
}

export async function getClients({ search = "" } = {}) {
  try {
    if (isAuthWithoutDb()) {
      const clients = listDevClients({ search });
      return {
        success: true,
        data: { clients, total: clients.length },
        error: null,
      };
    }

    await connectDB();

    const filter = {};

    if (search?.trim()) {
      const query = search.trim();
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
      ];
    }

    const clients = await Client.find(filter).sort({ name: 1 }).lean();

    return {
      success: true,
      data: {
        clients: clients.map(serializeClient),
        total: clients.length,
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load clients",
    };
  }
}

export async function getClientById(clientId) {
  if (!clientId) {
    return { success: false, data: null, error: "Client ID is required" };
  }

  try {
    if (isAuthWithoutDb()) {
      const client = getDevClientById(clientId);

      if (!client) {
        return { success: false, data: null, error: "Client not found" };
      }

      return {
        success: true,
        data: {
          client,
          payments: getDevClientPayments(),
        },
        error: null,
      };
    }

    await connectDB();

    const client = await Client.findById(clientId).lean();

    if (!client) {
      return { success: false, data: null, error: "Client not found" };
    }

    const payments = await Payment.find({ clientId })
      .sort({ paymentDate: -1 })
      .limit(20)
      .populate("paymentMethodId", "name")
      .populate("paymentStatusId", "name color")
      .lean();

    return {
      success: true,
      data: {
        client: serializeClient(client),
        payments: payments.map(serializePayment),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load client",
    };
  }
}

export async function createClientAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();

  if (authError) {
    return { success: false, error: authError };
  }

  const parsed = parseClientForm(formData);

  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, email, phone, address, notes } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const client = createDevClient({
        name: name.trim(),
        email: email?.trim().toLowerCase() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        notes: notes?.trim() || "",
      });

      revalidatePath("/clients");
      revalidatePath("/dashboard");
      redirect(`/clients/${client._id}`);
    }

    await connectDB();

    const client = await Client.create({
      name: name.trim(),
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      notes: notes?.trim() || "",
      createdBy: session.userId,
    });

    await writeAuditLog({
      userId: session.userId,
      action: "create",
      entity: "Client",
      entityId: client._id,
      changes: { name: client.name, email: client.email },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    redirect(`/clients/${client._id.toString()}`);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: error.message || "Failed to create client",
    };
  }
}

export async function updateClientAction(prevState, formData) {
  const { session, error: authError } = await requireWriteAccess();

  if (authError) {
    return { success: false, error: authError };
  }

  const clientId = formData.get("clientId");

  if (!clientId) {
    return { success: false, error: "Client ID is required" };
  }

  const parsed = parseClientForm(formData);

  if (!parsed.success) {
    return { success: false, error: formatZodErrors(parsed.error) };
  }

  const { name, email, phone, address, notes } = parsed.data;

  try {
    if (isAuthWithoutDb()) {
      const client = updateDevClient(clientId, {
        name: name.trim(),
        email: email?.trim().toLowerCase() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        notes: notes?.trim() || "",
      });

      if (!client) {
        return { success: false, error: "Client not found" };
      }

      revalidatePath("/clients");
      revalidatePath(`/clients/${clientId}`);
      revalidatePath("/dashboard");

      return { success: true, data: client, error: null };
    }

    await connectDB();

    const existing = await Client.findById(clientId);

    if (!existing) {
      return { success: false, error: "Client not found" };
    }

    existing.name = name.trim();
    existing.email = email?.trim().toLowerCase() || "";
    existing.phone = phone?.trim() || "";
    existing.address = address?.trim() || "";
    existing.notes = notes?.trim() || "";

    await existing.save();

    await writeAuditLog({
      userId: session.userId,
      action: "update",
      entity: "Client",
      entityId: existing._id,
      changes: { name: existing.name, email: existing.email },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serializeClient(existing.toObject()),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update client",
    };
  }
}

export async function deleteClientAction(clientId) {
  const { session, error: authError } = await requireWriteAccess();

  if (authError) {
    return { success: false, error: authError };
  }

  if (!clientId) {
    return { success: false, error: "Client ID is required" };
  }

  try {
    if (isAuthWithoutDb()) {
      const deleted = deleteDevClient(clientId);

      if (!deleted) {
        return { success: false, error: "Client not found" };
      }

      revalidatePath("/clients");
      revalidatePath("/dashboard");
      redirect("/clients");
    }

    await connectDB();

    const paymentCount = await Payment.countDocuments({ clientId });

    if (paymentCount > 0) {
      return {
        success: false,
        error: `Cannot delete client with ${paymentCount} linked payment(s). Remove payments first.`,
      };
    }

    const client = await Client.findByIdAndDelete(clientId);

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    await writeAuditLog({
      userId: session.userId,
      action: "delete",
      entity: "Client",
      entityId: clientId,
      changes: { name: client.name },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    redirect("/clients");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: error.message || "Failed to delete client",
    };
  }
}
