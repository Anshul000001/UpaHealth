import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getQuotationById, updateQuotation } from "@/lib/services/quotation-service";
import { quotationUpdateSchema } from "@/lib/validators/quotation";

export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;
  const quotation = await getQuotationById(id);
  if (!quotation) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Quotation not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: quotation });
});

export const PUT = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();
  const parsed = quotationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const quotation = await updateQuotation(id, parsed.data);
  return NextResponse.json({ success: true, data: quotation });
});
