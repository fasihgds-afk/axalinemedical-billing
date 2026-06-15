import { DEFAULT_PAYMENT_METHODS, DEFAULT_PAYMENT_STATUSES } from "@/config/constants";
import { getDevAuthConfig } from "@/lib/devAuth";
import { listDevClients, getDevClientById } from "@/lib/devStore";
import {
  parseReportDateRange,
  paymentMatchesDateRange,
  aggregateReportsFromPayments,
} from "@/lib/reportsAggregation";

let devPaymentMethods = DEFAULT_PAYMENT_METHODS.map((method, index) => ({
  _id: `dev-method-${index + 1}`,
  ...method,
  active: true,
}));

let devPaymentStatuses = DEFAULT_PAYMENT_STATUSES.map((status, index) => ({
  _id: `dev-status-${index + 1}`,
  ...status,
  active: true,
}));

let devCustomFields = [];

let devPayments = [
  {
    _id: "dev-payment-1",
    clientId: "dev-client-1",
    amount: 2450,
    paymentDate: new Date("2025-03-15").toISOString(),
    paymentMethodId: "dev-method-1",
    paymentStatusId: "dev-status-2",
    referenceNumber: "ZEL-88421",
    notes: "March billing cycle",
    screenshot: null,
    customFields: {},
    createdBy: "dev-local-user",
    createdAt: new Date("2025-03-15").toISOString(),
    updatedAt: new Date("2025-03-15").toISOString(),
  },
  {
    _id: "dev-payment-2",
    clientId: "dev-client-2",
    amount: 1200,
    paymentDate: new Date("2025-04-02").toISOString(),
    paymentMethodId: "dev-method-2",
    paymentStatusId: "dev-status-1",
    referenceNumber: "BT-22019",
    notes: "",
    screenshot: null,
    customFields: {},
    createdBy: "dev-local-user",
    createdAt: new Date("2025-04-02").toISOString(),
    updatedAt: new Date("2025-04-02").toISOString(),
  },
];

function generatePaymentId() {
  return `dev-payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function enrichPayment(payment) {
  const client = getDevClientById(payment.clientId);
  const method = devPaymentMethods.find((item) => item._id === payment.paymentMethodId);
  const status = devPaymentStatuses.find((item) => item._id === payment.paymentStatusId);

  return {
    ...payment,
    customFields: payment.customFields || {},
    client: client ? { _id: client._id, name: client.name } : null,
    method: method ? { _id: method._id, name: method.name } : null,
    status: status
      ? { _id: status._id, name: status.name, color: status.color }
      : null,
  };
}

function matchesPaymentFilters(payment, filters) {
  const {
    search = "",
    clientId = "",
    paymentMethodId = "",
    paymentStatusId = "",
    dateFrom = "",
    dateTo = "",
  } = filters;

  if (clientId && payment.clientId !== clientId) return false;
  if (paymentMethodId && payment.paymentMethodId !== paymentMethodId) return false;
  if (paymentStatusId && payment.paymentStatusId !== paymentStatusId) return false;

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (new Date(payment.paymentDate) < from) return false;
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    if (new Date(payment.paymentDate) > to) return false;
  }

  if (search?.trim()) {
    const query = search.toLowerCase().trim();
    const enriched = enrichPayment(payment);
    const haystack = [
      payment.referenceNumber,
      payment.notes,
      enriched.client?.name,
      enriched.method?.name,
      enriched.status?.name,
      String(payment.amount),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(query)) return false;
  }

  return true;
}

function generateMethodId() {
  return `dev-method-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listDevPaymentMethods() {
  return devPaymentMethods.filter((item) => item.active).map((item) => ({ ...item }));
}

export function listAllDevPaymentMethods() {
  return [...devPaymentMethods]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({ ...item }));
}

export function getDevPaymentMethodById(id) {
  const method = devPaymentMethods.find((item) => item._id === id);
  return method ? { ...method } : null;
}

export function countDevPaymentsUsingMethod(methodId) {
  return devPayments.filter((payment) => payment.paymentMethodId === methodId).length;
}

