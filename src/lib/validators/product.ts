import { z } from "zod";

const productBaseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(2, "SKU is required"),
  costPrice: z.number().positive("Cost price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  exportPrice: z.number().positive("Export price must be positive"),
  moq: z.number().int().positive("MOQ must be a positive integer"),
  unit: z.string().min(1, "Unit is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  leadTime: z.string().min(1, "Lead time is required"),
  certifications: z.array(z.string()).default([]),
  exportAvailable: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
  targetMargin: z.number().min(0).max(100).optional(),
  competitorPriceMin: z.number().positive().optional(),
  competitorPriceMax: z.number().positive().optional(),
});

export const productCreateSchema = productBaseSchema.refine(
  (d) => d.sellingPrice > d.costPrice,
  {
    message: "Selling price must be greater than cost price",
    path: ["sellingPrice"],
  }
);

// Use partial on the base schema (without refine) for updates
export const productUpdateSchema = productBaseSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
