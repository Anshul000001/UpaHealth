export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AGENTS } from "@/lib/agents/registry";

export const GET = apiHandler(async () => {
  await requireAuth("read");

  const dbAgents = await prisma.aIAgent.findMany({
    orderBy: { name: "asc" },
  });

  // Merge registry with DB stats so newly added agents always appear
  const merged = AGENTS.map((def) => {
    const db = dbAgents.find((a) => a.name === def.name);
    return {
      name: def.name,
      role: def.role,
      description: def.description,
      capabilities: def.capabilities,
      schedule: def.schedule,
      status: db?.status ?? "active",
      lastRunAt: db?.lastRunAt ?? null,
      totalRuns: db?.totalRuns ?? 0,
      successRuns: db?.successRuns ?? 0,
      failedRuns: db?.failedRuns ?? 0,
      id: db?.id ?? null,
    };
  });

  return NextResponse.json({ success: true, data: merged });
});
