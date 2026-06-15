export function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function buildCsv(headers, rows) {
  const headerLine = headers.map(escapeCsvValue).join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCsvValue(cell)).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}
