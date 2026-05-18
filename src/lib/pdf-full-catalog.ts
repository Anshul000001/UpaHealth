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
  const currSymbol = currency === "INR" ? "₹" : "$";
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ─── Page 1: Cover ────────────────────────────────────
  doc.setFillColor(11, 18, 32);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative gradient shapes
  doc.setFillColor(34, 211, 238, 0.05);
  doc.circle(pageWidth * 0.7, 40, 50, "F");
  doc.setFillColor(16, 185, 129, 0.03);
  doc.circle(30, pageHeight * 0.6, 60, "F");

  // Main cover card
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(20, 50, pageWidth - 40, 100, 6, 6, "F");
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 50, pageWidth - 40, 100, 6, 6, "S");

  // Company branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(34, 211, 238);
  doc.text("Upa", pageWidth / 2 - 20, 80, { align: "center" });
  doc.setTextColor(45, 212, 191);
  doc.text("Health", pageWidth / 2 + 15, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("PROCUREMENT OS | AI-ENABLED HEALTHCARE SOURCING", pageWidth / 2, 90, { align: "center" });

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("COMPLETE PRODUCT RATE LIST", pageWidth / 2, 110, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text("Surgical Consumables Catalogue & Quotation", pageWidth / 2, 118, { align: "center" });

  // Stats badges
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(35, 130, 40, 12, 2, 2, "F");
  doc.roundedRect(85, 130, 40, 12, 2, 2, "F");
  doc.roundedRect(135, 130, 40, 12, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 211, 238);
  doc.text(`${products.length} Products`, 55, 137.5, { align: "center" });

  const categories = [...new Set(products.map(p => p.category))];
  doc.setTextColor(16, 185, 129);
  doc.text(`${categories.length} Categories`, 105, 137.5, { align: "center" });

  doc.setTextColor(251, 191, 36);
  doc.text(`Valid: ${date}`, 155, 137.5, { align: "center" });

  // Buyer info on cover
  if (buyerName || buyerEmail) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(20, 160, pageWidth - 40, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 211, 238);
    doc.text("PREPARED FOR", 28, 168);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(buyerName || "Valued Customer", 28, 175);
    if (buyerEmail) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(buyerEmail, 100, 175);
    }
  }

  // Terms section
  let termsY = 195;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, termsY, pageWidth - 40, 42, 3, 3, "F");
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.15);
  doc.roundedRect(20, termsY, pageWidth - 40, 42, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36);
  doc.text("TERMS & CONDITIONS", 28, termsY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const terms = [
    "• Prices inclusive of procurement & logistics margin",
    "• GST / taxes applicable as per government norms",
    "• Minimum order quantity (MOQ) = Box Size",
    "• Delivery: 7-15 working days from order confirmation",
    "• Payment: 50% advance, 50% before dispatch",
  ];
  terms.forEach((t, i) => doc.text(t, 28, termsY + 15 + i * 5));

  // Footer on cover
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("UpaHealth Supplies | Ankleshwar, Gujarat, India", pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text("adminupahealthsupplies@gmail.com | www.upahealthsupplies.com", pageWidth / 2, pageHeight - 10, { align: "center" });

  // ─── Product Pages by Category ────────────────────────
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

    // New page for each category
    doc.addPage();
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Category header
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(10, 8, pageWidth - 20, 18, 3, 3, "F");
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 8, pageWidth - 20, 18, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(34, 211, 238);
    doc.text(cat.toUpperCase(), 16, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${catProducts.length} products`, pageWidth - 16, 19, { align: "right" });

    // Category table
    const tableData = catProducts.map((p) => {
      itemNum++;
      const price = currency === "INR" ? p.price : p.exportPrice;
      const boxPrice = price * p.moq;
      grandTotal += boxPrice;
      return [
        `${itemNum}`,
        p.sku,
        p.name.length > 40 ? p.name.slice(0, 37) + "..." : p.name,
        `${p.moq.toLocaleString()} ${p.unit}s`,
        `${currSymbol}${price.toFixed(2)}`,
        `${currSymbol}${boxPrice.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [["#", "SKU", "Product Description", "Box Size", "Price/Unit", "Box Price"]],
      body: tableData,
      theme: "plain",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [226, 232, 240],
        lineColor: [51, 65, 85],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [15, 23, 42],
      },
      bodyStyles: {
        fillColor: [17, 24, 39],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 28 },
        2: { cellWidth: 68 },
        3: { cellWidth: 24, halign: "center" },
        4: { cellWidth: 24, halign: "right" },
        5: { cellWidth: 26, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 10, right: 10 },
      didDrawPage: () => {
        doc.setFillColor(11, 18, 32);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      },
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

  // Summary card
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(20, 30, pageWidth - 40, 60, 4, 4, "F");
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, 30, pageWidth - 40, 60, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CATALOG SUMMARY", pageWidth / 2, 45, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Total Products: ${products.length}`, 35, 58);
  doc.text(`Categories: ${sortedCats.length}`, 35, 65);
  doc.text(`Currency: ${currency}`, 35, 72);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Full Catalog Value (1 box each):", pageWidth - 35, 58, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`${currSymbol}${grandTotal.toLocaleString()}`, pageWidth - 35, 72, { align: "right" });

  // Notes
  if (notes) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(20, 100, pageWidth - 40, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36);
    doc.text("SPECIAL NOTES", 28, 108);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(notes.slice(0, 150), 28, 115);
  }

  // Footer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(34, 211, 238);
  doc.text("UpaHealth Supplies", pageWidth / 2, pageHeight - 30, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("India's AI-Enabled Healthcare Sourcing & Surgical Consumables Partner", pageWidth / 2, pageHeight - 24, { align: "center" });
  doc.text("adminupahealthsupplies@gmail.com | www.upahealthsupplies.com | Ankleshwar, Gujarat", pageWidth / 2, pageHeight - 19, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("All prices subject to change without notice.", pageWidth / 2, pageHeight - 13, { align: "center" });

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: "right" });
  }

  return doc;
}
