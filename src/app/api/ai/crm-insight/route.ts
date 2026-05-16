export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ai/crm-insight
 * NVIDIA AI scores a lead and recommends next action.
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json();
  const { leadId } = body;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });
  }

  const daysSinceContact = lead.lastContactDate
    ? Math.floor((Date.now() - new Date(lead.lastContactDate).getTime()) / 86400000)
    : null;

  const prompt = `You are a B2B sales intelligence AI for UpaHealth Supplies — Indian healthcare sourcing company.

Analyze this lead and provide actionable intelligence:

Lead Details:
- Name: ${lead.name}
- Type: ${lead.type}
- Stage: ${lead.stage}
- Estimated Value: ₹${(lead.estimatedValue / 100000).toFixed(1)}L
- Products Interest: ${lead.products.join(", ") || "General"}
- Contact Person: ${lead.contactPerson}
- Email: ${lead.email || "Not provided"}
- Phone: ${lead.phone || "Not provided"}
- Last Contact: ${daysSinceContact !== null ? `${daysSinceContact} days ago` : "Never contacted"}
- Next Follow-up: ${lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN") : "Not set"}

Provide:
1. Lead score (0-100) with reasoning
2. Deal close probability (%)
3. Single best next action (specific, actionable)
4. Risk factors (if any)
5. Recommended message tone

Respond in JSON:
{
  "score": 75,
  "closeProbability": 60,
  "nextAction": "Send product catalogue with IV set pricing by tomorrow",
  "reasoning": "2-sentence explanation",
  "risks": ["risk1"],
  "tone": "professional and urgent"
}`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
    temperature: 0.2,
  });

  const output = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = output.match(/\{[\s\S]*\}/);

  let insight = { score: 50, closeProbability: 40, nextAction: "Follow up with the lead", reasoning: "Analysis unavailable", risks: [], tone: "professional" };
  if (jsonMatch) {
    try { insight = { ...insight, ...JSON.parse(jsonMatch[0]) }; } catch { /* use defaults */ }
  }

  // Save score to DB
  await prisma.leadScore.upsert({
    where: { leadId: lead.id },
    update: {
      overallScore: insight.score,
      closeProbability: insight.closeProbability,
      reasoning: insight.reasoning,
      nextBestAction: insight.nextAction,
      scoredAt: new Date(),
    },
    create: {
      leadId: lead.id,
      overallScore: insight.score,
      closeProbability: insight.closeProbability,
      reasoning: insight.reasoning,
      nextBestAction: insight.nextAction,
    },
  });

  return NextResponse.json({ success: true, data: { leadId: lead.id, leadName: lead.name, ...insight } });
});
