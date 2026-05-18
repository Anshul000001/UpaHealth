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
  const currSymbol = currency === "INR" ? "\u20B9" : "$";
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Header card
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(10, 8, pageWidth - 20, 36, 4, 4, "F");
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 8, pageWidth - 20, 36, 4, 4, "S");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(34, 211, 238);
  doc.text("UpaHealth Supplies", 18, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("AI-Enabled Healthcare Procurement OS", 18, 28);

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("PRODUCT REQUIREMENT SHEET", pageWidth - 18, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Date: ${date} | Currency: ${currency}`, pageWidth - 18, 28, { align: "right" });
  doc.text(`Ref: UH-REQ-${Date.now().toString(36).toUpperCase().slice(0, 8)}`, pageWidth - 18, 34, { align: "right" });

  // Buyer Info
  let yPos = 52;
  if (buyerName || buyerEmail) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(10, yPos, pageWidth - 20, 16, 3, 3, "F");
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.roundedRect(10, yPos, pageWidth - 20, 16, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 211, 238);
    doc.text("BUYER / SUPPLIER", 16, yPos + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    if (buyerName) doc.text(`Name: ${buyerName}`, 16, yPos + 12);
    if (buyerEmail) doc.text(`Email: ${buyerEmail}`, pageWidth / 2, yPos + 12);
    yPos += 22;
  }

  // Products table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`SELECTED PRODUCTS (${items.length} items)`, 14, yPos + 4);
  yPos += 8;

  const tableData = items.map((item, i) => [
    `${i + 1}`,
    item.name.length > 30 ? item.name.slice(0, 28) + "..." : item.name,
    item.sku,
    `${item.customMoq.toLocaleString()}`,
    `${item.quantity.toLocaleString()}`,
    `${currSymbol}${item.unitPrice.toFixed(2)}`,
    `${currSymbol}${item.lineTotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Product", "SKU", "MOQ", "Qty", "Unit Price", "Total"]],
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
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    bodyStyles: { fillColor: [17, 24, 39] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 24 },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 10, right: 10 },
    willDrawPage: () => {
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    },
  });

  // Total card
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  let currentY = finalY;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - 80, currentY, 70, 16, 3, 3, "F");
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - 80, currentY, 70, 16, 3, 3, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("TOTAL ORDER VALUE", pageWidth - 75, currentY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text(`${currSymbol}${total.toLocaleString()}`, pageWidth - 75, currentY + 13);
  currentY += 24;

  // Product detail cards
  items.forEach((item, i) => {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      currentY = 15;
    }
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(10, currentY, pageWidth - 20, 22, 2, 2, "F");
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.15);
    doc.roundedRect(10, currentY, pageWidth - 20, 22, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}. ${item.name.slice(0, 50)}`, 16, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SKU: ${item.sku} | Category: ${item.category} | Lead Time: ${item.leadTime}`, 16, currentY + 13);
    const certs = item.certifications.length > 0 ? item.certifications.join(", ") : "Standard";
    doc.text(`Certs: ${certs} | Export: ${item.exportAvailable ? "Yes" : "No"}`, 16, currentY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text(`${currSymbol}${item.lineTotal.toLocaleString()}`, pageWidth - 16, currentY + 7, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${item.quantity.toLocaleString()} x ${currSymbol}${item.unitPrice}`, pageWidth - 16, currentY + 13, { align: "right" });

    currentY += 25;
  });

  // Notes & AI section
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
      doc.roundedRect(10, currentY, pageWidth - 20, 14, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(251, 191, 36);
      doc.text("NOTES", 16, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(226, 232, 240);
      doc.text(notes.slice(0, 120), 16, currentY + 11);
      currentY += 18;
    }
    if (aiSuggestion) {
      doc.setFillColor(22, 78, 99);
      doc.roundedRect(10, currentY, pageWidth - 20, 18, 2, 2, "F");
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.2);
      doc.roundedRect(10, currentY, pageWidth - 20, 18, 2, 2, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(34, 211, 238);
      doc.text("AI PRICING RECOMMENDATION", 16, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240);
      const lines = doc.splitTextToSize(aiSuggestion.slice(0, 200), pageWidth - 40);
      doc.text(lines, 16, currentY + 11);
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 16, pageWidth, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 211, 238);
    doc.text("UpaHealth Supplies", 14, pageHeight - 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("adminupahealthsupplies@gmail.com | www.upahealthsupplies.com", 14, pageHeight - 4);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: "right" });
  }

  return doc;
}