export function createDevPaymentMethod(data) {
  const now = new Date().toISOString();
  const method = {
    _id: generateMethodId(),
    name: data.name,
    description: data.description || "",
    active: data.active !== false,
    isDefault: Boolean(data.isDefault),
    createdAt: now,
    updatedAt: now,
  };

  devPaymentMethods = [...devPaymentMethods, method];
  return { ...method };
}

export function updateDevPaymentMethod(id, data) {
  const index = devPaymentMethods.findIndex((item) => item._id === id);
  if (index === -1) return null;

  const updated = {
    ...devPaymentMethods[index],
    name: data.name,
    description: data.description || "",
    active: data.active !== false,
    updatedAt: new Date().toISOString(),
  };

  devPaymentMethods = [
    ...devPaymentMethods.slice(0, index),
    updated,
    ...devPaymentMethods.slice(index + 1),
  ];

  return { ...updated };
}

export function deleteDevPaymentMethod(id) {
  if (countDevPaymentsUsingMethod(id) > 0) {
    return { success: false, error: "Cannot delete method used by payments" };
  }

  const method = devPaymentMethods.find((item) => item._id === id);
  if (!method) return { success: false, error: "Payment method not found" };

  if (method.isDefault) {
    return { success: false, error: "Cannot delete a default payment method" };
  }

  devPaymentMethods = devPaymentMethods.filter((item) => item._id !== id);
  return { success: true, data: { ...method } };
}

function generateStatusId() {
  return `dev-status-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listDevPaymentStatuses() {
  return [...devPaymentStatuses]
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ ...item }));
}

export function listAllDevPaymentStatuses() {
  return [...devPaymentStatuses]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((item) => ({ ...item }));
}

export function getDevPaymentStatusById(id) {
  const status = devPaymentStatuses.find((item) => item._id === id);
  return status ? { ...status } : null;
}

export function countDevPaymentsUsingStatus(statusId) {
  return devPayments.filter((payment) => payment.paymentStatusId === statusId).length;
}

export function createDevPaymentStatus(data) {
  const now = new Date().toISOString();
  const maxOrder = devPaymentStatuses.reduce(
    (max, item) => Math.max(max, item.sortOrder || 0),
    0
  );

  const status = {
    _id: generateStatusId(),
    name: data.name,
    color: data.color,
    active: data.active !== false,
    isDefault: Boolean(data.isDefault),
    sortOrder: data.sortOrder ?? maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  devPaymentStatuses = [...devPaymentStatuses, status];
  return { ...status };
}

export function updateDevPaymentStatus(id, data) {
  const index = devPaymentStatuses.findIndex((item) => item._id === id);
  if (index === -1) return null;

  const updated = {
    ...devPaymentStatuses[index],
    name: data.name,
    color: data.color,
    active: data.active !== false,
    sortOrder: data.sortOrder ?? devPaymentStatuses[index].sortOrder,
    updatedAt: new Date().toISOString(),
  };

  devPaymentStatuses = [
    ...devPaymentStatuses.slice(0, index),
    updated,
    ...devPaymentStatuses.slice(index + 1),
  ];

  return { ...updated };
}

export function deleteDevPaymentStatus(id) {
  if (countDevPaymentsUsingStatus(id) > 0) {
    return { success: false, error: "Cannot delete status used by payments" };
  }

  const status = devPaymentStatuses.find((item) => item._id === id);
  if (!status) return { success: false, error: "Payment status not found" };

  if (status.isDefault) {
    return { success: false, error: "Cannot delete a default payment status" };
  }

  devPaymentStatuses = devPaymentStatuses.filter((item) => item._id !== id);
  return { success: true, data: { ...status } };
}

function generateCustomFieldId() {
  return `dev-field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listDevCustomFields() {
  return [...devCustomFields]
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ ...item }));
}

export function listAllDevCustomFields() {
  return [...devCustomFields]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map((item) => ({ ...item }));
}

