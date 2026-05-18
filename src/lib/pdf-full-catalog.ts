import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CatalogProduct {
  name: string;
  sku: string;
  category: string;
  moq: number;
  unit: string;
  price: number;
  exportPrice: number;
  certifications: string[];
}

interface FullCatalogOptions {
  products: CatalogProduct[];
  buyerName: string;
  buyerEmail: string;
  currency: "INR" | "USD";
  notes: string;
}

export function generateFullCatalogPDF(options: FullCatalogOptions): jsPDF {
  const { products, buyerName, buyerEmail, currency, notes } = options;
  const currSymbol = currency === "INR" ? "\u20B9" : "$";
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ─── Cover Page ───────────────────────────────────────
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Cover card
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(20, 50, pageWidth - 40, 95, 6, 6, "F");
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 50, pageWidth - 40, 95, 6, 6, "S");

  // Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(34, 211, 238);
  doc.text("UpaHealth Supplies", pageWidth / 2, 78, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("AI-ENABLED HEALTHCARE PROCUREMENT OS", pageWidth / 2, 87, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("COMPLETE PRODUCT RATE LIST", pageWidth / 2, 105, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Surgical Consumables Catalogue & Quotation", pageWidth / 2, 113, { align: "center" });

  // Stats
  const categories = [...new Set(products.map(p => p.category))];
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(30, 122, 45, 12, 2, 2, "F");
  doc.roundedRect(82, 122, 45, 12, 2, 2, "F");
  doc.roundedRect(134, 122, 45, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 211, 238);
  doc.text(`${products.length} Products`, 52.5, 129.5, { align: "center" });
  doc.setTextColor(16, 185, 129);
  doc.text(`${categories.length} Categories`, 104.5, 129.5, { align: "center" });
  doc.setTextColor(251, 191, 36);
  doc.text(`Valid: ${date}`, 156.5, 129.5, { align: "center" });

  // Buyer info
  if (buyerName || buyerEmail) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(20, 155, pageWidth - 40, 18, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 211, 238);
    doc.text("PREPARED FOR", 28, 163);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(buyerName || "Valued Customer", 28, 169);
    if (buyerEmail) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(buyerEmail, 100, 169);
    }
  }

  // Terms
  const termsY = 185;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, termsY, pageWidth - 40, 38, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36);
  doc.text("TERMS & CONDITIONS", 28, termsY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const terms = [
    "Prices inclusive of procurement & logistics margin",
    "GST / taxes applicable as per government norms",
    "Minimum order quantity (MOQ) = Box Size",
    "Delivery: 7-15 working days from order confirmation",
    "Payment: 50% advance, 50% before dispatch",
  ];
  terms.forEach((t, i) => doc.text(`\u2022 ${t}`, 28, termsY + 15 + i * 4.5));

  // Cover footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("UpaHealth Supplies | Ankleshwar, Gujarat, India", pageWidth / 2, pageHeight - 12, { align: "center" });
  doc.text("adminupahealthsupplies@gmail.com | www.upahealthsupplies.com", pageWidth / 2, pageHeight - 7, { align: "center" });

  // ─── Category Pages ───────────────────────────────────
  const byCategory: Record<string, CatalogProduct[]> = {};
  products.forEach((p) => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  const sortedCats = Object.keys(byCategory).sort();
  let grandTotal = 0;
  let itemNum = 0;

  for (const cat of sortedCats) {
    const catProducts = byCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
    doc.addPage();
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Category header
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(10, 8, pageWidth - 20, 16, 3, 3, "F");
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 8, pageWidth - 20, 16, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(34, 211, 238);
    doc.text(cat.toUpperCase(), 16, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${catProducts.length} products`, pageWidth - 16, 18, { align: "right" });

    // Table
    const tableData = catProducts.map((p) => {
      itemNum++;
      const price = currency === "INR" ? p.price : p.exportPrice;
      const boxPrice = price * p.moq;
      grandTotal += boxPrice;
      return [
        `${itemNum}`,
        p.sku,
        p.name.length > 38 ? p.name.slice(0, 35) + "..." : p.name,
        `${p.moq.toLocaleString()} ${p.unit}s`,
        `${currSymbol}${price.toFixed(2)}`,
        `${currSymbol}${boxPrice.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: 28,
      head: [["#", "SKU", "Product", "Box Size", "Price/Unit", "Box Price"]],
      body: tableData,
      theme: "plain",
      styles: {
        fontSize: 7.5, cellPadding: 2.5,
        textColor: [226, 232, 240], lineColor: [51, 65, 85], lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 118, 110], textColor: [255, 255, 255],
        fontStyle: "bold", fontSize: 7,
      },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      bodyStyles: { fillColor: [17, 24, 39] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 26 },
        2: { cellWidth: 70 },
        3: { cellWidth: 24, halign: "center" },
        4: { cellWidth: 24, halign: "right" },
        5: { cellWidth: 26, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 10, right: 10 },
      willDrawPage: () => {
        doc.setFillColor(11, 18, 32);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      },
    });
  }

  // ─── Summary Page ─────────────────────────────────────
  doc.addPage();
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(17, 24, 39);
  doc.roundedRect(20, 30, pageWidth - 40, 55, 4, 4, "F");
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, 30, pageWidth - 40, 55, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CATALOG SUMMARY", pageWidth / 2, 44, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Total Products: ${products.length}`, 32, 55);
  doc.text(`Categories: ${sortedCats.length}`, 32, 62);
  doc.text(`Currency: ${currency}`, 32, 69);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Full Catalog Value (1 box each):", pageWidth - 32, 55, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`${currSymbol}${grandTotal.toLocaleString()}`, pageWidth - 32, 68, { align: "right" });

  if (notes) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(20, 95, pageWidth - 40, 18, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36);
    doc.text("SPECIAL NOTES", 28, 103);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(notes.slice(0, 150), 28, 109);
  }

  // Page numbers on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: "right" });
  }

  return doc;
}
