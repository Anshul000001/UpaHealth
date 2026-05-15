/**
 * Agent Runner — executes any AI agent with full DB context.
 * Used by API endpoints, cron jobs, and n8n workflows.
 */

import { prisma } from "@/lib/prisma";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { getAgentByName, type AgentDefinition } from "./registry";

interface RunResult {
  success: boolean;
  output?: string;
  parsed?: unknown;
  error?: string;
  durationMs: number;
}

/**
 * Build live business context that gets injected into every agent run.
 * Each agent gets the same factual base; the system prompt shapes their lens.
 */
async function buildContext(): Promise<string> {
  const [productCount, supplierCount, leadCount, openTenders, recentLeads] =
    await Promise.all([
      prisma.product.count(),
      prisma.supplier.count({ where: { archived: false } }),
      prisma.lead.count(),
      prisma.tender.count({ where: { status: "open" } }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: { name: true, type: true, stage: true, estimatedValue: true },
      }),
    ]);

  const totalPipeline = await prisma.lead.aggregate({
    _sum: { estimatedValue: true },
  });

  return `# Live Business Snapshot
- Products: ${productCount}
- Active Suppliers: ${supplierCount}
- Total Leads: ${leadCount}
- Open Tenders: ${openTenders}
- Pipeline Value: ₹${((totalPipeline._sum.estimatedValue ?? 0) / 100000).toFixed(1)}L

## Recent Leads:
${recentLeads.map((l) => `- ${l.name} (${l.type}) | ${l.stage} | ₹${(l.estimatedValue / 100000).toFixed(1)}L`).join("\n") || "No leads yet"}
`;
}

export async function runAgent(
  agentName: string,
  customInput?: string
): Promise<RunResult> {
  const start = Date.now();
  const def = getAgentByName(agentName);
  if (!def) {
    return { success: false, error: `Agent "${agentName}" not found`, durationMs: 0 };
  }

  // Ensure agent record exists in DB
  const agent = await prisma.aIAgent.upsert({
    where: { name: def.name },
    update: {},
    create: {
      name: def.name,
      role: def.role,
      description: def.description,
      capabilities: def.capabilities,
      systemPrompt: def.systemPrompt,
      schedule: def.schedule ?? null,
      modelProvider: "nvidia",
      modelName: NVIDIA_MODEL,
    },
  });

  // Create task record
  const task = await prisma.aITask.create({
    data: {
      agentId: agent.id,
      title: `${def.name} run`,
      status: "running",
      startedAt: new Date(),
      input: customInput ? { prompt: customInput } : {},
    },
  });

  try {
    const context = await buildContext();
    const userPrompt = customInput
      ? `${context}\n\n## Specific Task\n${customInput}`
      : `${context}\n\n## Task\nExecute your scheduled responsibilities for today and produce your structured output.`;

    const completion = await nvidiaAI.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: def.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });

    const output = completion.choices[0]?.message?.content ?? "";
    const durationMs = Date.now() - start;

    // Try to parse JSON output if the agent returns structured data
    let parsed: unknown = null;
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        // not JSON, that's fine
      }
    }

    // Update task as completed
    await prisma.aITask.update({
      where: { id: task.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        durationMs,
        output: { text: output, parsed: parsed ?? null },
      },
    });

    // Update agent stats
    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        lastRunAt: new Date(),
        totalRuns: { increment: 1 },
        successRuns: { increment: 1 },
      },
    });

    // Log activity
    await prisma.aIActivity.create({
      data: {
        agentId: agent.id,
        action: "completed_run",
        success: true,
        details: { durationMs, hasStructuredOutput: !!parsed },
      },
    });

    // Persist as a report
    await prisma.aIReport.create({
      data: {
        agentId: agent.id,
        type: `${def.name.toLowerCase()}_${customInput ? "task" : "scheduled"}`,
        title: `${def.role} — ${new Date().toLocaleDateString("en-IN")}`,
        summary: output.slice(0, 500),
        data: { fullOutput: output, parsed: parsed ?? null },
        insights: [],
        recommendations: [],
      },
    });

    return { success: true, output, parsed: parsed ?? undefined, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err.message : "Unknown error";

    await prisma.aITask.update({
      where: { id: task.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        durationMs,
        error,
      },
    });

    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        lastRunAt: new Date(),
        totalRuns: { increment: 1 },
        failedRuns: { increment: 1 },
      },
    });

    return { success: false, error, durationMs };
  }
}

export async function runAllAgents() {
  const results: Record<string, RunResult> = {};
  const { AGENTS } = await import("./registry");
  for (const def of AGENTS) {
    results[def.name] = await runAgent(def.name);
  }
  return results;
}
