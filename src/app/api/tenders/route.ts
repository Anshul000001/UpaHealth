export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req) => {
  await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") ?? undefined;
  const saved = searchParams.get("saved");
  const minScore = parseInt(searchParams.get("minScore") ?? "0");

  const tenders = await prisma.tender.findMany({
    where: {
      ...(source ? { source } : {}),
      ...(saved === "true" ? { saved: true } : {}),
      aiMatchScore: { gte: minScore },
    },
    orderBy: [{ aiMatchScore: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({ success: true, data: tenders });
});
