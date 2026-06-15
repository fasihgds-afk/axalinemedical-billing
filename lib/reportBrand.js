import { BRAND_COLORS } from "@/config/constants";

export const REPORT_BRAND = {
  navy: "#0c1f38",
  navyDark: "#051024",
  blue: BRAND_COLORS.blue,
  blueLight: "#3d8fd4",
  red: BRAND_COLORS.red,
  gray: BRAND_COLORS.gray,
  paid: "#1F402C",
  pending: "#982D2D",
  surface: "#eef4fb",
};

export function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function resolveStatusColor(name, fallback) {
  const key = name?.toLowerCase?.() ?? "";
  if (key === "paid") return REPORT_BRAND.paid;
  if (key === "pending") return REPORT_BRAND.pending;
  return fallback || REPORT_BRAND.gray;
}