export function getDevCustomFieldById(id) {
  const field = devCustomFields.find((item) => item._id === id);
  return field ? { ...field } : null;
}

export function createDevCustomField(data) {
  const now = new Date().toISOString();
  const maxOrder = devCustomFields.reduce(
    (max, item) => Math.max(max, item.sortOrder || 0),
    0
  );

  const field = {
    _id: generateCustomFieldId(),
    label: data.label,
    key: data.key,
    type: data.type,
    required: Boolean(data.required),
    placeholder: data.placeholder || "",
    options: data.options || [],
    showInTable: Boolean(data.showInTable),
    active: data.active !== false,
    sortOrder: data.sortOrder ?? maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  devCustomFields = [...devCustomFields, field];
  return { ...field };
}

export function updateDevCustomField(id, data) {
  const index = devCustomFields.findIndex((item) => item._id === id);
  if (index === -1) return null;

  const updated = {
    ...devCustomFields[index],
    label: data.label,
    key: devCustomFields[index].key,
    type: data.type,
    required: Boolean(data.required),
    placeholder: data.placeholder || "",
    options: data.options || [],
    showInTable: Boolean(data.showInTable),
    active: data.active !== false,
    sortOrder: data.sortOrder ?? devCustomFields[index].sortOrder,
    updatedAt: new Date().toISOString(),
  };

  devCustomFields = [
    ...devCustomFields.slice(0, index),
    updated,
    ...devCustomFields.slice(index + 1),
  ];

  return { ...updated };
}

export function deleteDevCustomField(id) {
  const field = devCustomFields.find((item) => item._id === id);
  if (!field) return { success: false, error: "Custom field not found" };

  devCustomFields = devCustomFields.filter((item) => item._id !== id);
  return { success: true, data: { ...field } };
}

export function listDevCustomFieldsForTable() {
  return listDevCustomFields().filter((field) => field.showInTable);
}

export function listDevPayments(filters = {}) {
  const {
    sortBy = "paymentDate",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = filters;

  let results = devPayments
    .filter((payment) => matchesPaymentFilters(payment, filters))
    .map(enrichPayment);

  results.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "paymentDate") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortBy === "amount") {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = results.length;
  const start = (page - 1) * limit;
  const payments = results.slice(start, start + limit);

  return { payments, total, page, limit };
}

export function getDevPaymentById(id) {
  const payment = devPayments.find((item) => item._id === id);
  return payment ? enrichPayment({ ...payment }) : null;
}

export function listDevPaymentsByClient(clientId) {
  return devPayments
    .filter((payment) => payment.clientId === clientId)
    .map(enrichPayment)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
    .slice(0, 20);
}

export function createDevPayment(data) {
  const config = getDevAuthConfig();
  const now = new Date().toISOString();

  const payment = {
    _id: generatePaymentId(),
    clientId: data.clientId,
    amount: data.amount,
    paymentDate: data.paymentDate,
    paymentMethodId: data.paymentMethodId,
    paymentStatusId: data.paymentStatusId,
    referenceNumber: data.referenceNumber || "",
    notes: data.notes || "",
    screenshot: data.screenshot || null,
    customFields: data.customFields || {},
    createdBy: config.userId,
    createdAt: now,
    updatedAt: now,
  };

  devPayments = [...devPayments, payment];
  return enrichPayment({ ...payment });
}

export function updateDevPayment(id, data) {
  const index = devPayments.findIndex((item) => item._id === id);
  if (index === -1) return null;

  const updated = {
    ...devPayments[index],
    clientId: data.clientId,
    amount: data.amount,
    paymentDate: data.paymentDate,
    paymentMethodId: data.paymentMethodId,
    paymentStatusId: data.paymentStatusId,
    referenceNumber: data.referenceNumber || "",
    notes: data.notes || "",
    screenshot: data.screenshot ?? devPayments[index].screenshot,
    customFields: data.customFields || {},
    updatedAt: new Date().toISOString(),
  };

  devPayments = [
    ...devPayments.slice(0, index),
    updated,
    ...devPayments.slice(index + 1),
  ];

  return enrichPayment({ ...updated });
}

export function deleteDevPayment(id) {
  const exists = devPayments.some((item) => item._id === id);
  if (!exists) return null;

  const payment = devPayments.find((item) => item._id === id);
  devPayments = devPayments.filter((item) => item._id !== id);
  return payment ? { ...payment } : null;
}

export function listAllDevPaymentsForExport(filters = {}) {
  return devPayments
    .filter((payment) => matchesPaymentFilters(payment, filters))
    .map(enrichPayment)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
}

export function listAllDevPayments() {
  return devPayments.map(enrichPayment);
}

function buildLast12MonthsTemplate() {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "2-digit",
      }).format(date),
      total: 0,
      count: 0,
    });
  }

  return months;
}

