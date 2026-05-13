export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getLeads, createLead } from "@/lib/services/lead-service";
import { leadCreateSchema } from "@/lib/validators/lead";

export const GET = apiHandler(async (req) => {
  await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const result = await getLeads({
    search: searchParams.get("search") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });
  return NextResponse.json({ success: true, data: result.data, meta: { total: result.total, nextCursor: result.nextCursor } });
});

export const POST = apiHandler(async (req) => {
  await requireAuth("write");
  const body = await req.json();
  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const lead = await createLead(parsed.data);
  return NextResponse.json({ success: true, data: lead }, { status: 201 });
});
