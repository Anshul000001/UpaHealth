export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getQuotations, createQuotation } from "@/lib/services/quotation-service";
import { quotationCreateSchema } from "@/lib/validators/quotation";

export const GET = apiHandler(async (req) => {
  const session = await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const result = await getQuotations({
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    pageSize: Number(searchParams.get("pageSize") ?? 20),
    userId: session.user.role === "VIEWER" ? session.user.id : undefined,
  });
  return NextResponse.json({ success: true, data: result.data, meta: { total: result.total, nextCursor: result.nextCursor } });
});

export const POST = apiHandler(async (req) => {
  const session = await requireAuth("write");
  const body = await req.json();
  const parsed = quotationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const quotation = await createQuotation(parsed.data, session.user.id);
  return NextResponse.json({ success: true, data: quotation }, { status: 201 });
});
