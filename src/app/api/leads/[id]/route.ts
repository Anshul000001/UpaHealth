import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getLeadById, updateLead } from "@/lib/services/lead-service";
import { leadUpdateSchema } from "@/lib/validators/lead";

export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: lead });
});

export const PUT = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();
  const parsed = leadUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  }
  const lead = await updateLead(id, parsed.data);
  return NextResponse.json({ success: true, data: lead });
});
