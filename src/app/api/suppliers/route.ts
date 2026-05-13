export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getSuppliers, createSupplier } from "@/lib/services/supplier-service";
import { supplierCreateSchema } from "@/lib/validators/supplier";

export const GET = apiHandler(async (req) => {
  await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const result = await getSuppliers({
    search: searchParams.get("search") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });
  return NextResponse.json({ success: true, data: result.data, meta: { total: result.total, nextCursor: result.nextCursor } });
});

export const POST = apiHandler(async (req) => {
  await requireAuth("write");
  const body = await req.json();
  const parsed = supplierCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const supplier = await createSupplier(parsed.data);
  return NextResponse.json({ success: true, data: supplier }, { status: 201 });
});
