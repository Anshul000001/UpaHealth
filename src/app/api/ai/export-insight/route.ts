export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ai/export-insight
 * NVIDIA AI analyzes export opportunities and generates buyer intelligence.
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json();
  const { market, query } = body;

  const products = await prisma.product.findMany({
    take: 20,
    select: { name: true, category: true, exportPrice: true },
    orderBy: { name: "asc" },
  });

  const topProducts = products.slice(0, 10).map(p => `${p.name} ($${p.exportPrice})`).join(", ");

  const prompt = `You are an export intelligence analyst for UpaHealth Supplies — Indian medical consumables exporter.

Target Market: ${market || "East Africa"}
Query: ${query || "Find best export opportunities"}

Our Top Export Products: ${topProducts}

Provide export intelligence:
1. Top 3 buyer types in this market
2. Key procurement channels (government, private, NGO)
3. Regulatory requirements for medical devices
4. Pricing strategy recommendation
5. Top 3 specific organizations to target
6. Best approach for market entry

Respond in JSON:
{
  "buyerTypes": ["type1", "type2", "type3"],
  "channels": ["channel1", "channel2"],
  "regulations": ["reg1", "reg2"],
  "pricingStrategy": "recommendation",
  "targetOrgs": [
    {"name": "org", "type": "type", "why": "reason"}
  ],
  "marketEntry": "strategy",
  "summary": "2-sentence market summary"
}`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0.3,
  });

  const output = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = output.match(/\{[\s\S]*\}/);

  let insight = {
    buyerTypes: [], channels: [], regulations: [],
    pricingStrategy: "", targetOrgs: [], marketEntry: "", summary: output.slice(0, 200),
  };

  if (jsonMatch) {
    try { insight = { ...insight, ...JSON.parse(jsonMatch[0]) }; } catch { /* use defaults */ }
  }

  return NextResponse.json({ success: true, data: { market, ...insight } });
});
