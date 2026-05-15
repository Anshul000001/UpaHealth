export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const POST = apiHandler(async (_req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const tender = await prisma.tender.update({
    where: { id },
    data: { saved: true },
  });
  return NextResponse.json({ success: true, data: tender });
});
