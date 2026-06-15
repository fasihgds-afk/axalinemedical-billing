"use server";

import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getDevReportsData } from "@/lib/devPaymentStore";
import { buildCsv } from "@/lib/csv";
import { buildReportPdf } from "@/lib/reportPdf";
import { getBusinessProfile } from "@/actions/businessProfile";
import Payment from "@/models/Payment";
import PaymentStatus from "@/models/PaymentStatus";
import PaymentMethod from "@/models/PaymentMethod";
import Client from "@/models/Client";
import { BRAND_COLORS } from "@/config/constants";
import {
  parseReportDateRange,
  buildLast12MonthsTemplate,
  mergeMonthlyAggregation,
} from "@/lib/reportsAggregation";

async function requireSession() {
  const session = await auth();
  if (!session?.userId) {
    return { error: "Not authenticated", session: null };
  }
  return { error: null, session };
}

function buildDateMatch(dateFrom, dateTo) {
  const { from, to, error } = parseReportDateRange(dateFrom, dateTo);
  if (error) return { error, match: null };

  const match = {};
  if (from) match.$gte = from;
  if (to) match.$lte = to;

  return {
    error: null,
    match: Object.keys(match).length ? match : null,
    from,
    to,
  };
}

function formatFilterLabel(from, to) {
  if (from && to) {
    return `${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`;
  }
  if (from) return `From ${from.toISOString().slice(0, 10)}`;
  if (to) return `Through ${to.toISOString().slice(0, 10)}`;
  return "All time (monthly chart: last 12 months)";
}

export async function getReportsData(filtersInput = {}) {
  const { error: authError } = await requireSession();
  if (authError) {
    return { success: false, data: null, error: authError };
  }

  const dateFrom = filtersInput.dateFrom || filtersInput.from || "";
  const dateTo = filtersInput.dateTo || filtersInput.to || "";

  if (isAuthWithoutDb()) {
    const devResult = getDevReportsData({ dateFrom, dateTo });
    if (devResult.error) {
      return { success: false, data: null, error: devResult.error };
    }
    return {
      success: true,
      data: { ...devResult.data, devMode: true },
      error: null,
    };
  }

  try {
    const { match: dateMatch, from, to, error: dateError } = buildDateMatch(
      dateFrom,
      dateTo
    );
    if (dateError) {
      return { success: false, data: null, error: dateError };
    }

    await connectDB();

    const matchStage = dateMatch ? { paymentDate: dateMatch } : {};
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyMatch = {
      ...matchStage,
      paymentDate: {
        ...(dateMatch || {}),
        $gte: dateMatch?.$gte
          ? new Date(Math.max(dateMatch.$gte.getTime(), twelveMonthsAgo.getTime()))
          : twelveMonthsAgo,
        ...(dateMatch?.$lte ? { $lte: dateMatch.$lte } : {}),
      },
    };

    const [statuses, methods, clients, summaryAgg, monthlyAgg, clientAgg, methodAgg, statusAgg] =
      await Promise.all([
        PaymentStatus.find({ active: true }).lean(),
        PaymentMethod.find({ active: true }).lean(),
        Client.find().lean(),
        Payment.aggregate([
          ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
        Payment.aggregate([
          { $match: monthlyMatch },
          {
            $group: {
              _id: {
                year: { $year: "$paymentDate" },
                month: { $month: "$paymentDate" },
              },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Payment.aggregate([
          ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
          {
            $group: {
              _id: "$clientId",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]),
        Payment.aggregate([
          ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
          {
            $group: {
              _id: "$paymentMethodId",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]),
        Payment.aggregate([
          ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
          {
            $group: {
              _id: "$paymentStatusId",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]),
      ]);

    const clientMap = new Map(
      clients.map((client) => [client._id.toString(), client])
    );
    const methodMap = new Map(
      methods.map((method) => [method._id.toString(), method])
    );
    const statusMap = new Map(
      statuses.map((status) => [status._id.toString(), status])
    );

    const byClient = clientAgg
      .map((row) => {
        const client = clientMap.get(row._id?.toString());
        return {
          id: row._id?.toString() ?? "unknown",
          name: client?.name ?? "Unknown client",
          total: row.total,
          count: row.count,
        };
      })
      .filter((item) => item.count > 0);

    const byMethod = methodAgg
      .map((row) => {
        const method = methodMap.get(row._id?.toString());
        return {
          id: row._id?.toString() ?? "unknown",
          name: method?.name ?? "Unknown",
          total: row.total,
          count: row.count,
        };
      })
      .filter((item) => item.count > 0);

    const byStatus = statusAgg
      .map((row) => {
        const status = statusMap.get(row._id?.toString());
        return {
          id: row._id?.toString() ?? "unknown",
          name: status?.name ?? "Unknown",
          color: status?.color ?? BRAND_COLORS.gray,
          total: row.total,
          count: row.count,
        };
      })
      .filter((item) => item.count > 0);

    return {
      success: true,
      data: {
        summary: {
          totalAmount: summaryAgg[0]?.total ?? 0,
          paymentCount: summaryAgg[0]?.count ?? 0,
          dateFrom: from?.toISOString?.() ?? null,
          dateTo: to?.toISOString?.() ?? null,
          periodLabel: formatFilterLabel(from, to),
        },
        byMonth: mergeMonthlyAggregation(buildLast12MonthsTemplate(), monthlyAgg),
        byClient,
        byMethod,
        byStatus,
        devMode: false,
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load reports",
    };
  }
}

function buildReportCsvContent(data) {
  const sections = [];
  const generated = new Date().toISOString().slice(0, 10);

  sections.push(
    buildCsv(["Metric", "Value"], [
      ["Report", "Axaline Medical Billing"],
      ["Generated", generated],
      ["Period", data.summary.periodLabel],
      ["Total amount", data.summary.totalAmount],
      ["Payment count", data.summary.paymentCount],
    ])
  );

  sections.push(
    buildCsv(
      ["Month", "Total", "Count"],
      data.byMonth.map((row) => [row.label, row.total, row.count])
    )
  );

  sections.push(
    buildCsv(
      ["Client", "Total", "Count"],
      data.byClient.map((row) => [row.name, row.total, row.count])
    )
  );

  sections.push(
    buildCsv(
      ["Payment method", "Total", "Count"],
      data.byMethod.map((row) => [row.name, row.total, row.count])
    )
  );

  sections.push(
    buildCsv(
      ["Status", "Total", "Count"],
      data.byStatus.map((row) => [row.name, row.total, row.count])
    )
  );

  const labels = [
    "SUMMARY",
    "BY MONTH",
    "BY CLIENT",
    "BY PAYMENT METHOD",
    "BY STATUS",
  ];

  return sections
    .map((csv, index) => `${labels[index]}\n${csv}`)
    .join("\n\n");
}

export async function exportReportsCsv(filtersInput = {}) {
  const result = await getReportsData(filtersInput);

  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }

  return {
    success: true,
    data: buildReportCsvContent(result.data),
    error: null,
  };
}

export async function exportReportsPdf(filtersInput = {}) {
  const result = await getReportsData(filtersInput);

  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }

  try {
    const profileResult = await getBusinessProfile();
    const businessProfile = profileResult.success
      ? profileResult.data.profile
      : null;

    const pdfBuffer = await buildReportPdf({
      reportData: result.data,
      businessProfile,
    });

    return {
      success: true,
      data: pdfBuffer.toString("base64"),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to generate PDF report",
    };
  }
}
