export function formatCurrency(amount, options = {}) {
  const value = Number(amount) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    ...options,
  }).format(value);
}

export function formatCompactCurrency(amount) {
  const value = Number(amount) || 0;

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(value);
}
