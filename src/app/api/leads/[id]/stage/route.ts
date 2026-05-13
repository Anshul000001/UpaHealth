import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { advanceLeadStage } from "@/lib/services/lead-service";
import { z } from "zod";

const stageSchema = z.object({ stage: z.string().min(1) });

export const PUT = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Stage is required" } }, { status: 400 });
  }
  const [lead] = await advanceLeadStage(id, parsed.data.stage);
  return NextResponse.json({ success: true, data: lead });
});
