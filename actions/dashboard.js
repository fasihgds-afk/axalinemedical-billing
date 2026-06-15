"use server";

import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import PaymentStatus from "@/models/PaymentStatus";
import PaymentMethod from "@/models/PaymentMethod";
import Client from "@/models/Client";
import { BRAND_COLORS } from "@/config/constants";
import { isAuthWithoutDb } from "@/lib/devAuth";
import { getDevDashboardPaymentData } from "@/lib/devPaymentStore";

function sumFromAggregation(result) {
  return result?.[0]?.total ?? 0;
}

function buildLast12Months() {
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

function serializePayment(payment) {
  return {
    _id: payment._id.toString(),
    amount: payment.amount,
    paymentDate: payment.paymentDate?.toISOString?.() ?? payment.paymentDate,
    referenceNumber: payment.referenceNumber || "",
    client: payment.clientId
      ? {
          _id: payment.clientId._id?.toString?.() ?? payment.clientId.toString(),
          name: payment.clientId.name ?? "Unknown",
        }
      : null,
    method: payment.paymentMethodId
      ? {
          _id:
            payment.paymentMethodId._id?.toString?.() ??
            payment.paymentMethodId.toString(),
          name: payment.paymentMethodId.name ?? "Unknown",
        }
      : null,
    status: payment.paymentStatusId
      ? {
          _id:
            payment.paymentStatusId._id?.toString?.() ??
            payment.paymentStatusId.toString(),
          name: payment.paymentStatusId.name ?? "Unknown",
          color: payment.paymentStatusId.color ?? BRAND_COLORS.gray,
        }
      : null,
  };
}

export async function getDashboardData() {
  if (isAuthWithoutDb()) {
    return {
      success: true,
      data: getDevDashboardPaymentData(),
      error: null,
    };
  }

  try {
    await connectDB();

    const statuses = await PaymentStatus.find({ active: true }).lean();
    const methods = await PaymentMethod.find({ active: true }).lean();

    const statusByName = Object.fromEntries(
      statuses.map((status) => [status.name, status])
    );

    const paidStatus = statusByName.Paid;
    const pendingStatus = statusByName.Pending;
    const failedStatus = statusByName.Failed;

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalAgg,
      paidAgg,
      pendingAgg,
      failedAgg,
      clientCount,
      monthlyAgg,
      statusAgg,
      methodAgg,
      recentPayments,
    ] = await Promise.all([
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      paidStatus
        ? Payment.aggregate([
            { $match: { paymentStatusId: paidStatus._id } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
        : Promise.resolve([]),
      pendingStatus
        ? Payment.aggregate([
            { $match: { paymentStatusId: pendingStatus._id } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
        : Promise.resolve([]),
      failedStatus
        ? Payment.aggregate([
            { $match: { paymentStatusId: failedStatus._id } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
        : Promise.resolve([]),
      Client.countDocuments(),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: twelveMonthsAgo } } },
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
        {
          $group: {
            _id: "$paymentStatusId",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: "$paymentMethodId",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.find()
        .sort({ paymentDate: -1, createdAt: -1 })
        .limit(10)
        .populate("clientId", "name")
        .populate("paymentMethodId", "name")
        .populate("paymentStatusId", "name color")
        .lean(),
    ]);

    const monthlyTemplate = buildLast12Months();
    const monthlyMap = new Map(
      monthlyTemplate.map((entry) => [`${entry.year}-${entry.month}`, entry])
    );

    for (const row of monthlyAgg) {
      const key = `${row._id.year}-${row._id.month}`;
      const existing = monthlyMap.get(key);

      if (existing) {
        existing.total = row.total;
        existing.count = row.count;
      }
    }

    const statusMap = new Map(
      statuses.map((status) => [status._id.toString(), status])
    );

    const statusBreakdown = statusAgg
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
      .filter((item) => item.count > 0)
      .sort((a, b) => b.total - a.total);

    const methodMap = new Map(
      methods.map((method) => [method._id.toString(), method])
    );

    const methodBreakdown = methodAgg
      .map((row) => {
        const method = methodMap.get(row._id?.toString());

        return {
          id: row._id?.toString() ?? "unknown",
          name: method?.name ?? "Unknown",
          total: row.total,
          count: row.count,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.total - a.total);

    return {
      success: true,
      data: {
        stats: {
          totalAmount: sumFromAggregation(totalAgg),
          paidAmount: sumFromAggregation(paidAgg),
          pendingAmount: sumFromAggregation(pendingAgg),
          failedAmount: sumFromAggregation(failedAgg),
          clientCount,
        },
        monthlyData: Array.from(monthlyMap.values()),
        statusBreakdown,
        methodBreakdown,
        recentPayments: recentPayments.map(serializePayment),
      },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to load dashboard data",
    };
  }
}
