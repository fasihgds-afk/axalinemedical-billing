import { ROLES } from "@/config/constants";

export function isAuthWithoutDb() {
  return process.env.AUTH_WITHOUT_DB === "true";
}

export function getDevAuthConfig() {
  return {
    userId: "dev-local-user",
    email: process.env.DEV_AUTH_EMAIL || "admin@demo.com",
    password: process.env.DEV_AUTH_PASSWORD || "demo1234",
    name: process.env.DEV_AUTH_NAME || "Demo Admin",
    role: process.env.DEV_AUTH_ROLE || ROLES.ADMIN,
  };
}

export function validateDevCredentials(email, password) {
  const config = getDevAuthConfig();

  return (
    email.toLowerCase().trim() === config.email.toLowerCase() &&
    password === config.password
  );
}

export function buildDevSessionUser(overrides = {}) {
  const config = getDevAuthConfig();

  return {
    _id: {
      toString: () => overrides.userId || config.userId,
    },
    email: overrides.email || config.email,
    name: overrides.name || config.name,
    role: overrides.role || config.role,
    active: true,
  };
}

export function userFromSession(session) {
  if (!session?.userId) return null;

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
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

export function getMockDashboardData() {
  return {
    stats: {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      clientCount: 0,
    },
    monthlyData: buildLast12Months(),
    statusBreakdown: [],
    methodBreakdown: [],
    recentPayments: [],
    devMode: true,
  };
}

export function getDevLoginHint() {
  const config = getDevAuthConfig();
  return `Email: ${config.email} · Password: ${config.password}`;
}
