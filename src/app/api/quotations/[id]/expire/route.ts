import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { updateQuotation } from "@/lib/services/quotation-service";

export const POST = apiHandler(async (_req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const quotation = await updateQuotation(id, { status: "EXPIRED" });
  return NextResponse.json({ success: true, data: quotation });
});
