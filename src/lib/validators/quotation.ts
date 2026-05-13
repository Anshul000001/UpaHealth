import { z } from "zod";

export const lineItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  costPrice: z.number().min(0),
  gstRate: z.number().min(0).max(100),
  discount: z.number().min(0).max(100),
});

export const quotationCreateSchema = z.object({
  buyerName: z.string().min(2, "Buyer name is required"),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  buyerAddress: z.string().optional(),
  buyerCountry: z.string().optional(),
  currency: z.string().default("INR"),
  validityDays: z.number().int().positive().default(30),
  freight: z.number().min(0).default(0),
  notes: z.string().optional(),
  leadId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
});

export const quotationUpdateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  buyerName: z.string().min(2).optional(),
  buyerEmail: z.string().email().optional(),
  buyerAddress: z.string().optional(),
  currency: z.string().optional(),
  validityDays: z.number().int().positive().optional(),
  freight: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;
