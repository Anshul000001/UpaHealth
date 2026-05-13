export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getProducts, createProduct } from "@/lib/services/product-service";
import { productCreateSchema } from "@/lib/validators/product";

export const GET = apiHandler(async (req) => {
  await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const result = await getProducts({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });
  return NextResponse.json({ success: true, data: result.data, meta: { total: result.total, nextCursor: result.nextCursor } });
});

export const POST = apiHandler(async (req) => {
  await requireAuth("write");
  const body = await req.json();
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const product = await createProduct(parsed.data);
  return NextResponse.json({ success: true, data: product }, { status: 201 });
});
