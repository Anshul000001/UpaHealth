export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";

/**
 * POST /api/leads/:id/email
 * Generates a personalized outreach email for a lead using AI.
 * Saves it to outreach_emails table.
 */
export const POST = apiHandler(async (_req, { params }) => {
  await requireAuth("write");
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });
  }

  const prompt = `You are a professional B2B sales email writer for UpaHealth Supplies — India's AI-enabled healthcare sourcing partner.

Write a personalized cold outreach email to this lead:
- Organization: ${lead.name}
- Type: ${lead.type}
- Contact Person: ${lead.contactPerson}
- Products of Interest: ${lead.products.join(", ") || "Medical consumables"}
- Estimated Value: ₹${(lead.estimatedValue / 100000).toFixed(1)}L

About UpaHealth:
- AI-enabled healthcare sourcing company from India
- 131+ products: IV sets, cannulas, surgical instruments, wound care, PPE, diagnostics
- ISO 13485, CE Mark, WHO GMP certified suppliers
- Export to East Africa, GCC, SAARC
- Competitive pricing with bulk supply capability
- Email: adminupahealthsupplies@gmail.com

Rules:
- Subject line: Short, compelling, personalized (max 8 words)
- Body: 4-5 short paragraphs, professional but warm
- Include specific product mention relevant to their needs
- End with clear CTA (schedule a call or request catalogue)
- Sign off as "UpaHealth Supplies Team"
- Keep under 200 words

Respond in this exact format:
SUBJECT: [subject line]
---
[email body]`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.6,
  });

  const output = completion.choices[0]?.message?.content ?? "";

  // Parse subject and body
  const subjectMatch = output.match(/SUBJECT:\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : `Healthcare Supply Partnership — ${lead.name}`;
  const bodyStart = output.indexOf("---");
  const body = bodyStart > -1 ? output.slice(bodyStart + 3).trim() : output;

  // Save to outreach_emails
  const email = await prisma.outreachEmail.create({
    data: {
      leadId: lead.id,
      subject,
      body,
      status: "draft",
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: email.id,
      leadId: lead.id,
      leadName: lead.name,
      subject,
      body,
      status: "draft",
    },
  }, { status: 201 });
});

/**
 * GET /api/leads/:id/email
 * Returns all outreach emails for a lead.
 */
export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;

  const emails = await prisma.outreachEmail.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: emails });
});
