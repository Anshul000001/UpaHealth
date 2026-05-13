import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY_INFO } from "./constants";

interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discount: number;
  total: number;
}

interface QuotationData {
  quotationId: string;
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  currency: string;
  currencySymbol: string;
  validityDays: number;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  totalGST: number;
  freight: number;
  grandTotal: number;
  notes: string;
}

export function generateQuotationPDF(data: QuotationData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Colors
  const primaryColor: [number, number, number] = [6, 182, 212]; // cyan-500
  const darkColor: [number, number, number] = [15, 23, 42]; // slate-900
  const textColor: [number, number, number] = [30, 41, 59]; // slate-800
  const lightGray: [number, number, number] = [148, 163, 184]; // slate-400

  // === HEADER SECTION ===
  // Top accent bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Company Logo area
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 12, 32, 32, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("UH", margin + 16, 32, { align: "center" });

  // Company Name
  doc.setTextColor(...darkColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("UpaHealth Supplies", margin + 38, 24);

  // Tagline
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Enabled Healthcare Sourcing Intelligence", margin + 38, 32);
  doc.text(COMPANY_INFO.email, margin + 38, 38);

  // QUOTATION title - right aligned
  doc.setTextColor(...primaryColor);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - margin, 24, { align: "right" });

  // Quotation ID
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${data.quotationId}`, pageWidth - margin, 32, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 38, { align: "right" });
  doc.text(`Valid for: ${data.validityDays} days`, pageWidth - margin, 44, { align: "right" });

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, 50, pageWidth - margin, 50);

  // === BUYER DETAILS ===
  let yPos = 60;

  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION TO:", margin, yPos);

  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.buyerName || "—", margin, yPos + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.buyerEmail) {
    doc.text(data.buyerEmail, margin, yPos + 15);
  }
  if (data.buyerAddress) {
    doc.text(data.buyerAddress, margin, yPos + 22);
  }

  // Currency info on right
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENCY:", pageWidth - margin - 40, yPos);
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.currency, pageWidth - margin - 40, yPos + 8);

  yPos += 35;

  // === ITEMS TABLE ===
  const tableData = data.items
    .filter((item) => item.productName)
    .map((item, index) => {
      return [
        (index + 1).toString(),
        item.productName,
        item.quantity.toString(),
        `${data.currencySymbol}${item.unitPrice.toFixed(2)}`,
        item.discount > 0 ? `${item.discount}%` : "—",
        `${item.gstRate}%`,
        `${data.currencySymbol}${item.total.toFixed(2)}`,
      ];
    });

  if (tableData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["#", "Product / Description", "Qty", "Unit Price", "Disc.", "GST", "Total"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 60 },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 15, halign: "center" },
        6: { cellWidth: 30, halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    // Get the Y position after the table
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setTextColor(...lightGray);
    doc.setFontSize(10);
    doc.text("No items added to this quotation.", margin, yPos + 10);
    yPos += 30;
  }

  // === TOTALS SECTION ===
  const totalsX = pageWidth - margin - 70;
  const totalsWidth = 70;

  // Background for totals
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsX - 5, yPos, totalsWidth + 10, 65, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);

  const drawTotalLine = (label: string, value: string, y: number, bold = false) => {
    if (bold) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }
    doc.text(label, totalsX, y);
    doc.text(value, totalsX + totalsWidth, y, { align: "right" });
  };

  drawTotalLine("Subtotal:", `${data.currencySymbol}${data.subtotal.toFixed(2)}`, yPos + 10);
  drawTotalLine("Discount:", `-${data.currencySymbol}${data.totalDiscount.toFixed(2)}`, yPos + 20);
  drawTotalLine("GST:", `${data.currencySymbol}${data.totalGST.toFixed(2)}`, yPos + 30);
  drawTotalLine("Freight:", `${data.currencySymbol}${data.freight.toFixed(2)}`, yPos + 40);

  // Grand total line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(totalsX, yPos + 45, totalsX + totalsWidth, yPos + 45);

  doc.setTextColor(...primaryColor);
  drawTotalLine("GRAND TOTAL:", `${data.currencySymbol}${data.grandTotal.toFixed(2)}`, yPos + 55, true);

  yPos += 75;

  // === TERMS & NOTES ===
  if (data.notes) {
    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS:", margin, yPos);

    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, yPos + 8);
    yPos += 8 + splitNotes.length * 4;
  }

  // === DEFAULT TERMS ===
  yPos += 10;
  doc.setTextColor(...lightGray);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const defaultTerms = [
    `• This quotation is valid for ${data.validityDays} days from the date of issue.`,
    "• Prices are exclusive of transportation unless specified.",
    "• Payment terms: As mutually agreed.",
    "• Delivery: Subject to stock availability and order confirmation.",
    "• All products are CDSCO compliant and certified as per specifications.",
  ];
  defaultTerms.forEach((term, i) => {
    doc.text(term, margin, yPos + i * 5);
  });

  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 20;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(...lightGray);
  doc.setFontSize(7);
  doc.text("UpaHealth Supplies | AI-Enabled Healthcare Sourcing Intelligence", margin, footerY);
  doc.text(COMPANY_INFO.email, margin, footerY + 5);

  doc.setTextColor(...primaryColor);
  doc.text("www.upahealthsupplies.com", pageWidth - margin, footerY, { align: "right" });
  doc.text("CONFIDENTIAL", pageWidth - margin, footerY + 5, { align: "right" });

  // Save the PDF
  doc.save(`${data.quotationId}.pdf`);
}
