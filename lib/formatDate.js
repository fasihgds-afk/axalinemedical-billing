export function formatDate(date, options = {}) {
  if (!date) return "—";

  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(value);
}

export function formatMonthYear(year, month) {
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}
