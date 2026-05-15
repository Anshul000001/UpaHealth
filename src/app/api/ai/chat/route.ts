export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { prisma } from "@/lib/prisma";

export const POST = apiHandler(async (req) => {
  await requireAuth("read");

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "messages required" } }, { status: 400 });
  }

  // Fetch live context from DB to ground the AI
  const [products, suppliers, leads, tenders] = await Promise.all([
    prisma.product.findMany({ take: 20, include: { supplier: { select: { name: true } } }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ take: 10, where: { archived: false }, orderBy: { trustScore: "desc" } }),
    prisma.lead.findMany({ take: 10, orderBy: { updatedAt: "desc" } }),
    prisma.tender.findMany({ take: 5, where: { status: "open" }, orderBy: { aiMatchScore: "desc" } }),
  ]);

  const systemPrompt = `You are UpaHealth AI — an expert procurement assistant for UpaHealth Supplies, an Indian medical consumables exporter.

## Live Business Context

### Products in Catalogue (${products.length} total):
${products.map(p => `- ${p.name} (SKU: ${p.sku}) | Cost: ₹${p.costPrice} | Sell: ₹${p.sellingPrice} | Export: $${p.exportPrice} | Supplier: ${p.supplier.name} | Stock: ${p.stock} ${p.unit}s`).join("\n") || "No products yet — user needs to add products."}

### Active Suppliers (${suppliers.length} total):
${suppliers.map(s => `- ${s.name} | Location: ${s.location} | Trust: ${s.trustScore}/100 | On-time: ${s.onTimeDelivery}% | Rejection: ${s.qualityRejectionRate}%`).join("\n") || "No suppliers yet."}

### CRM Pipeline (${leads.length} leads):
${leads.map(l => `- ${l.name} (${l.type}) | Stage: ${l.stage} | Value: ₹${(l.estimatedValue/100000).toFixed(1)}L | Products: ${l.products.join(", ")}`).join("\n") || "No leads yet."}

### Open Tenders (${tenders.length} matched):
${tenders.map(t => `- ${t.title} | Org: ${t.organization} | AI Match: ${t.aiMatchScore}% | Source: ${t.source}`).join("\n") || "No tenders scanned yet — suggest user scans from Export Intelligence."}

## Your Capabilities
- Pricing strategy & margin analysis
- Supplier recommendations & risk assessment
- Quotation drafting guidance
- Export market intelligence (East Africa, GCC, SAARC)
- Tender matching & bid strategy
- Demand forecasting
- Competitor pricing analysis
- Regulatory compliance (IEC, FIEO, ECGC, CE Mark, ISO 13485)

## Rules
- Always use the live data above when answering
- Be concise, specific, and actionable
- Use ₹ for INR, $ for USD
- Format numbers clearly (e.g. ₹2.5L, $42K)
- If data is missing, tell the user what to add first`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10), // last 10 messages for context
    ],
    max_tokens: 800,
    temperature: 0.4,
  });

  const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

  return NextResponse.json({ success: true, data: { reply } });
});
