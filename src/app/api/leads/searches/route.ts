export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leads/searches
 * Returns all past lead generation searches (history/folder).
 */
export const GET = apiHandler(async () => {
  await requireAuth("read");

  const searches = await prisma.leadSearch.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: searches });
});
