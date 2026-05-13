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

export function calculateMargin(costPrice: number, sellingPrice: number): number {
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function calculateGST(amount: number, rate: number): number {
  return amount * (rate / 100);
}