function formatReportPeriodLabel(from, to) {
  if (from && to) {
    return `${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`;
  }
  if (from) return `From ${from.toISOString().slice(0, 10)}`;
  if (to) return `Through ${to.toISOString().slice(0, 10)}`;
  return "All time (monthly chart: last 12 months)";
}

export function getDevReportsData({ dateFrom = "", dateTo = "" } = {}) {
  const { from, to, error } = parseReportDateRange(dateFrom, dateTo);
  if (error) return { data: null, error };

  const payments = listAllDevPayments().filter((payment) =>
    paymentMatchesDateRange(payment.paymentDate, from, to)
  );

  const aggregated = aggregateReportsFromPayments(payments);

  return {
    error: null,
    data: {
      summary: {
        ...aggregated.summary,
        dateFrom: from?.toISOString?.() ?? null,
        dateTo: to?.toISOString?.() ?? null,
        periodLabel: formatReportPeriodLabel(from, to),
      },
      byMonth: aggregated.byMonth,
      byClient: aggregated.byClient,
      byMethod: aggregated.byMethod,
      byStatus: aggregated.byStatus,
    },
  };
}

export function getDevDashboardPaymentData() {
  const payments = listAllDevPayments();

  const sumByStatusName = (name) =>
    payments
      .filter((payment) => payment.status?.name === name)
      .reduce((sum, payment) => sum + payment.amount, 0);

  const monthlyTemplate = buildLast12MonthsTemplate();
  const monthlyMap = new Map(
    monthlyTemplate.map((entry) => [`${entry.year}-${entry.month}`, entry])
  );

  for (const payment of payments) {
    const date = new Date(payment.paymentDate);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const entry = monthlyMap.get(key);

    if (entry) {
      entry.total += payment.amount;
      entry.count += 1;
    }
  }

  const statusTotals = new Map();

  for (const payment of payments) {
    const statusId = payment.paymentStatusId;
    const existing = statusTotals.get(statusId) || {
      id: statusId,
      name: payment.status?.name ?? "Unknown",
      color: payment.status?.color ?? "#808080",
      total: 0,
      count: 0,
    };
    existing.total += payment.amount;
    existing.count += 1;
    statusTotals.set(statusId, existing);
  }

  const methodTotals = new Map();

  for (const payment of payments) {
    const methodId = payment.paymentMethodId;
    const existing = methodTotals.get(methodId) || {
      id: methodId,
      name: payment.method?.name ?? "Unknown",
      total: 0,
      count: 0,
    };
    existing.total += payment.amount;
    existing.count += 1;
    methodTotals.set(methodId, existing);
  }

  return {
    stats: {
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      paidAmount: sumByStatusName("Paid"),
      pendingAmount: sumByStatusName("Pending"),
      failedAmount: sumByStatusName("Failed"),
      clientCount: listDevClients().length,
    },
    monthlyData: Array.from(monthlyMap.values()),
    statusBreakdown: Array.from(statusTotals.values()).sort((a, b) => b.total - a.total),
    methodBreakdown: Array.from(methodTotals.values()).sort((a, b) => b.total - a.total),
    recentPayments: [...payments]
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 10),
    devMode: true,
  };
}
