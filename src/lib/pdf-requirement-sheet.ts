import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProductItem {
  name: string;
  sku: string;
  category: string;
  moq: number;
  customMoq: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  leadTime: string;
  certifications: string[];
  exportAvailable: boolean;
}

interface RequirementSheetOptions {
  items: ProductItem[];
  buyerName: string;
  buyerEmail: string;
  currency: "INR" | "USD";
  notes: string;
  aiSuggestion?: string;
  total: number;
}

export function generateRequirementSheetPDF(options: RequirementSheetOptions): jsPDF {
  const { items, buyerName, buyerEmail, currency, notes, aiSuggestion, total } = options;
  const currSymbol = currency === "INR" ? "₹" : "$";
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ─── Background ───────────────────────────────────────
  // Dark gradient background
  doc.setFillColor(11, 18, 32); // #0B1220
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Glassmorphic header card
  doc.setFillColor(17, 24, 39); // #111827
  doc.roundedRect(10, 8, pageWidth - 20, 38, 4, 4, "F");
  // Header border glow
  doc.setDrawColor(34, 211, 238); // cyan-400
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 8, pageWidth - 20, 38, 4, 4, "S");

  // ─── Header Content ───────────────────────────────────
  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(34, 211, 238); // cyan
  doc.text("Upa", 18, 22);
  doc.setTextColor(45, 212, 191); // teal
  doc.text("Health", 35, 22);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("PROCUREMENT OS", 18, 28);

  // Document title - right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("PRODUCT REQUIREMENT SHEET", pageWidth - 18, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Date: ${date} | Currency: ${currency}`, pageWidth - 18, 30, { align: "right" });
  doc.text(`Ref: UH-REQ-${Date.now().toString(36).toUpperCase()}`, pageWidth - 18, 36, { align: "right" });

  // ─── Buyer Info Card ──────────────────────────────────
  let yPos = 54;
  if (buyerName || buyerEmail) {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(10, yPos, pageWidth - 20, 18, 3, 3, "F");
    doc.setDrawColor(51, 65, 85); // slate-700
    doc.setLineWidth(0.2);
    doc.roundedRect(10, yPos, pageWidth - 20, 18, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(34, 211, 238);
    doc.text("BUYER / SUPPLIER", 16, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240); // slate-200
    if (buyerName) doc.text(`Name: ${buyerName}`, 16, yPos + 12);
    if (buyerEmail) doc.text(`Email: ${buyerEmail}`, pageWidth / 2, yPos + 12);

    yPos += 24;
  }

  // ─── Products Table ───────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`SELECTED PRODUCTS (${items.length} items)`, 14, yPos + 4);
  yPos += 8;

  const tableData = items.map((item, i) => [
    `${i + 1}`,
    item.name,
    item.sku,
    `${item.customMoq.toLocaleString()} ${item.unit}s`,
    `${item.quantity.toLocaleString()} ${item.unit}s`,
    `${currSymbol}${item.unitPrice.toFixed(2)}`,
    `${currSymbol}${item.lineTotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Product", "SKU", "MOQ", "Qty Ordered", "Unit Price", "Line Total"]],
    body: tableData,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [226, 232, 240],
      lineColor: [51, 65, 85],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [15, 23, 42], // slate-900
    },
    bodyStyles: {
      fillColor: [17, 24, 39], // #111827
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 52 },
      2: { cellWidth: 24 },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 24, halign: "center" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Redraw background on new pages
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    },
    willDrawPage: (data) => {
      // Dark background for each page
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    },
  });

  // Get Y position after table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  let currentY = finalY;

  // ─── Total Card ───────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - 80, currentY, 70, 16, 3, 3, "F");
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - 80, currentY, 70, 16, 3, 3, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("TOTAL ORDER VALUE", pageWidth - 75, currentY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${currSymbol}${total.toLocaleString()}`, pageWidth - 75, currentY + 13);

  currentY += 24;

  // ─── Product Details Section ──────────────────────────
  // Detailed cards for each product
  items.forEach((item, i) => {
    // Check if we need a new page
    if (currentY > pageHeight - 45) {
      doc.addPage();
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      currentY = 15;
    }

    const cardHeight = 24;
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(10, currentY, pageWidth - 20, cardHeight, 2, 2, "F");
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.15);
    doc.roundedRect(10, currentY, pageWidth - 20, cardHeight, 2, 2, "S");

    // Product number badge
    doc.setFillColor(34, 211, 238, 0.2);
    doc.roundedRect(14, currentY + 3, 8, 8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 211, 238);
    doc.text(`${i + 1}`, 18, currentY + 8.5, { align: "center" });

    // Product name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(item.name.slice(0, 50), 26, currentY + 8);

    // SKU & Category
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SKU: ${item.sku} | Category: ${item.category} | Lead Time: ${item.leadTime}`, 26, currentY + 14);

    // Certifications & Export
    const certs = item.certifications.length > 0 ? item.certifications.join(", ") : "Standard";
    doc.text(`Certs: ${certs} | Export: ${item.exportAvailable ? "Yes" : "No"}`, 26, currentY + 19.5);

    // Price on right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text(`${currSymbol}${item.lineTotal.toLocaleString()}`, pageWidth - 16, currentY + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${item.quantity.toLocaleString()} × ${currSymbol}${item.unitPrice}`, pageWidth - 16, currentY + 14, { align: "right" });

    currentY += cardHeight + 3;
  });

  // ─── Notes Section ────────────────────────────────────
  if (notes || aiSuggestion) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      currentY = 15;
    }

    currentY += 4;

    if (notes) {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(10, currentY, pageWidth - 20, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text("SPECIAL NOTES", 16, currentY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240);
      doc.text(notes.slice(0, 120), 16, currentY + 12);
      currentY += 22;
    }

    if (aiSuggestion) {
      doc.setFillColor(22, 78, 99); // cyan-900-ish
      doc.roundedRect(10, currentY, pageWidth - 20, 20, 2, 2, "F");
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.2);
      doc.roundedRect(10, currentY, pageWidth - 20, 20, 2, 2, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(34, 211, 238);
      doc.text("AI PRICING RECOMMENDATION", 16, currentY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(226, 232, 240);
      const lines = doc.splitTextToSize(aiSuggestion.slice(0, 250), pageWidth - 40);
      doc.text(lines, 16, currentY + 12);
      currentY += 26;
    }
  }

  // ─── Footer ───────────────────────────────────────────
  const footerY = pageHeight - 18;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, footerY - 4, pageWidth, 22, "F");
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(10, footerY - 4, pageWidth - 10, footerY - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 211, 238);
  doc.text("UpaHealth Supplies", 14, footerY + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("India's AI-Enabled Healthcare Sourcing Partner", 14, footerY + 7);
  doc.text("adminupahealthsupplies@gmail.com | www.upahealthsupplies.com", 14, footerY + 12);

  // Page number
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, footerY + 12, { align: "right" });
  }

  return doc;
}
