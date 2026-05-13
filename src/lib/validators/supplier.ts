import { z } from "zod";

export const supplierCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  contactPhone: z.string().min(7, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  certifications: z.array(z.string()).default([]),
  productCategories: z.array(z.string()).default([]),
  reliabilityScore: z.number().min(0).max(100).default(0),
  trustScore: z.number().min(0).max(100).default(0),
  onTimeDelivery: z.number().min(0).max(100).default(0),
  qualityRejectionRate: z.number().min(0).max(100).default(0),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
