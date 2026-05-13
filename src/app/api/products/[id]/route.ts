import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/product-service";
import { productUpdateSchema } from "@/lib/validators/product";

export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
});

export const PUT = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const product = await updateProduct(id, parsed.data);
  return NextResponse.json({ success: true, data: product });
});

export const DELETE = apiHandler(async (_req, { params }) => {
  await requireAuth("delete");
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ success: true, data: { deleted: true } });
});
