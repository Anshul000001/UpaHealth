export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { apiHandler, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agents/runs?agent=CEO&limit=20
 * Returns recent agent task runs and reports.
 */
export const GET = apiHandler(async (req) => {
  await requireAuth("read");
  const { searchParams } = new URL(req.url);
  const agentName = searchParams.get("agent");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

  const where = agentName
    ? { agent: { name: agentName } }
    : {};

  const tasks = await prisma.aITask.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { agent: { select: { name: true, role: true } } },
  });

  return NextResponse.json({ success: true, data: tasks });
});
