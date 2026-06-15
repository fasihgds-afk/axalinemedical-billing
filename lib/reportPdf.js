import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_NAME } from "@/config/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { REPORT_BRAND, hexToRgb, resolveStatusColor } from "@/lib/reportBrand";

const NAVY = hexToRgb(REPORT_BRAND.navy);
const BLUE = hexToRgb(REPORT_BRAND.blue);
const RED = hexToRgb(REPORT_BRAND.red);
const SURFACE = hexToRgb(REPORT_BRAND.surface);

async function fetchImageDataUrl(url) {
  if (!url) return null;

  try {
    if (url.startsWith("/")) {
      const filePath = join(process.cwd(), "public", url.replace(/^\//, ""));
      if (!existsSync(filePath)) return null;
      const buffer = readFileSync(filePath);
      const ext = filePath.split(".").pop()?.toLowerCase();
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : "image/png";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get("content-type") || "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function getImageFormat(dataUrl) {
  if (dataUrl?.includes("image/jpeg")) return "JPEG";
  if (dataUrl?.includes("image/webp")) return "WEBP";
  return "PNG";
}

function addPageChrome(doc, businessName, page, pageCount) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 8, "F");
  doc.setFillColor(...BLUE);
  doc.rect(0, 8, 210, 1.2, "F");
  doc.setFillColor(...RED);
  doc.rect(0, 9.2, 48, 0.6, "F");

  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(`${businessName} — Confidential payment report`, 14, 287);
  doc.text(`Page ${page} of ${pageCount}`, 196, 287, { align: "right" });
}

function addSummaryStatBox(doc, x, y, w, h, label, value, fillRgb) {
  doc.setFillColor(...fillRgb);
  doc.roundedRect(x, y, w, h, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(label.toUpperCase(), x + 4, y + 7);
  doc.setFontSize(12);
  doc.text(value, x + 4, y + 15);
}

function addSectionTitle(doc, title, y) {
  doc.setFillColor(...BLUE);
  doc.rect(14, y - 4, 3, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title, 20, y + 1);

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.2);
  doc.line(14, y + 4, 196, y + 4);

  return y + 10;
}

function addBreakdownTable(doc, startY, title, nameColumn, rows, options = {}) {
  let y = startY;

  if (y > 250) {
    doc.addPage();
    y = 22;
  }

  y = addSectionTitle(doc, title, y);

  if (!rows?.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text("No data for this period.", 14, y + 2);
    return y + 10;
  }

  const body = rows.map((row) => [
    row.name ?? row.label ?? "—",
    formatCurrency(row.total),
    String(row.count ?? 0),
  ]);

  autoTable(doc, {
    startY: y,
    head: [[nameColumn, "Total", "Count"]],
    body,
    theme: "striped",
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: NAVY,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: SURFACE,
    },
    columnStyles: {
      1: { halign: "right", fontStyle: "bold", textColor: BLUE },
      2: { halign: "right", textColor: [100, 116, 139] },
    },
    margin: { left: 14, right: 14 },
    didParseCell: options.statusColors
      ? (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const row = rows[data.row.index];
            const colorHex = resolveStatusColor(row?.name, row?.color);
            const rgb = hexToRgb(colorHex);
            data.cell.styles.textColor = rgb;
            data.cell.styles.fontStyle = "bold";
          }
        }
      : undefined,
  });

  return doc.lastAutoTable.finalY + 12;
}

export async function buildReportPdf({ reportData, businessProfile = null }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const profile = businessProfile || {};
  const businessName = profile.businessName || APP_NAME;
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logoUrl = profile.logo?.url || "/logo.png";
  const logoDataUrl = await fetchImageDataUrl(logoUrl);

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 36, "F");
  doc.setFillColor(...BLUE);
  doc.rect(0, 36, 210, 1.5, "F");
  doc.setFillColor(...RED);
  doc.rect(0, 37.5, 56, 0.8, "F");

  if (logoDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 8, 20, 20, 2, 2, "F");
      doc.addImage(
        logoDataUrl,
        getImageFormat(logoDataUrl),
        13.5,
        9.5,
        17,
        17
      );
    } catch {
      // Skip logo if unsupported
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(businessName, logoDataUrl ? 36 : 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const contactLine = [profile.email, profile.phone, profile.website]
    .filter(Boolean)
    .join("   |   ");
  if (contactLine) {
    doc.text(contactLine, logoDataUrl ? 36 : 14, 22);
  }
  if (profile.address) {
    doc.text(profile.address, logoDataUrl ? 36 : 14, 28, { maxWidth: 130 });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("Payment Report", 14, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Period: ${reportData.summary?.periodLabel ?? "All payments"}`, 14, 60);
  doc.text(`Generated: ${generated}`, 14, 66);

  addSummaryStatBox(
    doc,
    14,
    72,
    58,
    18,
    "Total amount",
    formatCurrency(reportData.summary?.totalAmount ?? 0),
    BLUE
  );
  addSummaryStatBox(
    doc,
    76,
    72,
    58,
    18,
    "Payments",
    String(reportData.summary?.paymentCount ?? 0),
    NAVY
  );
  addSummaryStatBox(
    doc,
    138,
    72,
    58,
    18,
    "Report type",
    "Summary",
    RED
  );

  let y = 98;

  y = addBreakdownTable(doc, y, "By month", "Month", reportData.byMonth);
  y = addBreakdownTable(doc, y, "By client", "Client", reportData.byClient);
  y = addBreakdownTable(doc, y, "By payment method", "Method", reportData.byMethod);
  addBreakdownTable(doc, y, "By status", "Status", reportData.byStatus, {
    statusColors: true,
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    addPageChrome(doc, businessName, page, pageCount);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
