export const APP_NAME = "Axaline Medical Billing";
export const APP_SLUG = "axalinemedicalbilling";

export const BRAND_COLORS = {
  blue: "#1E67B5",
  red: "#FF3131",
  gray: "#808080",
  black: "#000000",
};

export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.VIEWER]: 1,
};

export const CUSTOM_FIELD_TYPES = [
  "Text",
  "Number",
  "Date",
  "Dropdown",
  "File",
  "Boolean",
  "Textarea",
];

export const DEFAULT_PAYMENT_METHODS = [
  { name: "Zelle", description: "Zelle payment transfer", isDefault: true },
  { name: "Bank Transfer", description: "Direct bank transfer", isDefault: true },
];

export const DEFAULT_PAYMENT_STATUSES = [
  { name: "Pending", color: "#808080", isDefault: true, sortOrder: 1 },
  { name: "Paid", color: "#1E67B5", isDefault: true, sortOrder: 2 },
  { name: "Partial", color: "#F59E0B", isDefault: true, sortOrder: 3 },
  { name: "Failed", color: "#FF3131", isDefault: true, sortOrder: 4 },
  { name: "Refunded", color: "#6366F1", isDefault: true, sortOrder: 5 },
];

export const UPLOAD_ACCEPTED_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];

export const UPLOAD_MAX_SIZE_MB = 4;

export const SESSION_COOKIE = "axaline_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Clients", href: "/clients", icon: "Users" },
  { label: "Payments", href: "/payments", icon: "CreditCard" },
  { label: "Reports", href: "/reports", icon: "BarChart3" },
];

export const SETTINGS_NAV_ITEMS = [
  { label: "Payment Methods", href: "/settings/payment-methods", icon: "Wallet", roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { label: "Payment Statuses", href: "/settings/payment-statuses", icon: "Tags", roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { label: "Custom Fields", href: "/settings/custom-fields", icon: "FormInput", roles: [ROLES.ADMIN] },
  { label: "Users", href: "/settings/users", icon: "UserCog", roles: [ROLES.ADMIN] },
  { label: "Business Profile", href: "/settings/business-profile", icon: "Building2", roles: [ROLES.ADMIN] },
];

export function hasRoleAccess(userRole, allowedRoles) {
  if (!userRole || !allowedRoles?.length) return false;
  return allowedRoles.includes(userRole);
}

export function canWrite(userRole) {
  return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;
}
