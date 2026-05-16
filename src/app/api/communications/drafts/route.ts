export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/communications/drafts
 * Returns all AI-generated email drafts from lead gen.
 */
export const GET = apiHandler(async () => {
  await requireAuth("read");

  const drafts = await prisma.outreachEmail.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: drafts });
});
