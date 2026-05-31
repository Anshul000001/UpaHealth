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
  companyRef?: string;
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

/** Inline SVG of the UpaHealth mark (kept here so PDFs work offline/SSR-safe). */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22c55e"/>
      <stop offset="0.5" stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#1e40af"/>
    </linearGradient>
    <linearGradient id="g2" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#5eead4"/>
      <stop offset="0.5" stop-color="#06b6d4"/>
      <stop offset="1" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <path d="M43 5 L57 5 A8 8 0 0 1 65 13 L65 35 L87 35 A8 8 0 0 1 95 43 L95 57 A8 8 0 0 1 87 65 L65 65 L65 87 A8 8 0 0 1 57 95 L43 95 A8 8 0 0 1 35 87 L35 65 L13 65 A8 8 0 0 1 5 57 L5 43 A8 8 0 0 1 13 35 L35 35 L35 13 A8 8 0 0 1 43 5 Z" fill="none" stroke="url(#g1)" stroke-width="6" stroke-linejoin="round"/>
  <path d="M50 22 C 70 36 70 64 50 80 C 30 64 30 36 50 22 Z" fill="url(#g2)"/>
  <path d="M50 28 C 50 40 50 60 50 74" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

/** Rasterize the brand SVG to a PNG data URL using a canvas (browser-only). */
async function getLogoDataUrl(pixelSize = 256): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const blob = new Blob([LOGO_SVG], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
    const el = await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, pixelSize, pixelSize);
    ctx.drawImage(el, 0, 0, pixelSize, pixelSize);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function generateQuotationPDF(data: QuotationData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Brand palette — aligned to the new UpaHealth logo (green → teal → deep blue).
  const brandTeal: [number, number, number] = [13, 148, 136]; // teal-600
  const brandBlue: [number, number, number] = [30, 58, 138]; // blue-900
  const brandGreen: [number, number, number] = [34, 197, 94]; // green-500
  const darkColor: [number, number, number] = [15, 23, 42]; // slate-900
  const textColor: [number, number, number] = [30, 41, 59]; // slate-800
  const lightGray: [number, number, number] = [148, 163, 184]; // slate-400

  // === HEADER SECTION ===
  // Top accent bar — teal → blue tri-segment for the brand gradient feel.
  const segW = pageWidth / 3;
  doc.setFillColor(...brandGreen);
  doc.rect(0, 0, segW, 4, "F");
  doc.setFillColor(...brandTeal);
  doc.rect(segW, 0, segW, 4, "F");
  doc.setFillColor(...brandBlue);
  doc.rect(segW * 2, 0, pageWidth - segW * 2, 4, "F");

  // Logo block — embed the rasterized SVG mark on a white panel for contrast.
  const logoDataUrl = await getLogoDataUrl(256);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...brandTeal);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, 12, 32, 32, 4, 4, "FD");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin + 2, 14, 28, 28, undefined, "FAST");
  } else {
    // Fallback: stylized cross + leaf in flat brand colors if rasterization fails.
    doc.setFillColor(...brandTeal);
    doc.roundedRect(margin + 6, 18, 20, 6, 1.5, 1.5, "F");
    doc.roundedRect(margin + 13, 11, 6, 20, 1.5, 1.5, "F");
    doc.setTextColor(...brandBlue);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Upa", margin + 16, 38, { align: "center" });
  }

  // Wordmark — "Upa" in deep blue, "Health" in teal, matching the brand.
  doc.setTextColor(...brandBlue);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Upa", margin + 38, 24);
  const upaW = doc.getTextWidth("Upa");
  doc.setTextColor(...brandTeal);
  doc.text("Health", margin + 38 + upaW, 24);

  // Tagline — exact phrasing from the brand mark.
  doc.setTextColor(...brandTeal);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("YOUR PATH TO WELLNESS", margin + 38, 30, { charSpace: 1.2 });

  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Enabled Healthcare Sourcing Intelligence", margin + 38, 36);
  doc.text(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, margin + 38, 41);

  // QUOTATION title — right aligned, brand-blue.
  doc.setTextColor(...brandBlue);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - margin, 24, { align: "right" });

  // Company Reference Number (prominent)
  if (data.companyRef) {
    doc.setTextColor(...brandTeal);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(data.companyRef, pageWidth - margin, 32, { align: "right" });
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Doc ID: ${data.quotationId}`, pageWidth - margin, 38, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 44, { align: "right" });
    doc.text(`Valid for: ${data.validityDays} days`, pageWidth - margin, 50, { align: "right" });
  } else {
    // Quotation ID (fallback if no company ref)
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Ref: ${data.quotationId}`, pageWidth - margin, 32, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 38, { align: "right" });
    doc.text(`Valid for: ${data.validityDays} days`, pageWidth - margin, 44, { align: "right" });
  }

  // Divider line — brand teal.
  const dividerY = data.companyRef ? 56 : 50;
  doc.setDrawColor(...brandTeal);
  doc.setLineWidth(0.5);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);

  // === BUYER DETAILS ===
  let yPos = dividerY + 10;

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
        fillColor: brandBlue,
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
        fillColor: [240, 253, 250], // teal-50
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

  // Soft brand-tinted background for totals card.
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(...brandTeal);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX - 5, yPos, totalsWidth + 10, 65, 2, 2, "FD");

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

  // Grand total separator
  doc.setDrawColor(...brandTeal);
  doc.setLineWidth(0.4);
  doc.line(totalsX, yPos + 45, totalsX + totalsWidth, yPos + 45);

  doc.setTextColor(...brandBlue);
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

  doc.setDrawColor(...brandTeal);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(...lightGray);
  doc.setFontSize(7);
  doc.text("UpaHealth Supplies | Your Path to Wellness", margin, footerY);
  doc.text(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, margin, footerY + 5);

  doc.setTextColor(...brandTeal);
  doc.text(COMPANY_INFO.website, pageWidth - margin, footerY, { align: "right" });
  doc.text("CONFIDENTIAL", pageWidth - margin, footerY + 5, { align: "right" });

  // Save the PDF
  doc.save(`${data.quotationId}.pdf`);
}
