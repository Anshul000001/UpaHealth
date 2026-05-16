export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";

export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json().catch(() => ({}));
  const market = body.market ?? "India";
  const segment = body.segment ?? "Hospital";
  const productFocus = body.productFocus ?? "IV Infusion Sets, Surgical Instruments";
  const count = Math.min(parseInt(body.count ?? "10"), 20);

  // Get our product categories for context
  const products = await prisma.product.findMany({
    take: 30,
    select: { name: true, category: true },
    orderBy: { name: "asc" },
  });

  const categories = [...new Set(products.map((p) => p.category))];

  const prompt = `You are a healthcare B2B lead generation expert for UpaHealth Supplies, an Indian medical consumables exporter.

## Our Product Categories:
${categories.join(", ")}

## Task:
Generate ${count} realistic potential buyer leads for the following criteria:
- Market: ${market}
- Segment: ${segment}
- Product Focus: ${productFocus}

For each lead, provide:
1. Organization name (realistic hospital/distributor/government body name)
2. Type: HOSPITAL, GOVERNMENT, DISTRIBUTOR, or HOSPITAL_CHAIN
3. Contact person name (realistic for the region)
4. Email (realistic format)
5. Phone (realistic format for the country)
6. Estimated annual procurement value in INR
7. Products they likely need (from our categories)
8. City/Region
9. Why they're a good lead (1 sentence)

IMPORTANT: Generate realistic, plausible leads based on actual healthcare market knowledge for ${market}. Use real city names, realistic organization naming patterns, and appropriate contact formats.

Respond ONLY with a JSON array:
[
  {
    "name": "Organization Name",
    "type": "HOSPITAL",
    "contactPerson": "Dr. Name",
    "email": "procurement@org.com",
    "phone": "+91 98765 43210",
    "estimatedValue": 500000,
    "products": ["IV Infusion Sets", "Surgical Instruments"],
    "city": "City, State",
    "reasoning": "Why this is a good lead"
  }
]`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const output = completion.choices[0]?.message?.content ?? "";

  // Parse the JSON array from AI output
  const jsonMatch = output.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({
      success: false,
      error: { code: "AI_PARSE_ERROR", message: "AI did not return valid leads. Try again." },
    }, { status: 500 });
  }

  let leads: Array<{
    name: string;
    type: string;
    contactPerson: string;
    email?: string;
    phone?: string;
    estimatedValue: number;
    products: string[];
    city?: string;
    reasoning?: string;
  }>;

  try {
    leads = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({
      success: false,
      error: { code: "AI_PARSE_ERROR", message: "Could not parse AI response. Try again." },
    }, { status: 500 });
  }

  // Save leads to database
  const saved = [];
  for (const lead of leads) {
    try {
      const validType = ["HOSPITAL", "GOVERNMENT", "DISTRIBUTOR", "HOSPITAL_CHAIN"].includes(lead.type)
        ? lead.type as "HOSPITAL" | "GOVERNMENT" | "DISTRIBUTOR" | "HOSPITAL_CHAIN"
        : "HOSPITAL";

      const created = await prisma.lead.create({
        data: {
          name: lead.name,
          type: validType,
          contactPerson: lead.contactPerson ?? "Unknown",
          email: lead.email || null,
          phone: lead.phone || null,
          estimatedValue: lead.estimatedValue ?? 0,
          products: Array.isArray(lead.products) ? lead.products : [],
          stage: "Lead",
        },
      });
      saved.push({ ...created, city: lead.city, reasoning: lead.reasoning });
    } catch {
      // Skip duplicates or invalid entries
    }
  }

  // Log activity
  try {
    const agent = await prisma.aIAgent.findUnique({ where: { name: "Sales" } });
    if (agent) {
      await prisma.aIActivity.create({
        data: {
          agentId: agent.id,
          action: "generated_leads",
          details: { market, segment, productFocus, count: saved.length },
          success: true,
        },
      });
    }
  } catch {
    // non-critical
  }

  return NextResponse.json({
    success: true,
    data: {
      generated: leads.length,
      saved: saved.length,
      leads: saved,
    },
  }, { status: 201 });
});
