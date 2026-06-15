export function parseReportDateRange(dateFrom, dateTo) {
  let from = null;
  let to = null;

  if (dateFrom) {
    from = new Date(dateFrom);
    if (Number.isNaN(from.getTime())) {
      return { from: null, to: null, error: "Invalid start date" };
    }
    from.setHours(0, 0, 0, 0);
  }

  if (dateTo) {
    to = new Date(dateTo);
    if (Number.isNaN(to.getTime())) {
      return { from: null, to: null, error: "Invalid end date" };
    }
    to.setHours(23, 59, 59, 999);
  }

  if (from && to && from > to) {
    return { from: null, to: null, error: "Start date must be before end date" };
  }

  return { from, to, error: null };
}

export function paymentMatchesDateRange(paymentDate, from, to) {
  const date = new Date(paymentDate);
  if (Number.isNaN(date.getTime())) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function buildLast12MonthsTemplate() {
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

function formatMonthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function aggregateReportsFromPayments(payments) {
  const monthlyTemplate = buildLast12MonthsTemplate();
  const monthlyMap = new Map(
    monthlyTemplate.map((entry) => [`${entry.year}-${entry.month}`, { ...entry }])
  );

  const clientTotals = new Map();
  const methodTotals = new Map();
  const statusTotals = new Map();

  let totalAmount = 0;

  for (const payment of payments) {
    const amount = Number(payment.amount) || 0;
    totalAmount += amount;

    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthEntry = monthlyMap.get(monthKey);

    if (monthEntry) {
      monthEntry.total += amount;
      monthEntry.count += 1;
    }

    const clientId = payment.clientId?.toString?.() ?? payment.clientId ?? "unknown";
    const clientName =
      payment.client?.name ?? payment.clientName ?? "Unknown client";
    const clientExisting = clientTotals.get(clientId) || {
      id: clientId,
      name: clientName,
      total: 0,
      count: 0,
    };
    clientExisting.total += amount;
    clientExisting.count += 1;
    clientTotals.set(clientId, clientExisting);

    const methodId =
      payment.paymentMethodId?.toString?.() ?? payment.paymentMethodId ?? "unknown";
    const methodExisting = methodTotals.get(methodId) || {
      id: methodId,
      name: payment.method?.name ?? "Unknown",
      total: 0,
      count: 0,
    };
    methodExisting.total += amount;
    methodExisting.count += 1;
    methodTotals.set(methodId, methodExisting);

    const statusId =
      payment.paymentStatusId?.toString?.() ?? payment.paymentStatusId ?? "unknown";
    const statusExisting = statusTotals.get(statusId) || {
      id: statusId,
      name: payment.status?.name ?? "Unknown",
      color: payment.status?.color ?? "#808080",
      total: 0,
      count: 0,
    };
    statusExisting.total += amount;
    statusExisting.count += 1;
    statusTotals.set(statusId, statusExisting);
  }

  return {
    summary: {
      totalAmount,
      paymentCount: payments.length,
    },
    byMonth: Array.from(monthlyMap.values()),
    byClient: Array.from(clientTotals.values()).sort((a, b) => b.total - a.total),
    byMethod: Array.from(methodTotals.values()).sort((a, b) => b.total - a.total),
    byStatus: Array.from(statusTotals.values()).sort((a, b) => b.total - a.total),
  };
}

export function monthAggregationToReportRows(monthlyAgg) {
  return monthlyAgg.map((row) => ({
    year: row._id.year,
    month: row._id.month,
    label: formatMonthLabel(row._id.year, row._id.month),
    total: row.total,
    count: row.count,
  }));
}

export function mergeMonthlyAggregation(template, monthlyAgg) {
  const monthlyMap = new Map(
    template.map((entry) => [`${entry.year}-${entry.month}`, { ...entry }])
  );

  for (const row of monthlyAgg) {
    const key = `${row._id.year}-${row._id.month}`;
    const existing = monthlyMap.get(key);

    if (existing) {
      existing.total = row.total;
      existing.count = row.count;
    }
  }

  return Array.from(monthlyMap.values());
}
