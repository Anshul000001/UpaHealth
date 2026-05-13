import { z } from "zod";

export const leadCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(["HOSPITAL", "GOVERNMENT", "DISTRIBUTOR", "HOSPITAL_CHAIN"]),
  contactPerson: z.string().min(2, "Contact person is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  estimatedValue: z.number().min(0).default(0),
  products: z.array(z.string()).default([]),
  nextFollowUp: z.string().optional(),
});

export const leadUpdateSchema = leadCreateSchema.partial().extend({
  stage: z.string().optional(),
  lastContactDate: z.string().optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
