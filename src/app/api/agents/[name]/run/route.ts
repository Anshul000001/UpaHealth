export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { apiHandler, requireAuth } from "@/lib/rbac";
import { runAgent } from "@/lib/agents/runner";

/**
 * POST /api/agents/:name/run
 * Body: { prompt?: string }
 *
 * Triggers an agent run. Used by:
 * - Dashboard "Run Now" button
 * - n8n cron workflows
 * - Internal orchestration
 */
export const POST = apiHandler(async (req, { params }) => {
  await requireAuth("write");

  const { name } = await params;
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt : undefined;

  const result = await runAgent(name, prompt);
  return NextResponse.json({ success: result.success, data: result });
});
