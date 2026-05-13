import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getSupplierById, updateSupplier, archiveSupplier } from "@/lib/services/supplier-service";
import { supplierUpdateSchema } from "@/lib/validators/supplier";

export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;
  const supplier = await getSupplierById(id);
  if (!supplier) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Supplier not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: supplier });
});

export const PUT = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();
  const parsed = supplierUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const supplier = await updateSupplier(id, parsed.data);
  return NextResponse.json({ success: true, data: supplier });
});

export const DELETE = apiHandler(async (_req, { params }) => {
  await requireAuth("delete");
  const { id } = await params;
  await archiveSupplier(id);
  return NextResponse.json({ success: true, data: { archived: true } });
});
