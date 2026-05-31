import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function generateQuotationId(): string {
  const prefix = "UH-QT";
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `${prefix}-${date}-${random}`;
}

/**
 * Get the current financial year string (e.g., "2025-26").
 */
export function getFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Indian financial year: April to March
  if (month >= 3) {
    // April onwards = current year to next year
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  // Jan-March = previous year to current year
  return `${year - 1}-${year.toString().slice(2)}`;
}

/**
 * Generate a professional company reference number.
 * Format: {prefix}/{FY}/{type}/{sequential}
 * e.g., UH/2025-26/QT/0001, UH/2025-26/CAT/0015, UH/2025-26/PRJ/0003
 */
export function formatCompanyRef(
  prefix: string,
  type: "QT" | "CAT" | "PRJ" | "RFQ" | "REQ" | "PO",
  sequentialNumber: number
): string {
  const fy = getFinancialYear();
  const seq = sequentialNumber.toString().padStart(4, "0");
  return `${prefix}/${fy}/${type}/${seq}`;
}

/**
 * Generate a project/document tracking number.
 * Format: {prefix}-{type}-{YYYYMMDD}-{seq}
 * e.g., UH-QT-20250527-0001
 */
export function formatDocumentNumber(
  prefix: string,
  type: string,
  sequentialNumber: number
): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = sequentialNumber.toString().padStart(4, "0");
  return `${prefix}-${type}-${date}-${seq}`;
}

export function calculateMargin(costPrice: number, sellingPrice: number): number {
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function calculateGST(amount: number, rate: number): number {
  return amount * (rate / 100);
}
