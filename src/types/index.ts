// Shared TypeScript interfaces for UpaHealth Platform

import type { UserRole, QuotationStatus, LeadType } from "@prisma/client";

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  nextCursor?: string;
}

// ============================================
// Auth Types
// ============================================

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ============================================
// Supplier Types
// ============================================

export interface SupplierCreateInput {
  name: string;
  location: string;
  contactPhone: string;
  email: string;
  certifications: string[];
  productCategories: string[];
  reliabilityScore?: number;
  trustScore?: number;
}

export interface SupplierUpdateInput extends Partial<SupplierCreateInput> {
  totalOrders?: number;
  onTimeDelivery?: number;
  qualityRejectionRate?: number;
}

// ============================================
// Product Types
// ============================================

export interface ProductCreateInput {
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  exportPrice: number;
  moq: number;
  unit: string;
  supplierId: string;
  leadTime: string;
  certifications: string[];
  exportAvailable?: boolean;
  stock?: number;
  targetMargin?: number;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;

// ============================================
// Quotation Types
// ============================================

export interface QuotationCreateInput {
  buyerName: string;
  buyerEmail?: string;
  buyerAddress?: string;
  buyerCountry?: string;
  currency: string;
  validityDays: number;
  freight?: number;
  notes?: string;
  leadId?: string;
  lineItems: QuotationLineItemInput[];
}

export interface QuotationLineItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  gstRate: number;
  discount: number;
}

export interface QuotationUpdateInput {
  status?: QuotationStatus;
  buyerName?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  currency?: string;
  validityDays?: number;
  freight?: number;
  notes?: string;
}

// ============================================
// Lead / CRM Types
// ============================================

export interface LeadCreateInput {
  name: string;
  type: LeadType;
  contactPerson: string;
  email?: string;
  phone?: string;
  estimatedValue?: number;
  products?: string[];
  nextFollowUp?: string; // ISO date string
}

export interface LeadUpdateInput extends Partial<LeadCreateInput> {
  stage?: string;
  lastContactDate?: string;
}

// ============================================
// AI Engine Types
// ============================================

export interface PricingSuggestion {
  productId: string;
  productName: string;
  costPrice: number;
  suggestedPrice: number;
  targetMargin: number;
  competitorRange?: { min: number; max: number };
  reasoning: string;
}

export interface ParsedRFQItem {
  productName: string;
  quantity?: number;
  specifications?: string;
  confidence: number; // 0-100
  needsReview: boolean;
}

export interface MarketIntelRecommendation {
  market: string;
  products: string[];
  opportunity: string;
  urgency: "high" | "medium" | "low";
}

// ============================================
// Analytics Types
// ============================================

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  activeQuotations: number;
  conversionRate: number;
  totalProducts: number;
  activeSuppliers: number;
  exportOrders: number;
  pendingRFQs: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}
