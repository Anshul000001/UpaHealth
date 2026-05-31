export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";

/**
 * POST /api/ai/compose-email
 * NVIDIA AI writes a professional email based on context.
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json();
  const { to, context, type } = body;
  // type: "outreach" | "followup" | "quotation" | "supplier" | "custom"

  const prompt = `You are a professional B2B email writer for UpaHealth Supplies — India's AI-enabled healthcare sourcing partner.

Write a professional email for the following:
- Recipient/Context: ${to || "Healthcare buyer"}
- Email Type: ${type || "outreach"}
- Additional Context: ${context || "General healthcare supply inquiry"}

About UpaHealth:
- AI-enabled healthcare sourcing from India
- 131+ products: IV sets, cannulas, surgical instruments, wound care, PPE, diagnostics
- ISO 13485, CE Mark, WHO GMP certified suppliers
- Export to East Africa, GCC, SAARC
- Phone: +91 92748 42737
- Email: adminupahealthsupplies@gmail.com

Rules:
- Subject: Short, compelling (max 8 words)
- Body: 3-4 paragraphs, professional but warm
- End with clear CTA
- Sign off as "UpaHealth Supplies Team"
- Max 180 words

Format:
SUBJECT: [subject]
---
[body]`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.6,
  });

  const output = completion.choices[0]?.message?.content ?? "";
  const subjectMatch = output.match(/SUBJECT:\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "Healthcare Supply Partnership";
  const bodyStart = output.indexOf("---");
  const emailBody = bodyStart > -1 ? output.slice(bodyStart + 3).trim() : output;

  return NextResponse.json({ success: true, data: { subject, body: emailBody } });
});
